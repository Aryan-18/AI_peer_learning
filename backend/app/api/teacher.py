import io
import json
import csv
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.models.academic import Subject, AcademicRecord
from app.models.pairing import Pairing
from app.core.deps import require_teacher
from app.services.excel_parser import validate_and_parse_student_file, validate_and_parse_record_dicts
from app.services.matching_service import run_ai_peer_matching
from app.schemas.academic import UploadResult, DirectRecordsBatch
from app.schemas.pairing import RunMatchingRequest, PairingOut, StudentBrief, MilestoneItem
from app.ai.vectorizer import get_max_marks_for_subject

router = APIRouter(prefix="/teacher", tags=["Teacher Portal"])

@router.post("/upload", response_model=UploadResult)
async def upload_student_records(
    file: UploadFile = File(...),
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Teacher Excel/CSV file upload endpoint.
    Strictly verifies credit-to-marks limits and institutional domain.
    """
    filename = file.filename.lower() if file.filename else ""
    if not (filename.endswith(".xlsx") or filename.endswith(".xls") or filename.endswith(".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload an Excel (.xlsx/.xls) or CSV (.csv) file."
        )

    file_bytes = await file.read()
    result = validate_and_parse_student_file(
        file_bytes=file_bytes,
        filename=filename,
        db=db,
        commit_if_valid=True
    )
    return result

@router.post("/direct-fill", response_model=UploadResult)
def direct_fill_student_records(
    payload: DirectRecordsBatch,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Direct web spreadsheet student records ingestion endpoint.
    Allows faculty to fill records directly in the web UI.
    Applies identical institutional domain (@pccoepune.org) and credit-aware marks caps.
    """
    if not payload.records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No student records provided. Please add at least one row."
        )
    result = validate_and_parse_record_dicts(
        records=payload.records,
        db=db,
        commit_if_valid=True
    )
    return result

@router.get("/sample-template")
def download_sample_template():
    """
    Generates and downloads a pre-formatted Excel template conforming
    to all PCCOE Pune institutional schema and credit rules.
    """
    sample_rows = [
        {
            "Name": "Student 1",
            "PRN": "122B1B001",
            "Email": "student1@pccoepune.org",
            "Subject_Code": "CS301",
            "Subject_Name": "Machine Learning",
            "Subject_Type": "Theory",
            "Credits": 3,
            "FA1": 22.0,
            "FA2": 24.0,
            "SA": 45.0,
            "Attendance": 92.5,
            "Certifications_Count": 2,
            "External_Courses": "DeepLearning.AI Spec, AWS ML"
        },
        {
            "Name": "Student 2",
            "PRN": "122B1B002",
            "Email": "student2@pccoepune.org",
            "Subject_Code": "CS301",
            "Subject_Name": "Machine Learning",
            "Subject_Type": "Theory",
            "Credits": 3,
            "FA1": 10.0,
            "FA2": 12.0,
            "SA": 18.0,
            "Attendance": 74.0,
            "Certifications_Count": 0,
            "External_Courses": ""
        },
        {
            "Name": "Student 3",
            "PRN": "122B1B003",
            "Email": "student3@pccoepune.org",
            "Subject_Code": "CS302L",
            "Subject_Name": "Cloud Computing Lab",
            "Subject_Type": "Lab",
            "Credits": 2,
            "FA1": 12.0,
            "FA2": 14.0,
            "SA": 20.0,
            "Attendance": 88.0,
            "Certifications_Count": 1,
            "External_Courses": "Google Cloud Associate"
        },
        {
            "Name": "Student 4",
            "PRN": "122B1B004",
            "Email": "student4@pccoepune.org",
            "Subject_Code": "CS303",
            "Subject_Name": "Database Systems",
            "Subject_Type": "Theory",
            "Credits": 2,
            "FA1": 11.0,
            "FA2": 13.0,
            "SA": 22.0,
            "Attendance": 82.0,
            "Certifications_Count": 1,
            "External_Courses": "MongoDB Developer"
        }
    ]

    df = pd.DataFrame(sample_rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="StudentRecords")
    output.seek(0)

    headers = {
        "Content-Disposition": 'attachment; filename="pccoe_student_upload_template.xlsx"'
    }
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

