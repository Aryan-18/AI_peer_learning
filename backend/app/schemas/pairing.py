from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class RunMatchingRequest(BaseModel):
    subject_id: Optional[int] = None
    strategy: str = "complementary"  # "complementary" or "balanced"

class MilestoneItem(BaseModel):
    phase: int
    title: str
    description: str
    deliverable: str
    completed: bool = False

class StudentBrief(BaseModel):
    id: int
    prn: str
    name: str
    email: str
    department: Optional[str] = "Computer Engineering"
    marks_summary: Optional[dict] = None

class PairingOut(BaseModel):
    id: int
    subject_id: int
    subject_code: str
    subject_name: str
    strategy: str
    match_score: float
    ai_rationale: str
    collaboration_prompt: Optional[str] = None
    mentor: StudentBrief
    mentee: StudentBrief
    recommended_project_title: Optional[str] = None
    project_domain: Optional[str] = None
    project_description: Optional[str] = None
    project_tech_stack: Optional[str] = None
    milestones: List[MilestoneItem] = []
    created_at: datetime

    class Config:
        from_attributes = True

class MilestoneUpdate(BaseModel):
    pairing_id: int
    milestone_index: int
    completed: bool
