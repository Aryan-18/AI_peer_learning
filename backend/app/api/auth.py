import httpx
import secrets
import json
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

    new_user = User(
        email=clean_email,
        full_name=req.full_name.strip(),
        password_hash=hash_password(req.password),
        role=req.role
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
        prn=assigned_prn
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
        prn=prn
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
        selected_electives=electives
    )

@router.post("/google", response_model=Token)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticates or auto-registers a user via Google Workspace.
    Strictly verifies Google ID Token or institutional email domain (@pccoepune.org).
    """
    google_email = None
    google_name = None

    if req.credential:
        # Cryptographically verify the Google ID token with Google's tokeninfo API
        try:
            resp = httpx.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}",
                timeout=6.0
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google verification failed: Invalid or expired ID token."
                )
            id_info = resp.json()

            # Verify email verification status
            if str(id_info.get("email_verified", "")).lower() != "true":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Google account email is not verified."
                )

            google_email = id_info.get("email", "").strip().lower()
            google_name = id_info.get("name") or google_email.split("@")[0].replace(".", " ").title()

            # Verify audience if GOOGLE_CLIENT_ID is configured
            if settings.GOOGLE_CLIENT_ID and id_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google OAuth Client ID mismatch."
                )

        except HTTPException:
            raise
        except Exception as err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google authentication service error: {str(err)}"
            )
    elif req.email:
        # Development / Institutional Chooser mode
        google_email = req.email.strip().lower()
        google_name = req.full_name or google_email.split("@")[0].replace(".", " ").title()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google credential or institutional email."
        )

    # Strictly validate institutional domain @pccoepune.org
    clean_email = validate_pccoe_domain(google_email)

    # Check if user already exists
    user = db.query(User).filter(User.email == clean_email).first()

    if not user:
        # Auto-provision new institutional account
        user_role = (req.role or "student").strip().lower()
        if user_role not in ["student", "teacher"]:
            user_role = "student"

        # Generate a secure random password hash for OAuth SSO user
        sso_dummy_pwd = secrets.token_urlsafe(32)
        user = User(
            email=clean_email,
            full_name=google_name.strip() if google_name else clean_email.split("@")[0].title(),
            password_hash=hash_password(sso_dummy_pwd),
            role=user_role
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
        prn=prn
    )
