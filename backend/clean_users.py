"""
clean_users.py
Deletes all registered user accounts (students and faculty), student profiles,
academic records, and pairings, while keeping all institutional curriculum subjects intact.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.student import StudentProfile
from app.models.academic import AcademicRecord, Subject
from app.models.pairing import Pairing

def clean_database():
    db = SessionLocal()
    try:
        pairings_del = db.query(Pairing).delete()
        records_del = db.query(AcademicRecord).delete()
        profiles_del = db.query(StudentProfile).delete()
        users_del = db.query(User).delete()
        db.commit()
        
        subjects_count = db.query(Subject).count()
        print("🧹 Cleaned database successfully:")
        print(f"   - Removed {users_del} user accounts (both students and faculties)")
        print(f"   - Removed {profiles_del} student profiles")
        print(f"   - Removed {records_del} academic performance records")
        print(f"   - Removed {pairings_del} peer pairings")
        print(f"✅ Preserved {subjects_count} institutional curriculum courses.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error cleaning database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()
