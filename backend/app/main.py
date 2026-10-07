from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base, init_database
from app.api import auth_router, teacher_router, student_router, subjects_router

# Initialize database tables and schema migrations
init_database()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="PCCOE Pune Institutional Peer Learning Platform with Scikit-Learn Matching & Credit Guardrails",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all local Vite frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(teacher_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(subjects_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "institution": "Pimpri Chinchwad College of Engineering (PCCOE Pune)",
        "allowed_domain": settings.ALLOWED_DOMAIN,
        "engine": "Scikit-Learn Multi-Dimensional Skill Vectorizer"
    }
