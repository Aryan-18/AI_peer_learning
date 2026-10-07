"""
Test suite verifying semester-wise curriculum, credit caps, maximum marks,
scheme selection (Scheme A & Scheme B for Final Year), and absence of Open Elective / MDM subjects.
"""

import pytest
from app.core.curriculum import (
    resolve_student_subjects,
    get_curriculum_for_student,
    get_all_curriculum_subjects,
    CURRICULUM_DATA,
)

def test_sy_semester_iii_curriculum():
    """Verify SY Semester III contains exactly the 7 required subjects with correct credits & max marks."""
    subjects = resolve_student_subjects("Second Year (SY)", "Semester III")
    assert len(subjects) == 7

    # Check each required subject
    expected = {
        "BCS23PC02": ("Machine Learning", 2, 50),
        "BCS23PC03": ("Data Structures & Algorithms", 3, 100),
        "BCS23PC05": ("Data Structures Laboratory", 2, 100),
        "BCS23PC06": ("Java Programming", 1, 50),
        "BCS23EM01": ("Financial Modelling & AI", 2, 50),
        "BSH23VE01": ("Universal Human Values", 2, 50),
        "BCS23EL01": ("Community Engineering Project", 2, 100),
    }

    for s in subjects:
        code = s["code"]
        assert code in expected, f"Unexpected course code: {code}"
        name, credits, max_marks = expected[code]
        assert s["name"] == name
        assert s["credits"] == credits
        assert s["max_marks"] == max_marks

    # Confirm no OE or MDM subjects
    for s in subjects:
        assert "open elective" not in s["name"].lower()
        assert "mdm" not in s["name"].lower()


def test_sy_semester_iv_curriculum():
    """Verify SY Semester IV contains exactly the 8 required subjects."""
    subjects = resolve_student_subjects("Second Year (SY)", "Semester IV")
    assert len(subjects) == 8

    expected = {
        "BCS24PC06": ("Theory of Computation", 3, 100),
        "BCS24PC07": ("Database Management Systems", 2, 50),
        "BCS24PC08": ("Database Management Systems Laboratory", 2, 100),
        "BCS24PC09": ("Advanced Data Structures Laboratory", 1, 50),
        "BCS24VS03": ("Full Stack Development-I", 2, 100),
        "BCS24EM02": ("Business Process Integration with ERP", 2, 50),
        "BSH24AE05": ("Professional Development Training", 2, 100),
        "BSH24VE02": ("Constitution of India", 2, 50),
    }

    for s in subjects:
        code = s["code"]
        assert code in expected, f"Unexpected course code: {code}"
        name, credits, max_marks = expected[code]
        assert s["name"] == name
        assert s["credits"] == credits
        assert s["max_marks"] == max_marks
        assert "open elective" not in s["name"].lower()
        assert "mdm" not in s["name"].lower()


def test_ty_semester_v_curriculum():
    """Verify TY Semester V contains exactly the 8 required subjects."""
    subjects = resolve_student_subjects("Third Year (TY)", "Semester V")
    assert len(subjects) == 8

    expected = {
        "BCS25PC10": ("Artificial Intelligence", 3, 100),
        "BCS25PC11": ("Computer Networks", 3, 100),
        "BCS25PC12": ("Artificial Intelligence Lab", 2, 100),
        "BCS25PC13": ("Embedded AI Lab", 2, 100),
        "BCS25PC14": ("Natural Language Processing", 2, 50),
        "BCS25PC15": ("Natural Language Processing Laboratory", 1, 50),
        "BCS25PC16": ("Information Security", 2, 50),
        "BCS25PC17": ("Information Security Laboratory", 1, 50),
    }

    for s in subjects:
        code = s["code"]
        assert code in expected, f"Unexpected course code: {code}"
        name, credits, max_marks = expected[code]
        assert s["name"] == name
        assert s["credits"] == credits
        assert s["max_marks"] == max_marks
        assert "mdm" not in s["name"].lower()


