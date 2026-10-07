from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any, Union

class SubjectOut(BaseModel):
    id: int
    code: str
    name: str
    subject_type: str
    credits: int
    max_marks: Optional[float] = 100.0
    year: Optional[str] = None
    semester: Optional[str] = None
    scheme: Optional[str] = None

    class Config:
        from_attributes = True

class StudentAcademicProfileUpdate(BaseModel):
    year: Union[str, int]
    semester: Union[str, int]
    scheme: Optional[str] = None
    selected_electives: Optional[Dict[str, str]] = None

    @field_validator("year", "semester", mode="before")
    @classmethod
    def coerce_to_str(cls, v):
        if v is not None:
            return str(v)
        return ""

class SelectElectiveRequest(BaseModel):
    elective_group: str
    course_code: str


class AcademicRecordOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_email: str
    prn: str
    subject_id: int
    subject_code: str
    subject_name: str
    subject_type: str
    credits: int
    fa1: float
    fa2: float
    sa: float
    total_marks: float
    max_marks: float
    attendance_pct: float
    certs_count: int
    external_courses: str

    class Config:
        from_attributes = True

class UploadResult(BaseModel):
    success: bool
    total_rows: int
    valid_rows_processed: int
    new_students_created: int
    records_updated: int
    errors: List[dict]

class DirectRecordsBatch(BaseModel):
    records: List[Dict[str, Any]]