@router.get("/students")
def get_all_students(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """Returns directory of students with their enrolled subjects and performance."""
    students = db.query(StudentProfile).all()
    results = []

    for s in students:
        u = s.user
        records = []
        for r in s.academic_records:
            sub = r.subject
            max_m = get_max_marks_for_subject(sub.subject_type, sub.credits)
            records.append({
                "id": r.id,
                "subject_code": sub.code,
                "subject_name": sub.name,
                "subject_type": sub.subject_type,
                "credits": sub.credits,
                "fa1": r.fa1,
                "fa2": r.fa2,
                "sa": r.sa,
                "total_marks": r.total_marks,
                "max_marks": max_m,
                "attendance_pct": r.attendance_pct,
                "certs_count": r.certs_count,
                "external_courses": r.external_courses
            })

        results.append({
            "id": s.id,
            "user_id": u.id,
            "name": u.full_name,
            "email": u.email,
            "prn": s.prn,
            "department": s.department,
            "year": s.year,
            "semester": s.semester,
            "records": records
        })

    return results

@router.post("/run-matching")
def trigger_ai_matching(
    req: RunMatchingRequest,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Executes Scikit-Learn based AI Peer-Matching engine.
    Supports 'complementary' (weak + strong) and 'balanced' (peer equivalence).
    """
    pairings = run_ai_peer_matching(
        db=db,
        subject_id=req.subject_id,
        strategy=req.strategy
    )
    return {
        "success": True,
        "message": f"Successfully generated {len(pairings)} pairings using {req.strategy.upper()} strategy.",
        "pairings_count": len(pairings)
    }

def format_pairing_response(p: Pairing) -> dict:
    sub = p.subject
    mentor = p.mentor
    mentee = p.mentee
    
    milestones = []
    if p.project_milestones_json:
        try:
            milestones = json.loads(p.project_milestones_json)
        except Exception:
            milestones = []

    return {
        "id": p.id,
        "subject_id": sub.id,
        "subject_code": sub.code,
        "subject_name": sub.name,
        "strategy": p.strategy,
        "match_score": p.match_score,
        "ai_rationale": p.ai_rationale,
        "collaboration_prompt": p.collaboration_prompt,
        "mentor": {
            "id": mentor.id,
            "prn": mentor.prn,
            "name": mentor.user.full_name,
            "email": mentor.user.email,
            "department": mentor.department
        },
        "mentee": {
            "id": mentee.id,
            "prn": mentee.prn,
            "name": mentee.user.full_name,
            "email": mentee.user.email,
            "department": mentee.department
        },
        "recommended_project_title": p.recommended_project_title,
        "project_domain": p.project_domain,
        "project_description": p.project_description,
        "project_tech_stack": p.project_tech_stack,
        "milestones": milestones,
        "created_at": p.created_at
    }

@router.get("/pairings")
def get_all_pairings(
    subject_id: Optional[int] = None,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """Returns all active pairings."""
    query = db.query(Pairing)
    if subject_id:
        query = query.filter(Pairing.subject_id == subject_id)
    pairings = query.order_by(Pairing.created_at.desc()).all()
    return [format_pairing_response(p) for p in pairings]

@router.get("/export-pairings")
def export_pairings_csv(
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """Exports generated pairings into a downloadable CSV."""
    pairings = db.query(Pairing).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Pairing_ID", "Subject_Code", "Subject_Name", "Strategy", "Match_Score",
        "Mentor_Name", "Mentor_PRN", "Mentor_Email",
        "Mentee_Name", "Mentee_PRN", "Mentee_Email",
        "Recommended_Project", "Project_Domain", "AI_Rationale"
    ])

    for p in pairings:
        writer.writerow([
            p.id, p.subject.code, p.subject.name, p.strategy, f"{p.match_score}%",
            p.mentor.user.full_name, p.mentor.prn, p.mentor.user.email,
            p.mentee.user.full_name, p.mentee.prn, p.mentee.user.email,
            p.recommended_project_title, p.project_domain, p.ai_rationale
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="pccoe_peer_pairings.csv"'}
    )
