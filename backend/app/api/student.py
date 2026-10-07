import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.academic import Subject, AcademicRecord
from app.models.pairing import Pairing
from app.core.deps import require_student
from app.schemas.pairing import MilestoneUpdate
from app.schemas.academic import StudentAcademicProfileUpdate, SelectElectiveRequest
from app.ai.vectorizer import get_max_marks_for_subject
from app.core.curriculum import (
    resolve_student_subjects,
    get_curriculum_for_student,
    normalize_semester_name,
    normalize_year_name,
    CURRICULUM_DATA,
)

router = APIRouter(prefix="/student", tags=["Student Portal"])

@router.get("/dashboard")
def get_student_dashboard(
    student_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Returns student profile, dynamic semester-wise curriculum subjects (with credits,
    maximum marks, course codes, course names, and selected electives),
    academic records, and assigned peer partnerships.
    """
    profile = student_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    # 1. Parse student's selected electives
    selected_electives = {}
    if profile.selected_electives_json:
        try:
            selected_electives = json.loads(profile.selected_electives_json)
        except Exception:
            selected_electives = {}

    # 2. Dynamically resolve semester curriculum subjects for student's Year + Semester + Scheme
    clean_year = normalize_year_name(str(profile.year)) if profile.year else "Second Year (SY)"
    clean_sem = normalize_semester_name(str(profile.semester)) if profile.semester else "Semester III"
    clean_scheme = profile.scheme or ("Scheme A" if "Final" in str(clean_year) else None)

    resolved_subjects = resolve_student_subjects(
        year=clean_year,
        semester=clean_sem,
        scheme=clean_scheme,
        selected_electives=selected_electives
    )

    total_credits = sum(s.get("credits", 0) for s in resolved_subjects)
    total_max_marks = sum(s.get("max_marks", 0) for s in resolved_subjects)

    # 3. Fetch academic records map for this student
    academic_records_map = {}
    for r in profile.academic_records:
        sub = r.subject
        academic_records_map[sub.code] = {
            "id": r.id,
            "subject_id": sub.id,
            "subject_code": sub.code,
            "subject_name": sub.name,
            "subject_type": sub.subject_type,
            "credits": sub.credits,
            "fa1": r.fa1,
            "fa2": r.fa2,
            "sa": r.sa,
            "total_marks": r.total_marks,
            "max_marks": sub.max_marks or get_max_marks_for_subject(sub.subject_type, sub.credits),
            "attendance_pct": r.attendance_pct,
            "certs_count": r.certs_count,
            "external_courses": r.external_courses
        }

    # Attach any existing record scores directly to the resolved curriculum subjects
    curriculum_with_marks = []
    for s in resolved_subjects:
        code = s["code"]
        record = academic_records_map.get(code)
        curriculum_with_marks.append({
            **s,
            "enrolled": True,
            "current_record": record if record else None
        })

    # 4. Find pairings where this student is mentor or mentee
    pairings = db.query(Pairing).filter(
        (Pairing.mentor_student_id == profile.id) | (Pairing.mentee_student_id == profile.id)
    ).all()

    formatted_pairings = []
    for p in pairings:
        is_mentor = (p.mentor_student_id == profile.id)
        peer = p.mentee if is_mentor else p.mentor
        peer_user = peer.user

        peer_rec = db.query(AcademicRecord).filter(
            AcademicRecord.student_id == peer.id,
            AcademicRecord.subject_id == p.subject_id
        ).first()

        my_rec = db.query(AcademicRecord).filter(
            AcademicRecord.student_id == profile.id,
            AcademicRecord.subject_id == p.subject_id
        ).first()

        milestones = []
        if p.project_milestones_json:
            try:
                milestones = json.loads(p.project_milestones_json)
            except Exception:
                milestones = []

        formatted_pairings.append({
            "pairing_id": p.id,
            "subject_id": p.subject.id,
            "subject_code": p.subject.code,
            "subject_name": p.subject.name,
            "strategy": p.strategy,
            "match_score": p.match_score,
            "my_role": "Mentor" if is_mentor else "Mentee",
            "peer": {
                "id": peer.id,
                "name": peer_user.full_name,
                "email": peer_user.email,
                "prn": peer.prn,
                "department": peer.department,
                "year": peer.year,
                "role_in_pair": "Mentee" if is_mentor else "Mentor"
            },
            "comparison": {
                "my_marks": my_rec.total_marks if my_rec else 0,
                "peer_marks": peer_rec.total_marks if peer_rec else 0,
                "my_attendance": my_rec.attendance_pct if my_rec else 0,
                "peer_attendance": peer_rec.attendance_pct if peer_rec else 0,
                "my_certs": my_rec.certs_count if my_rec else 0,
                "peer_certs": peer_rec.certs_count if peer_rec else 0,
            },
            "ai_rationale": p.ai_rationale,
            "collaboration_prompt": p.collaboration_prompt,
            "project": {
                "title": p.recommended_project_title,
                "domain": p.project_domain,
                "description": p.project_description,
                "tech_stack": p.project_tech_stack,
                "milestones": milestones
            }
        })

    return {
        "student": {
            "id": profile.id,
            "name": student_user.full_name,
            "email": student_user.email,
            "prn": str(profile.prn) if profile.prn is not None else None,
            "department": profile.department,
            "year": clean_year,
            "semester": clean_sem,
            "scheme": clean_scheme,
            "selected_electives": selected_electives
        },
        "curriculum": {
            "year": clean_year,
            "semester": clean_sem,
            "scheme": clean_scheme,
            "subjects": curriculum_with_marks,
            "total_credits": total_credits,
            "total_max_marks": total_max_marks,
            "has_electives": any(s.get("is_elective") for s in resolved_subjects)
        },
        "academic_records": list(academic_records_map.values()),
        "pairings": formatted_pairings
    }

@router.post("/update-academic-profile")
def update_academic_profile(
    req: StudentAcademicProfileUpdate,
    student_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Updates student's Year, Semester, Scheme (if Final Year),
    and selected elective courses. Saves to database and returns fresh curriculum.
    """
    profile = student_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    norm_yr = normalize_year_name(str(req.year))
    norm_sem = normalize_semester_name(str(req.semester))
    profile.year = norm_yr
    profile.semester = norm_sem
    if "final" in norm_yr.lower():
        profile.scheme = req.scheme or "Scheme A"
    else:
        profile.scheme = None

    if req.selected_electives is not None:
        try:
            curr_electives = json.loads(profile.selected_electives_json or "{}")
        except Exception:
            curr_electives = {}
        curr_electives.update(req.selected_electives)
        profile.selected_electives_json = json.dumps(curr_electives)

    db.commit()
    db.refresh(profile)

    return get_student_dashboard(student_user=student_user, db=db)

@router.post("/select-elective")
def select_elective(
    req: SelectElectiveRequest,
    student_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Updates the student's selected elective choice for a specific elective group
    (e.g., PE-I, PE-I Lab, PE-II, PE-II Lab, PE-IV, PE-IV Lab, PE-V).
    """
    profile = student_user.student_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    try:
        current_electives = json.loads(profile.selected_electives_json or "{}")
    except Exception:
        current_electives = {}

    current_electives[req.elective_group] = req.course_code
    profile.selected_electives_json = json.dumps(current_electives)
    db.commit()

    return get_student_dashboard(student_user=student_user, db=db)

@router.get("/curriculum")
def get_curriculum(
    year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    scheme: Optional[str] = Query(None),
    student_user: User = Depends(require_student)
):
    """
    Returns available curriculum and elective options for the specified or student's current year/semester/scheme.
    """
    profile = student_user.student_profile
    raw_yr = year or (profile.year if profile else "Second Year (SY)")
    raw_sem = semester or (profile.semester if profile else "Semester III")
    target_year = normalize_year_name(str(raw_yr))
    target_sem = normalize_semester_name(str(raw_sem))
    target_scheme = scheme or (profile.scheme if profile else ("Scheme A" if "Final" in str(target_year) else None))

    electives = {}
    if profile and profile.selected_electives_json:
        try:
            electives = json.loads(profile.selected_electives_json)
        except Exception:
            electives = {}

    subjects = resolve_student_subjects(
        year=target_year,
        semester=target_sem,
        scheme=target_scheme,
        selected_electives=electives
    )

    return {
        "year": target_year,
        "semester": target_sem,
        "scheme": target_scheme,
        "subjects": subjects,
        "total_credits": sum(s.get("credits", 0) for s in subjects),
        "total_max_marks": sum(s.get("max_marks", 0) for s in subjects)
    }

@router.post("/update-milestone")
def update_milestone_status(
    req: MilestoneUpdate,
    student_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Updates completion status of a project milestone for the pair.
    """
    profile = student_user.student_profile
    pairing = db.query(Pairing).filter(Pairing.id == req.pairing_id).first()
    if not pairing:
        raise HTTPException(status_code=404, detail="Pairing not found.")

    if profile.id not in [pairing.mentor_student_id, pairing.mentee_student_id]:
        raise HTTPException(status_code=403, detail="You are not part of this pairing.")

    try:
        milestones = json.loads(pairing.project_milestones_json or "[]")
        if 0 <= req.milestone_index < len(milestones):
            milestones[req.milestone_index]["completed"] = req.completed
            pairing.project_milestones_json = json.dumps(milestones)
            db.commit()
            return {"success": True, "milestones": milestones}
        else:
            raise HTTPException(status_code=400, detail="Invalid milestone index.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

