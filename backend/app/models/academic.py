from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    subject_type = Column(String(20), nullable=False)  # "Theory" or "Lab"
    credits = Column(Integer, nullable=False)          # 1, 2, 3, 4, 12 etc.
    max_marks = Column(Float, nullable=False, default=100.0)
    year = Column(String(50), nullable=True)
    semester = Column(String(50), nullable=True)
    scheme = Column(String(50), nullable=True)

    # Relationships
    records = relationship("AcademicRecord", back_populates="subject", cascade="all, delete-orphan")
    pairings = relationship("Pairing", back_populates="subject", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Subject {self.code}: {self.name} ({self.subject_type}, {self.credits}cr, max {self.max_marks})>"

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    __table_args__ = (
        UniqueConstraint("student_id", "subject_id", name="uq_student_subject"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    
    fa1 = Column(Float, nullable=False, default=0.0)
    fa2 = Column(Float, nullable=False, default=0.0)
    sa = Column(Float, nullable=False, default=0.0)
    total_marks = Column(Float, nullable=False, default=0.0)
    attendance_pct = Column(Float, nullable=False, default=0.0)
    certs_count = Column(Integer, default=0)
    external_courses = Column(String(500), default="")

    # Relationships
    student = relationship("StudentProfile", back_populates="academic_records")
    subject = relationship("Subject", back_populates="records")

    def __repr__(self):
        return f"<AcademicRecord student={self.student_id} subject={self.subject_id} total={self.total_marks}>"