def test_ty_semester_vi_electives_resolution():
    """Verify TY Semester VI contains 10 subjects and resolves dropdown elective choices."""
    # Test default elective choices
    subjects_default = resolve_student_subjects("Third Year (TY)", "Semester VI")
    assert len(subjects_default) == 10

    # Test custom elective selection
    custom_electives = {
        "PE-I": "BCS26PE02",       # Cyber Security & Digital Forensics
        "PE-I Lab": "BCS26PE05",   # Cyber Security & Digital Forensics Laboratory
        "PE-II": "BCS26PE23",      # Augmented & Virtual Reality
        "PE-II Lab": "BCS26PE26",  # Augmented & Virtual Reality Laboratory
    }
    subjects_custom = resolve_student_subjects("Third Year (TY)", "Semester VI", selected_electives=custom_electives)
    assert len(subjects_custom) == 10

    custom_codes = {s["code"]: s for s in subjects_custom}
    assert "BCS26PE02" in custom_codes
    assert custom_codes["BCS26PE02"]["name"] == "Cyber Security & Digital Forensics"
    assert custom_codes["BCS26PE02"]["credits"] == 2
    assert custom_codes["BCS26PE02"]["max_marks"] == 50

    assert "BCS26PE05" in custom_codes
    assert custom_codes["BCS26PE05"]["credits"] == 1
    assert custom_codes["BCS26PE05"]["max_marks"] == 50

    assert "BCS26PE23" in custom_codes
    assert custom_codes["BCS26PE23"]["name"] == "Augmented & Virtual Reality"

    assert "BCS26PE26" in custom_codes

    # Fixed subjects also present
    assert "BCS26PC14" in custom_codes
    assert "BCS26PE27" in custom_codes
    assert "BCS26VS04" in custom_codes


def test_final_year_scheme_a():
    """Verify Final Year Scheme A subjects for Semester VII and Semester VIII."""
    # Semester VII Scheme A
    sem7 = resolve_student_subjects("Final Year (B.Tech)", "Semester VII", scheme="Scheme A")
    assert len(sem7) == 7
    sem7_codes = [s["code"] for s in sem7]
    assert "BCS27PC18" in sem7_codes
    assert "BCS27PC19" in sem7_codes
    assert "BCS27PC20" in sem7_codes
    assert "BCS27PC21" in sem7_codes
    assert "BCS27EL02" in sem7_codes  # Research Methodology, 4cr, 150 max

    res_meth = next(s for s in sem7 if s["code"] == "BCS27EL02")
    assert res_meth["credits"] == 4
    assert res_meth["max_marks"] == 150

    # Semester VIII Scheme A
    sem8 = resolve_student_subjects("Final Year (B.Tech)", "Semester VIII", scheme="Scheme A")
    assert len(sem8) == 4
    sem8_codes = [s["code"] for s in sem8]
    assert "BCS28PE28" in sem8_codes  # Seminar, 1cr, 50 max
    assert "BCS28EL03" in sem8_codes  # Major Project, 4cr, 200 max
    assert "BCS28EL04" in sem8_codes  # Internship / OJT, 12cr, 400 max

    internship = next(s for s in sem8 if s["code"] == "BCS28EL04")
    assert internship["credits"] == 12
    assert internship["max_marks"] == 400


def test_final_year_scheme_b():
    """Verify Final Year Scheme B subjects for Semester VII and Semester VIII."""
    # Semester VII Scheme B
    sem7 = resolve_student_subjects("Final Year (B.Tech)", "Semester VII", scheme="Scheme B")
    assert len(sem7) == 7
    sem7_codes = [s["code"] for s in sem7]
    assert "BCS28PC18" in sem7_codes
    assert "BCS28PC19" in sem7_codes
    assert "BCS28PC20" in sem7_codes
    assert "BCS28PC21" in sem7_codes
    assert "BCS28EL03" in sem7_codes  # Major Project in Sem VII for Scheme B

    major_proj = next(s for s in sem7 if s["code"] == "BCS28EL03")
    assert major_proj["credits"] == 4
    assert major_proj["max_marks"] == 200

    # Semester VIII Scheme B
    sem8 = resolve_student_subjects("Final Year (B.Tech)", "Semester VIII", scheme="Scheme B")
    assert len(sem8) == 4
    sem8_codes = [s["code"] for s in sem8]
    assert "BCS28EL02" in sem8_codes  # Research Methodology in Sem VIII for Scheme B
    assert "BCS27PE28" in sem8_codes  # Programme Elective Seminar
    assert "BCS27EL04" in sem8_codes  # Internship / OJT

    # Verify MDM is not in Scheme B
    for s in sem7 + sem8:
        assert "mdm" not in s["name"].lower()


