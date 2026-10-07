from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def validate_pccoe_domain(email: str) -> str:
    """Enforces institutional domain @pccoepune.org."""
    clean = email.strip().lower()
    allowed_suffix = f"@{settings.ALLOWED_DOMAIN.lower()}"
    if not clean.endswith(allowed_suffix):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain Access Denied: Only institutional accounts ending with @{settings.ALLOWED_DOMAIN} are permitted."
        )
    return clean

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user no longer exists.",
        )
    
    # Extra defense-in-depth: Re-verify institutional domain
    validate_pccoe_domain(user.email)
    
    return user

def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Enforce Teacher role."""
    if current_user.role.lower() != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Teacher privileges required for this operation."
        )
    return current_user

def require_student(current_user: User = Depends(get_current_user)) -> User:
    """Enforce Student role."""
    if current_user.role.lower() != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Student portal accessible only to student accounts."
        )
    return current_user
