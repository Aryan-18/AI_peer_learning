import httpx
import secrets
import json
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, GoogleAuthRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user, validate_pccoe_domain
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

from typing import Optional, List, Any

def parse_teaching_courses(val: Any) -> Optional[List[str]]:
    if not val:
        return None
    if isinstance(val, list):
        return [str(c).strip() for c in val if str(c).strip()]
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return [str(c).strip() for c in parsed if str(c).strip()]
            return [str(parsed).strip()]
        except Exception:
            return [c.strip() for c in val.split(",") if c.strip()]
    return None

@router.post("/register", response_model=Token)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new student or teacher.
    Strictly verifies email ends with @pccoepune.org.
    """
    clean_email = validate_pccoe_domain(req.email)
    
    # Check if user already exists
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this institutional email already exists."
        )

    # If student, check PRN uniqueness
    if req.role == "student" and req.prn:
        existing_prn = db.query(StudentProfile).filter(StudentProfile.prn == req.prn.strip().upper()).first()
        if existing_prn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student PRN '{req.prn}' is already registered."
            )

    teaching_courses_json = None
    parsed_courses = None
    if req.role == "teacher" and req.teaching_courses:
        parsed_courses = parse_teaching_courses(req.teaching_courses)
        if parsed_courses:
            teaching_courses_json = json.dumps(parsed_courses)

    new_user = User(
        email=clean_email,
        full_name=req.full_name.strip(),
        password_hash=hash_password(req.password),
        role=req.role,
        teaching_courses=teaching_courses_json
    )
    db.add(new_user)
    db.flush()

    assigned_prn = None
    if req.role == "student":
        assigned_prn = (req.prn.strip().upper() if req.prn else f"PRN{new_user.id:06d}")
        electives_str = json.dumps(req.selected_electives or {}) if req.selected_electives else "{}"
        student = StudentProfile(
            user_id=new_user.id,
            prn=assigned_prn,
            department=req.department or "Computer Science Engineering (Artificial Intelligence & Machine Learning)",
            year=req.year or "Second Year (SY)",
            semester=str(req.semester) if req.semester else "Semester III",
            scheme=req.scheme,
            selected_electives_json=electives_str
        )
        db.add(student)
        db.flush()

    db.commit()

    token_data = {
        "sub": str(new_user.id),
        "user_id": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "full_name": new_user.full_name
    }
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        role=new_user.role,
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        prn=assigned_prn,
        teaching_courses=parsed_courses
    )

@router.post("/login", response_model=Token)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user.
    Enforces strict institutional domain verification (@pccoepune.org).
    """
    clean_email = validate_pccoe_domain(req.email)
    
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid institutional credentials. Please check your email and password."
        )

    prn = None
    if user.student_profile and user.student_profile.prn is not None:
        prn = str(user.student_profile.prn)

    token_data = {
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        role=user.role,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        prn=prn,
        teaching_courses=parse_teaching_courses(user.teaching_courses)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile for currently authenticated user."""
    sp = current_user.student_profile
    prn = str(sp.prn) if sp and sp.prn is not None else None
    dept = sp.department if sp else None
    year = str(sp.year) if sp and sp.year is not None else None
    sem = str(sp.semester) if sp and sp.semester is not None else None
    scheme = sp.scheme if sp else None
    electives = {}
    if sp and sp.selected_electives_json:
        try:
            electives = json.loads(sp.selected_electives_json)
        except Exception:
            electives = {}

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        prn=prn,
        department=dept,
        year=year,
        semester=sem,
        scheme=scheme,
        selected_electives=electives,
        teaching_courses=parse_teaching_courses(current_user.teaching_courses)
    )

@router.post("/google", response_model=Token)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticates or auto-registers a user via Google Workspace.
    Strictly verifies Google ID Token using Google's official token verification library,
    validates the cryptographic signature, audience against GOOGLE_CLIENT_ID, expiry,
    email_verified claim, and ensures the verified email belongs to @pccoepune.org.
    Never trusts an email provided directly by the frontend.
    """
    if not req.credential or not req.credential.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google ID token credential."
        )

    # Cryptographically verify the Google ID token using Google's official library
    try:
        request = google_requests.Request()
        audience = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        id_info = id_token.verify_oauth2_token(
            req.credential.strip(),
            request,
            audience=audience
        )
    except ValueError as e:
        # Raised on invalid signature, expired token, audience mismatch, issuer mismatch, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google ID token verification failed: {str(e)}"
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication service error: {str(err)}"
        )

    # Require email_verified === True
    email_verified = id_info.get("email_verified")
    if email_verified is not True and str(email_verified).lower() != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Google account email is not verified."
        )

    # Extract verified email from Google ID token payload
    verified_email = id_info.get("email")
    if not verified_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token payload does not contain a verified email address."
        )

    # Strictly validate institutional domain @pccoepune.org
    clean_email = validate_pccoe_domain(verified_email)

    # Check hosted domain (hd) claim if provided by Google Workspace
    hd = id_info.get("hd")
    if hd and hd.strip().lower() != settings.ALLOWED_DOMAIN.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Hosted domain mismatch: Account domain must be @{settings.ALLOWED_DOMAIN}."
        )

    google_name = id_info.get("name") or clean_email.split("@")[0].replace(".", " ").title()

    # Check if user already exists
    user = db.query(User).filter(User.email == clean_email).first()

    if not user:
        # Auto-provision new institutional account
        user_role = (req.role or "student").strip().lower()
        if user_role not in ["student", "teacher"]:
            user_role = "student"

        # Generate a secure random password hash for OAuth SSO user
        sso_dummy_pwd = secrets.token_urlsafe(32)
        teaching_courses_json = None
        if user_role == "teacher" and req.teaching_courses:
            parsed_courses = parse_teaching_courses(req.teaching_courses)
            if parsed_courses:
                teaching_courses_json = json.dumps(parsed_courses)

        user = User(
            email=clean_email,
            full_name=google_name.strip() if google_name else clean_email.split("@")[0].title(),
            password_hash=hash_password(sso_dummy_pwd),
            role=user_role,
            teaching_courses=teaching_courses_json
        )
        db.add(user)
        db.flush()

        if user_role == "student":
            assigned_prn = (req.prn.strip().upper() if req.prn else f"PRN{user.id:06d}")
            # Ensure unique PRN
            existing_prn = db.query(StudentProfile).filter(StudentProfile.prn == assigned_prn).first()
            if existing_prn:
                assigned_prn = f"PRN{user.id:06d}"

            electives_str = json.dumps(req.selected_electives or {}) if req.selected_electives else "{}"
            student = StudentProfile(
                user_id=user.id,
                prn=assigned_prn,
                department=req.department or "Computer Science Engineering (Artificial Intelligence & Machine Learning)",
                year=req.year or "Second Year (SY)",
                semester=str(req.semester) if req.semester else "Semester III",
                scheme=req.scheme,
                selected_electives_json=electives_str
            )
            db.add(student)
            db.flush()

        db.commit()
    else:
        if user.role == "teacher" and req.teaching_courses and not user.teaching_courses:
            parsed_courses = parse_teaching_courses(req.teaching_courses)
            if parsed_courses:
                user.teaching_courses = json.dumps(parsed_courses)
                db.commit()

    prn = user.student_profile.prn if user.student_profile else None

    token_data = {
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        role=user.role,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        prn=prn,
        teaching_courses=parse_teaching_courses(user.teaching_courses)
    )
