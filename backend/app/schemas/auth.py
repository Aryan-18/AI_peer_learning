from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Union, Dict, Any, List
from app.config import settings

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # "student" or "teacher"
    prn: Optional[Union[str, int]] = None
    department: Optional[str] = "Computer Science Engineering (Artificial Intelligence & Machine Learning)"
    year: Optional[Union[str, int]] = "Second Year (SY)"
    semester: Optional[Union[str, int]] = "Semester III"
    scheme: Optional[str] = None
    selected_electives: Optional[Dict[str, Any]] = None
    teaching_courses: Optional[Union[List[str], str]] = None

    @field_validator("email")
    @classmethod
    def validate_pccoe_email(cls, v: str) -> str:
        clean_email = v.strip().lower()
        allowed_suffix = f"@{settings.ALLOWED_DOMAIN.lower()}"
        if not clean_email.endswith(allowed_suffix):
            raise ValueError(
                f"Domain Access Denied: Only institutional accounts ending with @{settings.ALLOWED_DOMAIN} are permitted."
            )
        return clean_email

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        clean_role = v.strip().lower()
        if clean_role not in ["student", "teacher"]:
            raise ValueError("Role must be either 'student' or 'teacher'")
        return clean_role

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def validate_pccoe_email(cls, v: str) -> str:
        clean_email = v.strip().lower()
        allowed_suffix = f"@{settings.ALLOWED_DOMAIN.lower()}"
        if not clean_email.endswith(allowed_suffix):
            raise ValueError(
                f"Domain Access Denied: Only institutional accounts ending with @{settings.ALLOWED_DOMAIN} are permitted."
            )
        return clean_email

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str
    full_name: str
    prn: Optional[Union[str, int]] = None
    teaching_courses: Optional[List[str]] = None

    @field_validator("prn", mode="before")
    @classmethod
    def coerce_prn(cls, v):
        if v is not None:
            return str(v)
        return None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    prn: Optional[Union[str, int]] = None
    department: Optional[str] = None
    year: Optional[Union[str, int]] = None
    semester: Optional[Union[str, int]] = None
    scheme: Optional[str] = None
    selected_electives: Optional[Dict[str, Any]] = None
    teaching_courses: Optional[List[str]] = None

    @field_validator("prn", "year", "semester", mode="before")
    @classmethod
    def coerce_to_str(cls, v):
        if v is not None:
            return str(v)
        return None

    class Config:
        from_attributes = True

class GoogleAuthRequest(BaseModel):
    credential: str
    role: Optional[str] = "student"
    prn: Optional[Union[str, int]] = None
    department: Optional[str] = "Computer Science Engineering (Artificial Intelligence & Machine Learning)"
    year: Optional[Union[str, int]] = "Second Year (SY)"
    semester: Optional[Union[str, int]] = "Semester III"
    scheme: Optional[str] = None
    selected_electives: Optional[Dict[str, Any]] = None
    teaching_courses: Optional[Union[List[str], str]] = None

    @field_validator("credential")
    @classmethod
    def validate_credential(cls, v: str) -> str:
        clean = (v or "").strip()
        if not clean:
            raise ValueError("Google ID token credential is required.")
        return clean
