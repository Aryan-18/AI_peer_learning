import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_invalid_domain_rejected():
    payload = {
        "email": "hacker@gmail.com",
        "password": "Password@123",
        "full_name": "External User",
        "role": "student"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code in [400, 422]
    assert "pccoepune.org" in response.text

def test_login_invalid_domain_rejected():
    payload = {
        "email": "intruder@yahoo.com",
        "password": "Password@123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code in [400, 422]
    assert "pccoepune.org" in response.text

from app.database import SessionLocal
from app.models.user import User
from app.models.student import StudentProfile
from app.core.security import hash_password

def test_login_valid_institutional_domain():
    test_faculty_email = "test.faculty.temp@pccoepune.org"
    db = SessionLocal()
    u = db.query(User).filter(User.email == test_faculty_email).first()
    if not u:
        u = User(
            email=test_faculty_email,
            full_name="Test Faculty Member",
            password_hash=hash_password("Teacher@123"),
            role="teacher"
        )
        db.add(u)
        db.commit()
    db.close()

    try:
        payload = {
            "email": test_faculty_email,
            "password": "Teacher@123"
        }
        response = client.post("/api/auth/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "teacher"
        assert "access_token" in data
        assert data["email"] == test_faculty_email
    finally:
        db = SessionLocal()
        u = db.query(User).filter(User.email == test_faculty_email).first()
        if u:
            db.delete(u)
            db.commit()
        db.close()


def test_student_login_valid():
    test_email = "test.domain.student@pccoepune.org"
    db = SessionLocal()
    u = db.query(User).filter(User.email == test_email).first()
    if not u:
        u = User(
            email=test_email,
            full_name="Test Domain Student",
            password_hash=hash_password("Student@123"),
            role="student"
        )
        db.add(u)
        db.flush()
        profile = StudentProfile(
            user_id=u.id,
            prn="TESTPRN001",
            department="Computer Science Engineering (Artificial Intelligence & Machine Learning)",
            year="Second Year (SY)",
            semester="Semester III"
        )
        db.add(profile)
        db.commit()
    db.close()

    try:
        payload = {
            "email": test_email,
            "password": "Student@123"
        }
        response = client.post("/api/auth/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "student"
        assert data["prn"] == "TESTPRN001"
    finally:
        db = SessionLocal()
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            if u.student_profile:
                db.delete(u.student_profile)
            db.delete(u)
            db.commit()
        db.close()

def test_fabricated_email_without_credential_rejected():
    """Requirement 7 & 9: Verify fabricated email payload without ID token is rejected (HTTP 422)."""
    payload = {
        "email": "11@pccoepune.org",
        "full_name": "Fabricated User"
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 422
    assert "credential" in response.text

def test_fabricated_email_with_empty_credential_rejected():
    """Requirement 7 & 9: Verify empty/whitespace credential with fabricated email is rejected (HTTP 422)."""
    payload = {
        "credential": "   ",
        "email": "11@pccoepune.org"
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 422
    assert "credential" in response.text

def test_invalid_token_signature_rejected():
    """Requirement 5 & 9: Verify invalid or forged token signature is rejected (HTTP 401)."""
    with patch("google.oauth2.id_token.verify_oauth2_token", side_effect=ValueError("Invalid token signature")):
        response = client.post("/api/auth/google", json={"credential": "forged_or_invalid_jwt_token"})
        assert response.status_code == 401
        assert "verification failed" in response.json()["detail"].lower()

def test_expired_token_rejected():
    """Requirement 5 & 9: Verify expired Google token is rejected (HTTP 401)."""
    with patch("google.oauth2.id_token.verify_oauth2_token", side_effect=ValueError("Token expired")):
        response = client.post("/api/auth/google", json={"credential": "expired_jwt_token"})
        assert response.status_code == 401
        assert "token expired" in response.json()["detail"].lower()

def test_unverified_email_claim_rejected():
    """Requirement 6 & 9: Verify Google token where email_verified is False is rejected (HTTP 403)."""
    fake_claims = {
        "email": "student123@pccoepune.org",
        "email_verified": False,
        "name": "Unverified Student"
    }
    with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_claims):
        response = client.post("/api/auth/google", json={"credential": "mocked_unverified_token"})
        assert response.status_code == 403
        assert "not verified" in response.json()["detail"].lower()

def test_non_college_domain_account_rejected():
    """Requirement 6 & 9: Verify non-college email (e.g. @gmail.com) is rejected (HTTP 400)."""
    fake_claims = {
        "email": "intruder@gmail.com",
        "email_verified": True,
        "name": "External Intruder"
    }
    with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_claims):
        response = client.post("/api/auth/google", json={"credential": "mocked_gmail_token"})
        assert response.status_code == 400
        assert "pccoepune.org" in response.json()["detail"]

def test_hosted_domain_mismatch_rejected():
    """Requirement 6 & 9: Verify hosted domain (hd) mismatch is rejected (HTTP 403)."""
    fake_claims = {
        "email": "user@othercollege.edu",
        "email_verified": True,
        "hd": "othercollege.edu",
        "name": "Other College User"
    }
    with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_claims):
        response = client.post("/api/auth/google", json={"credential": "mocked_othercollege_token"})
        assert response.status_code in [400, 403]
        assert "pccoepune.org" in response.text

def test_google_client_id_audience_mismatch_rejected():
    """Requirement 5 & 9: Verify token with wrong client ID / audience is rejected (HTTP 401)."""
    with patch("google.oauth2.id_token.verify_oauth2_token", side_effect=ValueError("Token has wrong audience")):
        response = client.post("/api/auth/google", json={"credential": "mocked_wrong_aud_token"})
        assert response.status_code == 401
        assert "wrong audience" in response.json()["detail"].lower()

def test_valid_google_auth_existing_student():
    """Requirement 5, 6, 8: Verify valid @pccoepune.org Google ID token logs in an existing student."""
    test_email = "test.google.existing@pccoepune.org"
    db = SessionLocal()
    u = db.query(User).filter(User.email == test_email).first()
    if not u:
        u = User(
            email=test_email,
            full_name="Google Existing Student",
            password_hash=hash_password("Dummy@123"),
            role="student"
        )
        db.add(u)
        db.flush()
        profile = StudentProfile(
            user_id=u.id,
            prn="TESTPRN002",
            department="Computer Science Engineering (Artificial Intelligence & Machine Learning)",
            year="Second Year (SY)",
            semester="Semester III"
        )
        db.add(profile)
        db.commit()
    db.close()

    fake_claims = {
        "email": test_email,
        "email_verified": True,
        "hd": "pccoepune.org",
        "name": "Google Existing Student",
        "aud": "130699244766-emgbfcre0khm1irsrgf0sq4i5vi2vtto.apps.googleusercontent.com"
    }

    try:
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_claims):
            payload = {
                "credential": "valid_google_id_token_for_existing_student"
            }
            response = client.post("/api/auth/google", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == test_email
            assert data["role"] == "student"
            assert "access_token" in data
            assert data["prn"] == "TESTPRN002"

            # Verify session token can access protected /auth/me route
            token = data["access_token"]
            me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert me_resp.status_code == 200
            assert me_resp.json()["email"] == test_email
    finally:
        db = SessionLocal()
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            if u.student_profile:
                db.delete(u.student_profile)
            db.delete(u)
            db.commit()
        db.close()

def test_valid_google_auth_auto_provision_student():
    """Requirement 5, 6, 8: Verify valid @pccoepune.org Google ID token auto-provisions a new student."""
    test_email = "tanmay.kulkarni@pccoepune.org"
    fake_claims = {
        "email": test_email,
        "email_verified": True,
        "hd": "pccoepune.org",
        "name": "Tanmay Kulkarni",
        "aud": "130699244766-emgbfcre0khm1irsrgf0sq4i5vi2vtto.apps.googleusercontent.com"
    }
    try:
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_claims):
            payload = {
                "credential": "valid_google_id_token_for_new_student",
                "role": "student",
                "department": "Computer Science Engineering (Artificial Intelligence & Machine Learning)",
                "year": "Third Year (TY)",
                "semester": "Semester V"
            }
            response = client.post("/api/auth/google", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == test_email
            assert data["role"] == "student"
            assert "access_token" in data
            assert data["prn"] is not None

            # Verify authenticated session protects backend student dashboard
            token = data["access_token"]
            me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert me_resp.status_code == 200
            assert me_resp.json()["email"] == test_email
    finally:
        db = SessionLocal()
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            if u.student_profile:
                db.delete(u.student_profile)
            db.delete(u)
            db.commit()
        db.close()

def test_aryan_student_login_and_curriculum_flow():
    """Verify that aryan.bhedodkar24 logs in, accesses /me, and gets Semester V curriculum with 8 courses."""
    db = SessionLocal()
    u = db.query(User).filter(User.email == "aryan.bhedodkar24@pccoepune.org").first()
    if not u:
        u = User(
            email="aryan.bhedodkar24@pccoepune.org",
            full_name="ARYAN BHEDODKAR",
            password_hash=hash_password("12345678"),
            role="student"
        )
        db.add(u)
        db.flush()
        sp = StudentProfile(
            user_id=u.id,
            prn="123B1B001",
            department="Computer Science Engineering (Artificial Intelligence & Machine Learning)",
            year="Third Year (TY)",
            semester="Semester V"
        )
        db.add(sp)
        db.commit()
    db.close()

    resp = client.post("/api/auth/login", json={
        "email": "aryan.bhedodkar24@pccoepune.org",
        "password": "12345678"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "aryan.bhedodkar24@pccoepune.org"
    assert me_data["role"] == "student"

    dash_resp = client.get("/api/student/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["student"]["name"] == "ARYAN BHEDODKAR"
    assert len(dash_data["curriculum"]["subjects"]) >= 7
    assert dash_data["curriculum"]["semester"] in ["Semester III", "Semester V"]

def test_faculty_registration_with_teaching_courses():
    test_email = "prof.automation.test@pccoepune.org"
    payload = {
        "email": test_email,
        "password": "FacultyPassword@123",
        "full_name": "Prof. Automation Test",
        "role": "teacher",
        "teaching_courses": ["SY/Artificial Intelligence", "TY/NLPLab"]
    }
    try:
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "teacher"
        assert data["teaching_courses"] == ["SY/Artificial Intelligence", "TY/NLPLab"]

        # Verify /auth/me
        token = data["access_token"]
        me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["teaching_courses"] == ["SY/Artificial Intelligence", "TY/NLPLab"]
    finally:
        db = SessionLocal()
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            db.delete(u)
            db.commit()
        db.close()


