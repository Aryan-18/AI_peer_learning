from app.api.auth import router as auth_router
from app.api.teacher import router as teacher_router
from app.api.student import router as student_router
from app.api.subjects import router as subjects_router

__all__ = ["auth_router", "teacher_router", "student_router", "subjects_router"]
