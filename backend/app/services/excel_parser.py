import pandas as pd
import io
import re
from typing import Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.student import StudentProfile
from app.models.academic import Subject, AcademicRecord
from app.core.security import hash_password
from app.config import settings

REQUIRED_COLUMNS = ["name", "prn", "email", "subject_code", "subject_type", "credits", "fa1", "fa2", "sa"]

def normalize_column_name(col: str) -> str:
    """Normalize dataframe header strings."""
    c = str(col).strip().lower().replace(" ", "_").replace("-", "_").replace(".", "_")
    mappings = {
        "student_name": "name",
        "full_name": "name",
        "prn_number": "prn",
        "student_prn": "prn",
        "student_email": "email",
        "institutional_email": "email",
        "course_code": "subject_code",
        "code": "subject_code",
        "course_name": "subject_name",
        "subject": "subject_name",
        "type": "subject_type",
        "credit": "credits",
        "fa_1": "fa1",
        "fa1_marks": "fa1",
        "fa_2": "fa2",
        "fa2_marks": "fa2",
        "sa_marks": "sa",
        "summative_assessment": "sa",
        "attendance_pct": "attendance",
        "attendance_percentage": "attendance",
        "certifications": "certs_count",
        "certifications_count": "certs_count",
        "certs": "certs_count",
        "external_courses_completed": "external_courses",
        "courses": "external_courses"
    }
    return mappings.get(c, c)

