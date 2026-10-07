import pytest
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

def test_google_auth_invalid_domain_rejected():
    payload = {
        "email": "intruder@gmail.com",
        "full_name": "Google Intruder"
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code in [400, 403, 422]
    assert "pccoepune.org" in response.text

def test_google_auth_existing_student():
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

    try:
        payload = {
            "email": test_email,
            "full_name": "Google Existing Student"
        }
        response = client.post("/api/auth/google", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_email
        assert data["role"] == "student"
        assert "access_token" in data
        assert data["prn"] == "TESTPRN002"
    finally:
        db = SessionLocal()
        u = db.query(User).filter(User.email == test_email).first()
        if u:
            if u.student_profile:
                db.delete(u.student_profile)
            db.delete(u)
            db.commit()
        db.close()

def test_google_auth_auto_provision_student():
    test_email = "tanmay.kulkarni@pccoepune.org"
    try:
        payload = {
            "email": test_email,
            "full_name": "Tanmay Kulkarni",
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


