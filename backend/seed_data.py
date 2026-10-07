import os
import sys
import pandas as pd
from datetime import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.student import StudentProfile
from app.models.academic import Subject, AcademicRecord
from app.models.pairing import Pairing
from app.core.security import hash_password
from app.services.matching_service import run_ai_peer_matching

def seed_database(seed_students: bool = False):
    print("🚀 Initializing PCCOE Peer Learning Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:

        # 2. Seed Standard Subjects
        subjects_data = [
            {"code": "CS301", "name": "Machine Learning", "type": "Theory", "credits": 3},
            {"code": "CS302L", "name": "Cloud Computing Lab", "type": "Lab", "credits": 2},
            {"code": "CS303", "name": "Database Engineering", "type": "Theory", "credits": 2},
            {"code": "CS304L", "name": "Advanced Programming Lab", "type": "Lab", "credits": 1}
        ]

        subject_map = {}
        for s in subjects_data:
            sub = db.query(Subject).filter(Subject.code == s["code"]).first()
            if not sub:
                sub = Subject(
                    code=s["code"],
                    name=s["name"],
                    subject_type=s["type"],
                    credits=s["credits"]
                )
                db.add(sub)
                db.flush()
            subject_map[s["code"]] = sub

        print(f"✅ Verified {len(subject_map)} institutional subjects.")

        if seed_students:
            # 3. Seed Students (Only if explicitly enabled)
            students_info = [
            # High Performers
            {"name": "Rahul Deshmukh", "email": "rahul.deshmukh@pccoepune.org", "prn": "PRN20240101", "ml_fa1": 22, "ml_fa2": 24, "ml_sa": 46, "att": 94, "certs": 2, "courses": "DeepLearning.AI, AWS ML"},
            {"name": "Tanvi Joshi", "email": "tanvi.joshi@pccoepune.org", "prn": "PRN20240102", "ml_fa1": 21, "ml_fa2": 23, "ml_sa": 44, "att": 92, "certs": 3, "courses": "Stanford ML, PyTorch Cert"},
            {"name": "Siddharth Shinde", "email": "siddharth.shinde@pccoepune.org", "prn": "PRN20240103", "ml_fa1": 20, "ml_fa2": 22, "ml_sa": 43, "att": 89, "certs": 1, "courses": "Kaggle Expert"},
            
            # Mid-Tier / Balanced
            {"name": "Sneha Kulkarni", "email": "sneha.kulkarni@pccoepune.org", "prn": "PRN20240104", "ml_fa1": 15, "ml_fa2": 16, "ml_sa": 32, "att": 83, "certs": 1, "courses": "Coursera Python"},
            {"name": "Aditya Joshi", "email": "aditya.joshi@pccoepune.org", "prn": "PRN20240105", "ml_fa1": 16, "ml_fa2": 15, "ml_sa": 33, "att": 85, "certs": 1, "courses": "DataCamp SQL"},
            {"name": "Pooja Gaikwad", "email": "pooja.gaikwad@pccoepune.org", "prn": "PRN20240106", "ml_fa1": 14, "ml_fa2": 17, "ml_sa": 31, "att": 81, "certs": 0, "courses": ""},
            {"name": "Rohan More", "email": "rohan.more@pccoepune.org", "prn": "PRN20240107", "ml_fa1": 15, "ml_fa2": 15, "ml_sa": 30, "att": 82, "certs": 1, "courses": "IBM AI Foundations"},

            # Struggling / Mentee Candidates
            {"name": "Ananya Patil", "email": "ananya.patil@pccoepune.org", "prn": "PRN20240108", "ml_fa1": 8, "ml_fa2": 10, "ml_sa": 19, "att": 71, "certs": 0, "courses": ""},
            {"name": "Omkar Jadhav", "email": "omkar.jadhav@pccoepune.org", "prn": "PRN20240109", "ml_fa1": 9, "ml_fa2": 9, "ml_sa": 18, "att": 68, "certs": 0, "courses": ""},
            {"name": "Pranav Sawant", "email": "pranav.sawant@pccoepune.org", "prn": "PRN20240110", "ml_fa1": 7, "ml_fa2": 11, "ml_sa": 17, "att": 69, "certs": 0, "courses": ""}
        ]

        ml_sub = subject_map["CS301"]
        cloud_sub = subject_map["CS302L"]
        db_sub = subject_map["CS303"]

        created_student_count = 0
        for s in students_info:
            u = db.query(User).filter(User.email == s["email"]).first()
            if not u:
                u = User(
                    email=s["email"],
                    full_name=s["name"],
                    password_hash=hash_password("Student@123"),
                    role="student"
                )
                db.add(u)
                db.flush()

                st_prof = StudentProfile(
                    user_id=u.id,
                    prn=s["prn"],
                    department="Computer Engineering",
                    year="TE",
                    semester=5
                )
                db.add(st_prof)
                db.flush()
                created_student_count += 1
            else:
                st_prof = u.student_profile

            # Add Machine Learning record (3 credits Theory -> max 100)
            ml_total = s["ml_fa1"] + s["ml_fa2"] + s["ml_sa"]
            r_ml = db.query(AcademicRecord).filter(
                AcademicRecord.student_id == st_prof.id,
                AcademicRecord.subject_id == ml_sub.id
            ).first()
            if not r_ml:
                r_ml = AcademicRecord(
                    student_id=st_prof.id,
                    subject_id=ml_sub.id,
                    fa1=float(s["ml_fa1"]),
                    fa2=float(s["ml_fa2"]),
                    sa=float(s["ml_sa"]),
                    total_marks=float(ml_total),
                    attendance_pct=float(s["att"]),
                    certs_count=s["certs"],
                    external_courses=s["courses"]
                )
                db.add(r_ml)

            # Add Cloud Computing Lab record (2 credits Lab -> max 50)
            lab_total = min(48.0, round(ml_total * 0.48, 1))
            r_lab = db.query(AcademicRecord).filter(
                AcademicRecord.student_id == st_prof.id,
                AcademicRecord.subject_id == cloud_sub.id
            ).first()
            if not r_lab:
                r_lab = AcademicRecord(
                    student_id=st_prof.id,
                    subject_id=cloud_sub.id,
                    fa1=round(lab_total * 0.3, 1),
                    fa2=round(lab_total * 0.3, 1),
                    sa=round(lab_total * 0.4, 1),
                    total_marks=lab_total,
                    attendance_pct=float(s["att"]),
                    certs_count=s["certs"],
                    external_courses=s["courses"]
                )
                db.add(r_lab)

            db.commit()
            print(f"✅ Seeded {len(students_info)} students with academic records.")

            # 4. Trigger AI Matching on seeded data for ML
            pairings = run_ai_peer_matching(db=db, subject_id=ml_sub.id, strategy="complementary")
            print(f"✅ Generated {len(pairings)} complementary peer pairings for CS301 (Machine Learning).")

        # 5. Generate sample Excel files for testing
        generate_mock_files()

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise e
    finally:
        db.close()

def generate_mock_files():
    """Generates valid and invalid sample Excel files in sample_data/."""
    os.makedirs("sample_data", exist_ok=True)
    
    # Valid file: 16 rows respecting all credit caps
    valid_rows = [
        {"Name": "Rahul Deshmukh", "PRN": "PRN20240101", "Email": "rahul.deshmukh@pccoepune.org", "Subject_Code": "CS301", "Subject_Name": "Machine Learning", "Subject_Type": "Theory", "Credits": 3, "FA1": 22.0, "FA2": 24.0, "SA": 46.0, "Attendance": 94.0, "Certifications_Count": 2, "External_Courses": "DeepLearning.AI"},
        {"Name": "Tanvi Joshi", "PRN": "PRN20240102", "Email": "tanvi.joshi@pccoepune.org", "Subject_Code": "CS301", "Subject_Name": "Machine Learning", "Subject_Type": "Theory", "Credits": 3, "FA1": 21.0, "FA2": 23.0, "SA": 44.0, "Attendance": 92.0, "Certifications_Count": 3, "External_Courses": "Stanford ML"},
        {"Name": "Ananya Patil", "PRN": "PRN20240108", "Email": "ananya.patil@pccoepune.org", "Subject_Code": "CS301", "Subject_Name": "Machine Learning", "Subject_Type": "Theory", "Credits": 3, "FA1": 8.0, "FA2": 10.0, "SA": 19.0, "Attendance": 71.0, "Certifications_Count": 0, "External_Courses": ""},
        {"Name": "Omkar Jadhav", "PRN": "PRN20240109", "Email": "omkar.jadhav@pccoepune.org", "Subject_Code": "CS301", "Subject_Name": "Machine Learning", "Subject_Type": "Theory", "Credits": 3, "FA1": 9.0, "FA2": 9.0, "SA": 18.0, "Attendance": 68.0, "Certifications_Count": 0, "External_Courses": ""},
        {"Name": "Sneha Kulkarni", "PRN": "PRN20240104", "Email": "sneha.kulkarni@pccoepune.org", "Subject_Code": "CS302L", "Subject_Name": "Cloud Computing Lab", "Subject_Type": "Lab", "Credits": 2, "FA1": 13.0, "FA2": 14.0, "SA": 21.0, "Attendance": 88.0, "Certifications_Count": 1, "External_Courses": "GCP Associate"},
        {"Name": "Aditya Joshi", "PRN": "PRN20240105", "Email": "aditya.joshi@pccoepune.org", "Subject_Code": "CS304L", "Subject_Name": "Advanced Programming Lab", "Subject_Type": "Lab", "Credits": 1, "FA1": 7.0, "FA2": 8.0, "SA": 9.0, "Attendance": 85.0, "Certifications_Count": 1, "External_Courses": "LeetCode 100"}
    ]

    valid_df = pd.DataFrame(valid_rows)
    valid_path = os.path.join("sample_data", "pccoe_sample_student_data.xlsx")
    valid_df.to_excel(valid_path, index=False)
    print(f"📁 Created valid sample file: {valid_path}")

    # Invalid file: Contains intentional credit-cap and domain violations for testing
    invalid_rows = [
        # Violation 1: External email domain
        {"Name": "External Student", "PRN": "PRN20240999", "Email": "external.student@gmail.com", "Subject_Code": "CS301", "Subject_Name": "Machine Learning", "Subject_Type": "Theory", "Credits": 3, "FA1": 20.0, "FA2": 20.0, "SA": 40.0, "Attendance": 85.0, "Certifications_Count": 0, "External_Courses": ""},
        # Violation 2: Theory 2-Credit exceeds 50 (FA1=20, FA2=20, SA=20 -> Total 60 > 50)
        {"Name": "Vipul Mehta", "PRN": "PRN20240120", "Email": "vipul.mehta@pccoepune.org", "Subject_Code": "CS303", "Subject_Name": "Database Engineering", "Subject_Type": "Theory", "Credits": 2, "FA1": 20.0, "FA2": 20.0, "SA": 20.0, "Attendance": 90.0, "Certifications_Count": 1, "External_Courses": "SQL"},
        # Violation 3: Lab 1-Credit exceeds 25 (Total 30 > 25)
        {"Name": "Kavita Rao", "PRN": "PRN20240121", "Email": "kavita.rao@pccoepune.org", "Subject_Code": "CS304L", "Subject_Name": "Advanced Programming Lab", "Subject_Type": "Lab", "Credits": 1, "FA1": 10.0, "FA2": 10.0, "SA": 10.0, "Attendance": 95.0, "Certifications_Count": 0, "External_Courses": ""},
        # Violation 4: Lab 2-Credit exceeds 50 (Total 55 > 50)
        {"Name": "Deepak Verma", "PRN": "PRN20240122", "Email": "deepak.verma@pccoepune.org", "Subject_Code": "CS302L", "Subject_Name": "Cloud Computing Lab", "Subject_Type": "Lab", "Credits": 2, "FA1": 20.0, "FA2": 20.0, "SA": 15.0, "Attendance": 80.0, "Certifications_Count": 1, "External_Courses": "Docker"}
    ]
    invalid_df = pd.DataFrame(invalid_rows)
    invalid_path = os.path.join("sample_data", "pccoe_invalid_data.xlsx")
    invalid_df.to_excel(invalid_path, index=False)
    print(f"📁 Created invalid guardrail test file: {invalid_path}")

if __name__ == "__main__":
    with_students = "--with-students" in sys.argv
    seed_database(seed_students=with_students)
