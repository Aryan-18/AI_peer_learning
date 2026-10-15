from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# SQLite connects with check_same_thread=False
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_database():
    """
    Creates tables, performs column migrations for existing SQLite databases,
    and synchronizes official curriculum courses.
    """
    Base.metadata.create_all(bind=engine)

    # Safely migrate new columns if using SQLite
    with engine.connect() as conn:
        try:
            # Check student_profiles columns
            existing_sp_cols = [
                row[1] for row in conn.exec_driver_sql("PRAGMA table_info(student_profiles)").fetchall()
            ]
            if "scheme" not in existing_sp_cols:
                conn.exec_driver_sql("ALTER TABLE student_profiles ADD COLUMN scheme VARCHAR(50);")
            if "selected_electives_json" not in existing_sp_cols:
                conn.exec_driver_sql("ALTER TABLE student_profiles ADD COLUMN selected_electives_json VARCHAR(2000) DEFAULT '{}';")

            # Check subjects columns
            existing_sub_cols = [
                row[1] for row in conn.exec_driver_sql("PRAGMA table_info(subjects)").fetchall()
            ]
            if "max_marks" not in existing_sub_cols:
                conn.exec_driver_sql("ALTER TABLE subjects ADD COLUMN max_marks FLOAT DEFAULT 100.0;")
            if "year" not in existing_sub_cols:
                conn.exec_driver_sql("ALTER TABLE subjects ADD COLUMN year VARCHAR(50);")
            if "semester" not in existing_sub_cols:
                conn.exec_driver_sql("ALTER TABLE subjects ADD COLUMN semester VARCHAR(50);")
            if "scheme" not in existing_sub_cols:
                conn.exec_driver_sql("ALTER TABLE subjects ADD COLUMN scheme VARCHAR(50);")

            # Check users columns
            existing_user_cols = [
                row[1] for row in conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
            ]
            if "teaching_courses" not in existing_user_cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN teaching_courses VARCHAR(2000);")

            conn.commit()
        except Exception as e:
            # Non-fatal if dialect is not sqlite or table doesn't exist yet
            pass

    # Synchronize curriculum subjects
    try:
        from app.core.curriculum import get_all_curriculum_subjects
        from app.models.academic import Subject
        db = SessionLocal()
        try:
            all_curr = get_all_curriculum_subjects()
            for s in all_curr:
                existing = db.query(Subject).filter(Subject.code == s["code"]).first()
                if not existing:
                    new_sub = Subject(
                        code=s["code"],
                        name=s["name"],
                        subject_type=s["subject_type"],
                        credits=s["credits"],
                        max_marks=float(s["max_marks"]),
                        year=s.get("year"),
                        semester=s.get("semester"),
                        scheme=s.get("scheme"),
                    )
                    db.add(new_sub)
                else:
                    # Update fields if needed
                    existing.max_marks = float(s["max_marks"])
                    existing.credits = s["credits"]
                    existing.year = s.get("year")
                    existing.semester = s.get("semester")
                    existing.scheme = s.get("scheme")
            db.commit()
        finally:
            db.close()
    except Exception as e:
        pass

    # Normalize existing student profiles where semester or year is integer or shorthand
    try:
        from app.core.curriculum import normalize_semester_name, normalize_year_name
        from app.models.student import StudentProfile
        db = SessionLocal()
        try:
            students = db.query(StudentProfile).all()
            changed = False
            for stu in students:
                if stu.semester is not None:
                    norm_sem = normalize_semester_name(str(stu.semester))
                    if norm_sem and norm_sem != stu.semester:
                        stu.semester = norm_sem
                        changed = True
                    elif isinstance(stu.semester, int):
                        stu.semester = str(stu.semester)
                        changed = True
                if stu.year is not None:
                    norm_yr = normalize_year_name(str(stu.year))
                    if norm_yr and norm_yr != stu.year:
                        stu.year = norm_yr
                        changed = True
                if stu.prn is not None and not isinstance(stu.prn, str):
                    stu.prn = str(stu.prn)
                    changed = True
            if changed:
                db.commit()
        finally:
            db.close()
    except Exception as e:
        pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

