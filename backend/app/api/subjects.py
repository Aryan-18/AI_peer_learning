from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.academic import Subject, AcademicRecord
from app.schemas.academic import SubjectOut
from app.core.curriculum import get_faculty_teaching_course_options

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    """List all registered courses and subjects."""
    return db.query(Subject).order_by(Subject.code).all()

@router.get("/faculty-options", response_model=List[Dict[str, Any]])
def list_faculty_course_options():
    """
    Returns Year/Course formatted options for faculty registration/profile selection,
    such as 'SY/Artificial Intelligence', 'TY/NLPLab'.
    """
    return get_faculty_teaching_course_options()