def validate_and_process_records_df(
    df: pd.DataFrame,
    db: Session,
    commit_if_valid: bool = True,
    row_offset: int = 2
) -> Dict[str, Any]:
    """
    Core validation and ingestion pipeline for student academic records dataframe.
    Enforces institutional domain (@pccoepune.org) and Credit-Aware Theory/Lab marks caps.
    """
    if df.empty:
        return {
            "success": False,
            "total_rows": 0,
            "valid_rows_processed": 0,
            "new_students_created": 0,
            "records_updated": 0,
            "errors": [{"row": 0, "field": "data", "error": "No student records provided to process."}]
        }

    # Normalize column names
    df.columns = [normalize_column_name(c) for c in df.columns]

    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        return {
            "success": False,
            "total_rows": len(df),
            "valid_rows_processed": 0,
            "new_students_created": 0,
            "records_updated": 0,
            "errors": [{
                "row": 0,
                "field": "columns",
                "error": f"Missing mandatory columns: {', '.join(missing_cols)}. Data had: {', '.join(df.columns)}"
            }]
        }

    errors: List[Dict[str, Any]] = []
    validated_records = []
    
    for idx, row in df.iterrows():
        excel_row_num = idx + row_offset
        name = str(row.get("name", "") or "").strip()
        prn = str(row.get("prn", "") or "").strip().upper()
        email = str(row.get("email", "") or "").strip().lower()
        sub_code = str(row.get("subject_code", "") or "").strip().upper()
        sub_name = str(row.get("subject_name", "") or "").strip()
        sub_type = str(row.get("subject_type", "") or "").strip().capitalize()
        
        # 1. Basic field presence checks
        if not name or name == "NAN":
            errors.append({"row": excel_row_num, "prn": prn, "field": "name", "error": "Student Name is required."})
        if not prn or prn == "NAN":
            errors.append({"row": excel_row_num, "field": "prn", "error": "PRN is required."})
        if not sub_code or sub_code == "NAN":
            errors.append({"row": excel_row_num, "prn": prn, "field": "subject_code", "error": "Subject Code is required."})
        
        # 2. Institutional Domain Validation
        allowed_suffix = f"@{settings.ALLOWED_DOMAIN.lower()}"
        if not email or email == "nan" or not email.endswith(allowed_suffix):
            errors.append({
                "row": excel_row_num,
                "prn": prn,
                "field": "email",
                "error": f"Institutional domain violation: Email '{email}' must strictly end with @{settings.ALLOWED_DOMAIN}."
            })

        # 3. Subject Type and Credits Validation
        if sub_type not in ["Theory", "Lab"]:
            errors.append({
                "row": excel_row_num,
                "prn": prn,
                "field": "subject_type",
                "error": f"Subject type must be either 'Theory' or 'Lab' (found '{sub_type}')."
            })
            sub_type = "Theory"

        try:
            credits = int(row.get("credits", 3))
            if credits not in [1, 2, 3]:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "field": "credits",
                    "error": f"Invalid credit value: {credits}. Only 1, 2, or 3 credits are supported."
                })
        except (ValueError, TypeError):
            errors.append({"row": excel_row_num, "prn": prn, "field": "credits", "error": "Credits must be an integer (1, 2, or 3)."})
            credits = 3

        # 4. Marks Parsing
        try:
            fa1_val = row.get("fa1", 0)
            fa2_val = row.get("fa2", 0)
            sa_val = row.get("sa", 0)
            fa1 = float(0 if pd.isna(fa1_val) else fa1_val)
            fa2 = float(0 if pd.isna(fa2_val) else fa2_val)
            sa = float(0 if pd.isna(sa_val) else sa_val)
            if fa1 < 0 or fa2 < 0 or sa < 0:
                errors.append({"row": excel_row_num, "prn": prn, "field": "marks", "error": "Marks cannot be negative."})
        except (ValueError, TypeError):
            errors.append({"row": excel_row_num, "prn": prn, "field": "marks", "error": "FA1, FA2, and SA marks must be valid numbers."})
            fa1, fa2, sa = 0.0, 0.0, 0.0

        total_marks = fa1 + fa2 + sa

        # 5. Strict Marks Validation Guardrails (Credit-Aware Parsing Engine)
        if sub_type == "Theory":
            if credits == 2 and total_marks > 50.0:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "student": name,
                    "subject": sub_code,
                    "field": "total_marks",
                    "error": f"Theory 2-Credit Limit Violated: Total marks ({total_marks:.1f}) exceeds the maximum cap of 50. (FA1: {fa1}, FA2: {fa2}, SA: {sa})"
                })
            elif credits == 3 and total_marks > 100.0:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "student": name,
                    "subject": sub_code,
                    "field": "total_marks",
                    "error": f"Theory 3-Credit Limit Violated: Total marks ({total_marks:.1f}) exceeds the maximum cap of 100. (FA1: {fa1}, FA2: {fa2}, SA: {sa})"
                })
        elif sub_type == "Lab":
            if credits == 1 and total_marks > 25.0:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "student": name,
                    "subject": sub_code,
                    "field": "total_marks",
                    "error": f"Lab 1-Credit Limit Violated: Maximum lab marks ({total_marks:.1f}) strictly capped at 25."
                })
            elif credits == 2 and total_marks > 50.0:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "student": name,
                    "subject": sub_code,
                    "field": "total_marks",
                    "error": f"Lab 2-Credit Limit Violated: Maximum lab marks ({total_marks:.1f}) strictly capped at 50."
                })
            elif credits == 3 and total_marks > 100.0:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "student": name,
                    "subject": sub_code,
                    "field": "total_marks",
                    "error": f"Lab 3-Credit Limit Violated: Maximum lab marks ({total_marks:.1f}) strictly capped at 100."
                })

        # 6. Attendance Validation
        try:
            att_val = row.get("attendance", 85.0)
            attendance = float(85.0 if pd.isna(att_val) else att_val)
            if attendance < 0.0 or attendance > 100.0:
                errors.append({
                    "row": excel_row_num,
                    "prn": prn,
                    "field": "attendance",
                    "error": f"Attendance percentage ({attendance}%) must be between 0 and 100."
                })
        except (ValueError, TypeError):
            attendance = 85.0

        # 7. Supplemental Metrics
        try:
            certs_val = row.get("certs_count", 0)
            certs_count = int(0 if pd.isna(certs_val) else certs_val)
            if certs_count < 0:
                certs_count = 0
        except (ValueError, TypeError):
            certs_count = 0
        
        ext_val = row.get("external_courses", "")
        external_courses = "" if pd.isna(ext_val) else str(ext_val).strip()

        validated_records.append({
            "name": name,
            "prn": prn,
            "email": email,
            "subject_code": sub_code,
            "subject_name": sub_name or sub_code,
            "subject_type": sub_type,
            "credits": credits,
            "fa1": fa1,
            "fa2": fa2,
            "sa": sa,
            "total_marks": total_marks,
            "attendance": attendance,
            "certs_count": certs_count,
            "external_courses": external_courses
        })

    # If any error occurred, return diagnostics without saving to guarantee atomic validation
    if errors:
        return {
            "success": False,
            "total_rows": len(df),
            "valid_rows_processed": 0,
            "new_students_created": 0,
            "records_updated": 0,
            "errors": errors
        }

    if not commit_if_valid:
        return {
            "success": True,
            "total_rows": len(df),
            "valid_rows_processed": len(validated_records),
            "new_students_created": 0,
            "records_updated": 0,
            "errors": []
        }

    # Persist to database
    new_students_count = 0
    records_count = 0

    # Cache subjects and students in memory for fast lookup
    subject_map = {s.code: s for s in db.query(Subject).all()}
    
    for rec in validated_records:
        # 1. Subject creation/lookup
        sub = subject_map.get(rec["subject_code"])
        from app.ai.vectorizer import get_max_marks_for_subject
        calculated_max = float(get_max_marks_for_subject(rec["subject_type"], rec["credits"]))
        if not sub:
            sub = Subject(
                code=rec["subject_code"],
                name=rec["subject_name"],
                subject_type=rec["subject_type"],
                credits=rec["credits"],
                max_marks=calculated_max
            )
            db.add(sub)
            db.flush()
            subject_map[rec["subject_code"]] = sub
        else:
            # Update subject details if changed
            sub.name = rec["subject_name"]
            sub.subject_type = rec["subject_type"]
            sub.credits = rec["credits"]
            if not sub.max_marks:
                sub.max_marks = calculated_max

        # 2. User & Student Profile creation/lookup
        user = db.query(User).filter(User.email == rec["email"]).first()
        if not user:
            # Create user account with default password 'Student@123'
            user = User(
                email=rec["email"],
                full_name=rec["name"],
                password_hash=hash_password("Student@123"),
                role="student"
            )
            db.add(user)
            db.flush()
            
            student = StudentProfile(
                user_id=user.id,
                prn=rec["prn"],
                department="Computer Science Engineering (Artificial Intelligence & Machine Learning)",
                year="Third Year (TY)",
                semester="Semester V"
            )
            db.add(student)
            db.flush()
            new_students_count += 1
        else:
            student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
            if not student:
                student = StudentProfile(
                    user_id=user.id,
                    prn=rec["prn"],
                    department="Computer Science Engineering (Artificial Intelligence & Machine Learning)",
                    year="Third Year (TY)",
                    semester="Semester V"
                )
                db.add(student)
                db.flush()

        # 3. Upsert Academic Record
        acad_rec = db.query(AcademicRecord).filter(
            AcademicRecord.student_id == student.id,
            AcademicRecord.subject_id == sub.id
        ).first()

        if not acad_rec:
            acad_rec = AcademicRecord(
                student_id=student.id,
                subject_id=sub.id,
                fa1=rec["fa1"],
                fa2=rec["fa2"],
                sa=rec["sa"],
                total_marks=rec["total_marks"],
                attendance_pct=rec["attendance"],
                certs_count=rec["certs_count"],
                external_courses=rec["external_courses"]
            )
            db.add(acad_rec)
        else:
            acad_rec.fa1 = rec["fa1"]
            acad_rec.fa2 = rec["fa2"]
            acad_rec.sa = rec["sa"]
            acad_rec.total_marks = rec["total_marks"]
            acad_rec.attendance_pct = rec["attendance"]
            acad_rec.certs_count = rec["certs_count"]
            acad_rec.external_courses = rec["external_courses"]

        records_count += 1

    db.commit()

    return {
        "success": True,
        "total_rows": len(df),
        "valid_rows_processed": len(validated_records),
        "new_students_created": new_students_count,
        "records_updated": records_count,
        "errors": []
    }

