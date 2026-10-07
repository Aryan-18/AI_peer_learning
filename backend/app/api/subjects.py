from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.academic import Subject, AcademicRecord
from app.schemas.academic import SubjectOut

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    """List all registered courses and subjects."""
    return db.query(Subject).order_by(Subject.code).all()
