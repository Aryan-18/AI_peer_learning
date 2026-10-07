from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    prn = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(150), default="Computer Science Engineering (Artificial Intelligence & Machine Learning)")
    year = Column(String(50), default="Second Year (SY)")
    semester = Column(String(50), default="Semester III")
    scheme = Column(String(50), nullable=True, default=None)
    selected_electives_json = Column(String(2000), default="{}")

    # Relationships
    user = relationship("User", back_populates="student_profile")
    academic_records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    mentor_pairings = relationship("Pairing", foreign_keys="Pairing.mentor_student_id", back_populates="mentor")
    mentee_pairings = relationship("Pairing", foreign_keys="Pairing.mentee_student_id", back_populates="mentee")

    def __repr__(self):
        return f"<StudentProfile PRN={self.prn}>"