def validate_and_parse_student_file(
    file_bytes: bytes,
    filename: str,
    db: Session,
    commit_if_valid: bool = True
) -> Dict[str, Any]:
    """
    Parses and validates Excel (.xlsx/.xls) or CSV student performance files.
    Enforces institutional domain (@pccoepune.org) and Credit-Aware Theory/Lab marks caps.
    """
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            df = pd.read_excel(io.BytesIO(file_bytes))
    except Exception as e:
        return {
            "success": False,
            "total_rows": 0,
            "valid_rows_processed": 0,
            "new_students_created": 0,
            "records_updated": 0,
            "errors": [{"row": 0, "field": "file", "error": f"Failed to parse file: {str(e)}"}]
        }

    return validate_and_process_records_df(
        df=df,
        db=db,
        commit_if_valid=commit_if_valid,
        row_offset=2
    )

def validate_and_parse_record_dicts(
    records: List[Dict[str, Any]],
    db: Session,
    commit_if_valid: bool = True
) -> Dict[str, Any]:
    """
    Validates and ingests list of student record dictionaries entered directly
    via the interactive web spreadsheet.
    """
    try:
        df = pd.DataFrame(records)
    except Exception as e:
        return {
            "success": False,
            "total_rows": 0,
            "valid_rows_processed": 0,
            "new_students_created": 0,
            "records_updated": 0,
            "errors": [{"row": 0, "field": "data", "error": f"Failed to process records: {str(e)}"}]
        }

    return validate_and_process_records_df(
        df=df,
        db=db,
        commit_if_valid=commit_if_valid,
        row_offset=1
    )
