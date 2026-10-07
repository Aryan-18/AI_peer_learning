import numpy as np
import pandas as pd
from typing import Dict, List, Any

def get_max_marks_for_subject(subject_type: str, credits: int) -> float:
    """Calculate maximum marks based on credit-aware institutional guidelines."""
    stype = str(subject_type).strip().capitalize()
    if stype == "Theory":
        return 50.0 if credits == 2 else 100.0
    elif stype == "Lab":
        if credits == 1:
            return 25.0
        elif credits == 2:
            return 50.0
        else:
            return 100.0
    return 100.0

def vectorize_student_records(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw academic records into a normalized multi-dimensional feature space.
    Features:
      - norm_marks: total marks / max allowable marks [0, 1]
      - norm_attendance: attendance / 100 [0, 1]
      - norm_certs: certifications & external courses score [0, 1]
      - fa1_ratio: formative assessment 1 ratio
      - fa2_ratio: formative assessment 2 ratio
      - sa_ratio: summative assessment ratio
      - composite_proficiency: weighted score (60% marks, 25% attendance, 15% supplemental)
    """
    if not records:
        return pd.DataFrame()

    df = pd.DataFrame(records)

    # Calculate max marks
    df["max_marks"] = df.apply(
        lambda r: get_max_marks_for_subject(r.get("subject_type", "Theory"), r.get("credits", 3)),
        axis=1
    )

    # Normalize metrics
    df["norm_marks"] = np.clip(df["total_marks"] / df["max_marks"], 0.0, 1.0)
    df["norm_attendance"] = np.clip(df["attendance_pct"] / 100.0, 0.0, 1.0)

    # Supplemental metric calculation
    def calc_supplemental(row):
        certs = float(row.get("certs_count", 0))
        ext_courses = str(row.get("external_courses", "")).strip()
        course_count = len([c for c in ext_courses.split(",") if c.strip()]) if ext_courses else 0
        total_supp = (certs * 0.5) + (course_count * 0.5)
        return min(1.0, total_supp / 3.0)

    df["norm_certs"] = df.apply(calc_supplemental, axis=1)

    # Component ratios
    df["fa1_ratio"] = np.where(df["total_marks"] > 0, df["fa1"] / df["total_marks"], 0.33)
    df["fa2_ratio"] = np.where(df["total_marks"] > 0, df["fa2"] / df["total_marks"], 0.33)
    df["sa_ratio"] = np.where(df["total_marks"] > 0, df["sa"] / df["total_marks"], 0.34)

    # Composite Proficiency Score (P)
    df["composite_proficiency"] = (
        0.60 * df["norm_marks"] +
        0.25 * df["norm_attendance"] +
        0.15 * df["norm_certs"]
    )

    # Categorization
    def categorize(p):
        if p >= 0.68:
            return "high"
        elif p < 0.45:
            return "lagging"
        else:
            return "average"

    df["category"] = df["composite_proficiency"].apply(categorize)

    return df
