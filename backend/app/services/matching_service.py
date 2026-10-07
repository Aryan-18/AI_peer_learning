import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.academic import Subject, AcademicRecord
from app.models.student import StudentProfile
from app.models.pairing import Pairing
from app.ai.vectorizer import vectorize_student_records
from app.ai.matcher import compute_complementary_pairings, compute_balanced_pairings
from app.ai.rationale_gen import generate_pairing_rationale
from app.ai.project_recommender import recommend_project_for_pair

def run_ai_peer_matching(
    db: Session,
    subject_id: Optional[int] = None,
    strategy: str = "complementary"
) -> List[Pairing]:
    """
    Executes the end-to-end AI Peer-Matching pipeline:
    1. Fetches academic records
    2. Vectorizes skill profiles
    3. Executes chosen pairing strategy
    4. Generates AI rationales and micro-project recommendations
    5. Persists pairings to DB
    """
    subjects_to_process = []
    if subject_id:
        sub = db.query(Subject).filter(Subject.id == subject_id).first()
        if sub:
            subjects_to_process.append(sub)
    else:
        subjects_to_process = db.query(Subject).all()

    all_created_pairings = []

    for subject in subjects_to_process:
        # Fetch all records for this subject
        records = db.query(AcademicRecord).filter(AcademicRecord.subject_id == subject.id).all()
        if len(records) < 2:
            continue

        # Format records for vectorizer
        raw_data = []
        for r in records:
            student = r.student
            user = student.user
            raw_data.append({
                "student_id": student.id,
                "user_id": user.id,
                "prn": student.prn,
                "name": user.full_name,
                "email": user.email,
                "department": student.department,
                "subject_id": subject.id,
                "subject_code": subject.code,
                "subject_name": subject.name,
                "subject_type": subject.subject_type,
                "credits": subject.credits,
                "fa1": r.fa1,
                "fa2": r.fa2,
                "sa": r.sa,
                "total_marks": r.total_marks,
                "attendance_pct": r.attendance_pct,
                "certs_count": r.certs_count,
                "external_courses": r.external_courses
            })

        df = vectorize_student_records(raw_data)
        if df.empty or len(df) < 2:
            continue

        # Delete existing pairings for this subject to refresh
        db.query(Pairing).filter(Pairing.subject_id == subject.id).delete()
        db.flush()

        # Run strategy
        if strategy.lower() == "balanced":
            raw_pairs = compute_balanced_pairings(df)
        else:
            raw_pairs = compute_complementary_pairings(df)

        for p in raw_pairs:
            mentor_dict = p["mentor"]
            mentee_dict = p["mentee"]
            score = p["match_score"]

            # AI Rationale
            rationale_data = generate_pairing_rationale(
                mentor=mentor_dict,
                mentee=mentee_dict,
                subject_name=subject.name,
                strategy=strategy
            )

            # Micro-Project Recommendation
            project = recommend_project_for_pair(
                subject_name=subject.name,
                mentor_proficiency=float(mentor_dict.get("composite_proficiency", 0.7)),
                mentee_proficiency=float(mentee_dict.get("composite_proficiency", 0.5)),
                strategy=strategy
            )

            pairing_obj = Pairing(
                mentor_student_id=int(mentor_dict["student_id"]),
                mentee_student_id=int(mentee_dict["student_id"]),
                subject_id=subject.id,
                strategy=strategy,
                match_score=score,
                ai_rationale=rationale_data["ai_rationale"],
                collaboration_prompt=rationale_data["collaboration_prompt"],
                recommended_project_title=project["title"],
                project_domain=project["domain"],
                project_description=project["description"],
                project_tech_stack=project["tech_stack"],
                project_milestones_json=json.dumps(project["milestones"])
            )
            db.add(pairing_obj)
            db.flush()
            all_created_pairings.append(pairing_obj)

    db.commit()
    return all_created_pairings
