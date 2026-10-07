from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Pairing(Base):
    __tablename__ = "pairings"

    id = Column(Integer, primary_key=True, index=True)
    mentor_student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    mentee_student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    strategy = Column(String(50), nullable=False)  # "complementary" or "balanced"
    match_score = Column(Float, nullable=False, default=0.0)  # 0 to 100
    ai_rationale = Column(Text, nullable=False)
    collaboration_prompt = Column(Text, nullable=True)

    # Micro-Project Recommender details
    recommended_project_title = Column(String(255), nullable=True)
    project_domain = Column(String(100), nullable=True)
    project_description = Column(Text, nullable=True)
    project_tech_stack = Column(String(500), nullable=True)
    project_milestones_json = Column(Text, nullable=True)  # JSON serialized milestones with progress

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mentor = relationship("StudentProfile", foreign_keys=[mentor_student_id], back_populates="mentor_pairings")
    mentee = relationship("StudentProfile", foreign_keys=[mentee_student_id], back_populates="mentee_pairings")
    subject = relationship("Subject", back_populates="pairings")

    def __repr__(self):
        return f"<Pairing {self.mentor_student_id} <-> {self.mentee_student_id} ({self.strategy})>"
