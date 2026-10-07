import pytest
import pandas as pd
from app.ai.vectorizer import vectorize_student_records, get_max_marks_for_subject
from app.ai.matcher import compute_complementary_pairings, compute_balanced_pairings
from app.ai.rationale_gen import generate_pairing_rationale
from app.ai.project_recommender import recommend_project_for_pair

def test_credit_max_marks_calculation():
    assert get_max_marks_for_subject("Theory", 2) == 50.0
    assert get_max_marks_for_subject("Theory", 3) == 100.0
    assert get_max_marks_for_subject("Lab", 1) == 25.0
    assert get_max_marks_for_subject("Lab", 2) == 50.0
    assert get_max_marks_for_subject("Lab", 3) == 100.0

def test_vectorizer_and_matching_pipeline():
    sample_students = [
        {"student_id": 1, "name": "Mentor A", "total_marks": 90.0, "subject_type": "Theory", "credits": 3, "attendance_pct": 95.0, "certs_count": 2, "external_courses": "Coursera", "fa1": 25.0, "fa2": 25.0, "sa": 40.0},
        {"student_id": 2, "name": "Mentee B", "total_marks": 35.0, "subject_type": "Theory", "credits": 3, "attendance_pct": 70.0, "certs_count": 0, "external_courses": "", "fa1": 10.0, "fa2": 10.0, "sa": 15.0},
        {"student_id": 3, "name": "Peer C", "total_marks": 65.0, "subject_type": "Theory", "credits": 3, "attendance_pct": 82.0, "certs_count": 1, "external_courses": "Python", "fa1": 15.0, "fa2": 20.0, "sa": 30.0},
        {"student_id": 4, "name": "Peer D", "total_marks": 63.0, "subject_type": "Theory", "credits": 3, "attendance_pct": 84.0, "certs_count": 1, "external_courses": "Python", "fa1": 16.0, "fa2": 18.0, "sa": 29.0},
    ]

    df = vectorize_student_records(sample_students)
    assert not df.empty
    assert "composite_proficiency" in df.columns
    assert "norm_marks" in df.columns

    # Check Complementary Pairing
    comp_pairs = compute_complementary_pairings(df)
    assert len(comp_pairs) >= 1
    pair1 = comp_pairs[0]
    assert pair1["strategy"] == "complementary"
    assert pair1["mentor"]["student_id"] == 1
    assert pair1["mentee"]["student_id"] == 2

    # Check Balanced Pairing
    bal_pairs = compute_balanced_pairings(df)
    assert len(bal_pairs) >= 1

    # Check AI Rationale
    rationale = generate_pairing_rationale(
        mentor=pair1["mentor"],
        mentee=pair1["mentee"],
        subject_name="Machine Learning",
        strategy="complementary"
    )
    assert "ai_rationale" in rationale
    assert "Machine Learning" in rationale["ai_rationale"]

    # Check Micro-Project Recommender
    project = recommend_project_for_pair("Machine Learning", 0.9, 0.4, "complementary")
    assert "title" in project
    assert len(project["milestones"]) == 4
