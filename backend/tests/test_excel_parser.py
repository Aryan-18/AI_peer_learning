import os
import pytest
from app.database import SessionLocal
from app.services.excel_parser import validate_and_parse_student_file

def test_credit_aware_guardrails():
    db = SessionLocal()
    try:
        invalid_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "sample_data", "pccoe_invalid_data.xlsx")
        assert os.path.exists(invalid_path), f"File {invalid_path} not found"
        
        with open(invalid_path, "rb") as f:
            bytes_data = f.read()

        result = validate_and_parse_student_file(
            file_bytes=bytes_data,
            filename="pccoe_invalid_data.xlsx",
            db=db,
            commit_if_valid=False
        )

        assert result["success"] is False
        assert len(result["errors"]) >= 3

        error_texts = [e["error"] for e in result["errors"]]
        # Verify specific credit violations caught
        assert any("Domain" in err or "@pccoepune.org" in err for err in error_texts)
        assert any("Theory 2-Credit" in err or "exceeds" in err for err in error_texts)
        assert any("Lab 1-Credit" in err or "Lab 2-Credit" in err for err in error_texts)
    finally:
        db.close()

def test_valid_excel_ingestion():
    db = SessionLocal()
    try:
        valid_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "sample_data", "pccoe_sample_student_data.xlsx")
        assert os.path.exists(valid_path)

        with open(valid_path, "rb") as f:
            bytes_data = f.read()

        result = validate_and_parse_student_file(
            file_bytes=bytes_data,
            filename="pccoe_sample_student_data.xlsx",
            db=db,
            commit_if_valid=False
        )

        assert result["success"] is True
        assert len(result["errors"]) == 0
        assert result["valid_rows_processed"] > 0
    finally:
        db.close()

from app.services.excel_parser import validate_and_parse_record_dicts

def test_direct_fill_records_valid():
    db = SessionLocal()
    try:
        sample_records = [
            {
                "Name": "Direct Student Alpha",
                "PRN": "125B88001",
                "Email": "alpha@pccoepune.org",
                "Subject_Code": "BCS23PC02",
                "Subject_Name": "Machine Learning",
                "Subject_Type": "Theory",
                "Credits": 2,
                "FA1": 15.0,
                "FA2": 15.0,
                "SA": 15.0,
                "Attendance": 90.0,
                "Certifications_Count": 1,
                "External_Courses": "Deep Learning"
            }
        ]
        res = validate_and_parse_record_dicts(sample_records, db=db, commit_if_valid=False)
        assert res["success"] is True
        assert res["valid_rows_processed"] == 1
        assert len(res["errors"]) == 0
    finally:
        db.close()

def test_direct_fill_records_invalid_cap():
    db = SessionLocal()
    try:
        sample_records = [
            {
                "Name": "Direct Student Beta",
                "PRN": "125B88002",
                "Email": "beta@pccoepune.org",
                "Subject_Code": "BCS23PC02",
                "Subject_Type": "Theory",
                "Credits": 2,
                "FA1": 30.0,
                "FA2": 30.0,
                "SA": 0.0, # Total 60 > 50 cap for 2-credit Theory
                "Attendance": 80.0
            }
        ]
        res = validate_and_parse_record_dicts(sample_records, db=db, commit_if_valid=False)
        assert res["success"] is False
        assert len(res["errors"]) == 1
        assert "Theory 2-Credit Limit Violated" in res["errors"][0]["error"]
    finally:
        db.close()