def test_student_dashboard_api_and_profile_update():
    """Verify FastAPI endpoints return curriculum, allow updating academic profile, and selecting electives."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    import uuid
    uid = uuid.uuid4().hex[:6]
    # 1. Register a test student for SY Semester III
    reg_payload = {
        "email": f"curr.student.{uid}@pccoepune.org",
        "password": "Password@123",
        "full_name": "Curriculum Test Student",
        "role": "student",
        "prn": f"PRN{uid.upper()}",
        "year": "Second Year (SY)",
        "semester": "Semester III"
    }
    try:
        reg_resp = client.post("/api/auth/register", json=reg_payload)
        assert reg_resp.status_code == 200
        token = reg_resp.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Test GET /api/student/dashboard
        dash_resp = client.get("/api/student/dashboard", headers=headers)
        assert dash_resp.status_code == 200
        dash_data = dash_resp.json()
        assert "curriculum" in dash_data
        curr = dash_data["curriculum"]
        assert curr["year"] == "Second Year (SY)"
        assert curr["semester"] == "Semester III"
        assert len(curr["subjects"]) == 7

        # 3. Test POST /api/student/update-academic-profile to TY Semester VI
        update_resp = client.post("/api/student/update-academic-profile", headers=headers, json={
            "year": "Third Year (TY)",
            "semester": "Semester VI",
            "scheme": None,
            "selected_electives": {
                "PE-I": "BCS26PE01",
                "PE-I Lab": "BCS26PE04",
                "PE-II": "BCS26PE22",
                "PE-II Lab": "BCS26PE25"
            }
        })
        assert update_resp.status_code == 200
        ty_data = update_resp.json()
        ty_curr = ty_data["curriculum"]
        assert ty_curr["semester"] == "Semester VI"
        assert len(ty_curr["subjects"]) == 10
        assert any(s["code"] == "BCS26PE22" for s in ty_curr["subjects"])

        # 4. Test POST /api/student/select-elective
        sel_resp = client.post("/api/student/select-elective", headers=headers, json={
            "elective_group": "PE-I",
            "course_code": "BCS26PE03"  # Blockchain Technology
        })
        assert sel_resp.status_code == 200
        sel_data = sel_resp.json()
        sel_curr = sel_data["curriculum"]
        pe1_sub = next(s for s in sel_curr["subjects"] if s["code"] == "BCS26PE03")
        assert pe1_sub["name"] == "Blockchain Technology"
        assert pe1_sub["credits"] == 2
        assert pe1_sub["max_marks"] == 50

        # 5. Test POST /api/student/update-academic-profile to Final Year Scheme B Semester VII
        fy_resp = client.post("/api/student/update-academic-profile", headers=headers, json={
            "year": "Final Year (B.Tech)",
            "semester": "Semester VII",
            "scheme": "Scheme B"
        })
        assert fy_resp.status_code == 200
        fy_data = fy_resp.json()
        fy_curr = fy_data["curriculum"]
        assert fy_curr["scheme"] == "Scheme B"
        assert len(fy_curr["subjects"]) == 7
        assert any(s["code"] == "BCS28EL03" for s in fy_curr["subjects"])  # Major Project in Sem VII for Scheme B
    finally:
        from app.database import SessionLocal
        from app.models.user import User
        db = SessionLocal()
        u = db.query(User).filter(User.email == reg_payload["email"]).first()
        if u:
            if u.student_profile:
                db.delete(u.student_profile)
            db.delete(u)
            db.commit()
        db.close()

