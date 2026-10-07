"""
PCCOE Pune • Institutional Curriculum & Scheme Definition Module
B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)

Exclusions:
- All Open Elective (OE) subjects excluded.
- All Multidisciplinary Minor (MDM) courses & MDM Projects excluded.

Supports:
- Second Year (SY): Semester III, Semester IV
- Third Year (TY): Semester V, Semester VI (with Programme Elective dropdowns)
- Final Year (B.Tech): Scheme A and Scheme B for Semester VII & Semester VIII
"""

from typing import Dict, List, Optional, Any

# Structured modular curriculum data store
CURRICULUM_DATA: Dict[str, Any] = {
    "Second Year (SY)": {
        "schemes": None,  # No schemes for SY
        "semesters": {
            "Semester III": [
                {
                    "code": "BCS23PC02",
                    "name": "Machine Learning",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS23PC03",
                    "name": "Data Structures & Algorithms",
                    "credits": 3,
                    "max_marks": 100,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS23PC05",
                    "name": "Data Structures Laboratory",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS23PC06",
                    "name": "Java Programming",
                    "credits": 1,
                    "max_marks": 50,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS23EM01",
                    "name": "Financial Modelling & AI",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BSH23VE01",
                    "name": "Universal Human Values",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS23EL01",
                    "name": "Community Engineering Project",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Project",
                    "is_elective": False,
                },
            ],
            "Semester IV": [
                {
                    "code": "BCS24PC06",
                    "name": "Theory of Computation",
                    "credits": 3,
                    "max_marks": 100,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS24PC07",
                    "name": "Database Management Systems",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS24PC08",
                    "name": "Database Management Systems Laboratory",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS24PC09",
                    "name": "Advanced Data Structures Laboratory",
                    "credits": 1,
                    "max_marks": 50,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS24VS03",
                    "name": "Full Stack Development-I",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS24EM02",
                    "name": "Business Process Integration with ERP",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BSH24AE05",
                    "name": "Professional Development Training",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BSH24VE02",
                    "name": "Constitution of India",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
            ],
        },
    },
    "Third Year (TY)": {
        "schemes": None,  # No schemes for TY
        "semesters": {
            "Semester V": [
                {
                    "code": "BCS25PC10",
                    "name": "Artificial Intelligence",
                    "credits": 3,
                    "max_marks": 100,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC11",
                    "name": "Computer Networks",
                    "credits": 3,
                    "max_marks": 100,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC12",
                    "name": "Artificial Intelligence Lab",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC13",
                    "name": "Embedded AI Lab",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC14",
                    "name": "Natural Language Processing",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC15",
                    "name": "Natural Language Processing Laboratory",
                    "credits": 1,
                    "max_marks": 50,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC16",
                    "name": "Information Security",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS25PC17",
                    "name": "Information Security Laboratory",
                    "credits": 1,
                    "max_marks": 50,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
            ],
            "Semester VI": [
                {
                    "code": "BCS26PC14",
                    "name": "Design & Analysis of Algorithms",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS26PC15",
                    "name": "Computer Vision",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS26PC16",
                    "name": "Deep Learning",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": False,
                },
                {
                    "code": "BCS26PC17",
                    "name": "Computer Vision & Deep Learning Lab",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
                {
                    "code": "BCS26PE01-03",
                    "name": "Programme Elective-I",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": True,
                    "elective_group": "PE-I",
                    "default_choice": "BCS26PE01",
                    "options": [
                        {"code": "BCS26PE01", "name": "Cloud Computing", "credits": 2, "max_marks": 50},
                        {"code": "BCS26PE02", "name": "Cyber Security & Digital Forensics", "credits": 2, "max_marks": 50},
                        {"code": "BCS26PE03", "name": "Blockchain Technology", "credits": 2, "max_marks": 50},
                    ],
                },
                {
                    "code": "BCS26PE04-06",
                    "name": "Programme Elective Laboratory-I",
                    "credits": 1,
                    "max_marks": 50,
                    "subject_type": "Lab",
                    "is_elective": True,
                    "elective_group": "PE-I Lab",
                    "default_choice": "BCS26PE04",
                    "options": [
                        {"code": "BCS26PE04", "name": "Cloud Computing Laboratory", "credits": 1, "max_marks": 50},
                        {"code": "BCS26PE05", "name": "Cyber Security & Digital Forensics Laboratory", "credits": 1, "max_marks": 50},
                        {"code": "BCS26PE06", "name": "Blockchain Technology Laboratory", "credits": 1, "max_marks": 50},
                    ],
                },
                {
                    "code": "BCS26PE21-23",
                    "name": "Programme Elective-II",
                    "credits": 2,
                    "max_marks": 50,
                    "subject_type": "Theory",
                    "is_elective": True,
                    "elective_group": "PE-II",
                    "default_choice": "BCS26PE21",
                    "options": [
                        {"code": "BCS26PE21", "name": "Quantum Computing", "credits": 2, "max_marks": 50},
                        {"code": "BCS26PE22", "name": "Robotics & Intelligent Systems", "credits": 2, "max_marks": 50},
                        {"code": "BCS26PE23", "name": "Augmented & Virtual Reality", "credits": 2, "max_marks": 50},
                    ],
                },
                {
                    "code": "BCS26PE24-26",
                    "name": "Programme Elective Laboratory-II",
                    "credits": 1,
                    "max_marks": 50,
                    "subject_type": "Lab",
                    "is_elective": True,
                    "elective_group": "PE-II Lab",
                    "default_choice": "BCS26PE24",
                    "options": [
                        {"code": "BCS26PE24", "name": "Quantum Computing Laboratory", "credits": 1, "max_marks": 50},
                        {"code": "BCS26PE25", "name": "Robotics & Intelligent Systems Laboratory", "credits": 1, "max_marks": 50},
                        {"code": "BCS26PE26", "name": "Augmented & Virtual Reality Laboratory", "credits": 1, "max_marks": 50},
                    ],
                },
                {
                    "code": "BCS26PE27",
                    "name": "Programme Elective Project",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Project",
                    "is_elective": False,
                },
                {
                    "code": "BCS26VS04",
                    "name": "Full Stack Development-II",
                    "credits": 2,
                    "max_marks": 100,
                    "subject_type": "Lab",
                    "is_elective": False,
                },
            ],
        },
    },
    "Final Year (B.Tech)": {
        "schemes": ["Scheme A", "Scheme B"],
        "scheme_semesters": {
            "Scheme A": {
                "Semester VII": [
                    {
                        "code": "BCS27PC18",
                        "name": "Soft Computing & Optimization Algorithms",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS27PC19",
                        "name": "Big Data Analytics",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS27PC20",
                        "name": "Soft Computing & Optimization Algorithms Laboratory",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Lab",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS27PC21",
                        "name": "Big Data Analytics Laboratory",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Lab",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS27PE21-23",
                        "name": "Programme Elective-IV",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": True,
                        "elective_group": "PE-IV",
                        "default_choice": "BCS27PE21",
                        "options": [
                            {"code": "BCS27PE21", "name": "Generative AI & Large Language Models", "credits": 3, "max_marks": 100},
                            {"code": "BCS27PE22", "name": "Edge AI & Intelligent IoT Systems", "credits": 3, "max_marks": 100},
                            {"code": "BCS27PE23", "name": "Deep Reinforcement Learning", "credits": 3, "max_marks": 100},
                        ],
                    },
                    {
                        "code": "BCS27PE24-26",
                        "name": "Programme Elective-IV Laboratory",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Lab",
                        "is_elective": True,
                        "elective_group": "PE-IV Lab",
                        "default_choice": "BCS27PE24",
                        "options": [
                            {"code": "BCS27PE24", "name": "Generative AI & Large Language Models Laboratory", "credits": 1, "max_marks": 50},
                            {"code": "BCS27PE25", "name": "Edge AI Laboratory", "credits": 1, "max_marks": 50},
                            {"code": "BCS27PE26", "name": "Deep Reinforcement Learning Laboratory", "credits": 1, "max_marks": 50},
                        ],
                    },
                    {
                        "code": "BCS27EL02",
                        "name": "Research Methodology",
                        "credits": 4,
                        "max_marks": 150,
                        "subject_type": "Theory",
                        "is_elective": False,
                    },
                ],
                "Semester VIII": [
                    {
                        "code": "BCS28PE27",
                        "name": "Programme Elective-V (MOOC)",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": True,
                        "elective_group": "PE-V",
                        "default_choice": "BCS28PE27-A",
                        "options": [
                            {"code": "BCS28PE27-A", "name": "NPTEL: Deep Learning for Natural Language Processing", "credits": 3, "max_marks": 100},
                            {"code": "BCS28PE27-B", "name": "NPTEL: AI Ethics and Algorithmic Governance", "credits": 3, "max_marks": 100},
                            {"code": "BCS28PE27-C", "name": "SWAYAM: Advanced MLOps & Real-Time Model Deployment", "credits": 3, "max_marks": 100},
                        ],
                    },
                    {
                        "code": "BCS28PE28",
                        "name": "Programme Elective Seminar",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Seminar",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS28EL03",
                        "name": "Major Project",
                        "credits": 4,
                        "max_marks": 200,
                        "subject_type": "Project",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS28EL04",
                        "name": "Internship / On Job Training (OJT)",
                        "credits": 12,
                        "max_marks": 400,
                        "subject_type": "Project",
                        "is_elective": False,
                    },
                ],
            },
            "Scheme B": {
                "Semester VII": [
                    {
                        "code": "BCS28PC18",
                        "name": "Soft Computing & Optimization Algorithms",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS28PC19",
                        "name": "Big Data Analytics",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS28PC20",
                        "name": "Soft Computing & Optimization Algorithms Laboratory",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Lab",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS28PC21",
                        "name": "Big Data Analytics Laboratory",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Lab",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS27PE21-23",
                        "name": "Programme Elective-IV",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": True,
                        "elective_group": "PE-IV",
                        "default_choice": "BCS27PE21",
                        "options": [
                            {"code": "BCS27PE21", "name": "Generative AI & Large Language Models", "credits": 3, "max_marks": 100},
                            {"code": "BCS27PE22", "name": "Edge AI & Intelligent IoT Systems", "credits": 3, "max_marks": 100},
                            {"code": "BCS27PE23", "name": "Deep Reinforcement Learning", "credits": 3, "max_marks": 100},
                        ],
                    },
                    {
                        "code": "BCS27PE24-26",
                        "name": "Programme Elective-IV Laboratory",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Lab",
                        "is_elective": True,
                        "elective_group": "PE-IV Lab",
                        "default_choice": "BCS27PE24",
                        "options": [
                            {"code": "BCS27PE24", "name": "Generative AI & Large Language Models Laboratory", "credits": 1, "max_marks": 50},
                            {"code": "BCS27PE25", "name": "Edge AI Laboratory", "credits": 1, "max_marks": 50},
                            {"code": "BCS27PE26", "name": "Deep Reinforcement Learning Laboratory", "credits": 1, "max_marks": 50},
                        ],
                    },
                    {
                        "code": "BCS28EL03",
                        "name": "Major Project",
                        "credits": 4,
                        "max_marks": 200,
                        "subject_type": "Project",
                        "is_elective": False,
                    },
                ],
                "Semester VIII": [
                    {
                        "code": "BCS28EL02",
                        "name": "Research Methodology",
                        "credits": 4,
                        "max_marks": 150,
                        "subject_type": "Theory",
                        "is_elective": False,
                    },
                    # Note: MDM Project is strictly excluded here per specification
                    {
                        "code": "BCS27PE27",
                        "name": "Programme Elective-V (MOOC)",
                        "credits": 3,
                        "max_marks": 100,
                        "subject_type": "Theory",
                        "is_elective": True,
                        "elective_group": "PE-V",
                        "default_choice": "BCS27PE27-A",
                        "options": [
                            {"code": "BCS27PE27-A", "name": "NPTEL: Deep Learning for Natural Language Processing", "credits": 3, "max_marks": 100},
                            {"code": "BCS27PE27-B", "name": "NPTEL: AI Ethics and Algorithmic Governance", "credits": 3, "max_marks": 100},
                            {"code": "BCS27PE27-C", "name": "SWAYAM: Advanced MLOps & Real-Time Model Deployment", "credits": 3, "max_marks": 100},
                        ],
                    },
                    {
                        "code": "BCS27PE28",
                        "name": "Programme Elective Seminar",
                        "credits": 1,
                        "max_marks": 50,
                        "subject_type": "Seminar",
                        "is_elective": False,
                    },
                    {
                        "code": "BCS27EL04",
                        "name": "Internship / On Job Training (OJT)",
                        "credits": 12,
                        "max_marks": 400,
                        "subject_type": "Project",
                        "is_elective": False,
                    },
                ],
            },
        },
    },
}


def normalize_semester_name(sem: Optional[str]) -> str:
    """Standardizes semester string formats like '3', 'Semester 3', 'Semester III', 'Sem 5', 'V'."""
    if not sem:
        return "Semester III"
    s = str(sem).strip().lower().replace("sem.", "sem").replace("-", " ")
    
    # Check Roman numerals in descending order of specificity
    # Note: 'iv' must be checked before 'v', and 'iii' before 'ii' and 'i'
    if "viii" in s or "8" in s:
        return "Semester VIII"
    elif "vii" in s or "7" in s:
        return "Semester VII"
    elif "vi" in s or "6" in s:
        return "Semester VI"
    elif "iv" in s or "4" in s:
        return "Semester IV"
    elif "v" in s or "5" in s:
        return "Semester V"
    elif "iii" in s or "3" in s:
        return "Semester III"
    elif "ii" in s or "2" in s:
        return "Semester II"
    elif "i" in s or "1" in s:
        return "Semester I"
        
    return str(sem).strip()


def normalize_year_name(year: Optional[str], semester: Optional[str] = None) -> str:
    """Standardizes year string representations (SY, TY, Final Year, SE, TE, BE)."""
    clean_sem = normalize_semester_name(semester) if semester else None

    # If semester is explicitly specified, use it as primary truth
    if clean_sem in ["Semester VII", "Semester VIII"]:
        return "Final Year (B.Tech)"
    elif clean_sem in ["Semester V", "Semester VI"]:
        return "Third Year (TY)"
    elif clean_sem in ["Semester III", "Semester IV"]:
        return "Second Year (SY)"

    if not year:
        return "Second Year (SY)"
    y = str(year).strip().lower()
    if "final" in y or "4" in y or "fourth" in y or "b.tech" in y or y == "be":
        return "Final Year (B.Tech)"
    elif "third" in y or "ty" in y or y == "te" or "3" in y:
        return "Third Year (TY)"
    return "Second Year (SY)"


def get_curriculum_for_student(year: str, semester: str, scheme: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves the raw curriculum definition for the specified year, semester, and scheme.
    """
    clean_sem = normalize_semester_name(semester)
    clean_year = normalize_year_name(year, clean_sem)

    year_data = CURRICULUM_DATA.get(clean_year)
    if not year_data:
        # Default fallback to SY
        year_data = CURRICULUM_DATA["Second Year (SY)"]

    if clean_year == "Final Year (B.Tech)":
        clean_scheme = scheme if scheme in ["Scheme A", "Scheme B"] else "Scheme A"
        scheme_data = year_data.get("scheme_semesters", {}).get(clean_scheme, {})
        return scheme_data.get(clean_sem, scheme_data.get("Semester VII", []))
    else:
        semesters = year_data.get("semesters", {})
        if clean_sem in semesters:
            return semesters[clean_sem]
        # Return first available semester in this year
        first_sem = next(iter(semesters.keys()), "Semester III")
        return semesters.get(first_sem, [])


def resolve_student_subjects(
    year: str,
    semester: str,
    scheme: Optional[str] = None,
    selected_electives: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Dynamically loads the curriculum and substitutes elective placeholders
    with the student's selected elective course code, course name, credits, and max marks.
    """
    raw_subjects = get_curriculum_for_student(year, semester, scheme)
    resolved: List[Dict[str, Any]] = []
    selected_electives = selected_electives or {}

    for item in raw_subjects:
        if not item.get("is_elective"):
            resolved.append({
                "code": item["code"],
                "name": item["name"],
                "credits": item["credits"],
                "max_marks": item["max_marks"],
                "subject_type": item["subject_type"],
                "is_elective": False,
                "elective_group": None,
                "available_options": None,
            })
        else:
            group = item.get("elective_group", "")
            options = item.get("options", [])
            user_choice_code = selected_electives.get(group)
            
            # Find chosen option or fallback to default
            chosen_opt = None
            if user_choice_code:
                chosen_opt = next((opt for opt in options if opt["code"] == user_choice_code), None)
            
            if not chosen_opt:
                default_code = item.get("default_choice")
                chosen_opt = next((opt for opt in options if opt["code"] == default_code), options[0] if options else None)

            if chosen_opt:
                resolved.append({
                    "code": chosen_opt["code"],
                    "name": chosen_opt["name"],
                    "credits": chosen_opt.get("credits", item["credits"]),
                    "max_marks": chosen_opt.get("max_marks", item["max_marks"]),
                    "subject_type": item["subject_type"],
                    "is_elective": True,
                    "elective_group": group,
                    "generic_name": item["name"],
                    "available_options": options,
                    "selected_option_code": chosen_opt["code"],
                })
            else:
                resolved.append({
                    "code": item["code"],
                    "name": item["name"],
                    "credits": item["credits"],
                    "max_marks": item["max_marks"],
                    "subject_type": item["subject_type"],
                    "is_elective": True,
                    "elective_group": group,
                    "available_options": options,
                    "selected_option_code": None,
                })

    return resolved


def get_all_curriculum_subjects() -> List[Dict[str, Any]]:
    """
    Returns a unified flat list of every distinct subject (including all elective options)
    to facilitate database synchronization and seed integrity.
    """
    subjects_dict = {}

    def add_sub(sub, yr, sm, sc):
        code = sub["code"]
        if code not in subjects_dict:
            subjects_dict[code] = {
                "code": code,
                "name": sub["name"],
                "subject_type": sub.get("subject_type", "Theory"),
                "credits": sub.get("credits", 2),
                "max_marks": sub.get("max_marks", 100),
                "year": yr,
                "semester": sm,
                "scheme": sc,
            }

    # SY
    for sem, items in CURRICULUM_DATA["Second Year (SY)"]["semesters"].items():
        for s in items:
            add_sub(s, "Second Year (SY)", sem, None)

    # TY
    for sem, items in CURRICULUM_DATA["Third Year (TY)"]["semesters"].items():
        for s in items:
            if s.get("is_elective") and "options" in s:
                for opt in s["options"]:
                    opt_copy = dict(opt)
                    opt_copy["subject_type"] = s["subject_type"]
                    add_sub(opt_copy, "Third Year (TY)", sem, None)
            else:
                add_sub(s, "Third Year (TY)", sem, None)

    # Final Year
    for scheme, sems in CURRICULUM_DATA["Final Year (B.Tech)"]["scheme_semesters"].items():
        for sem, items in sems.items():
            for s in items:
                if s.get("is_elective") and "options" in s:
                    for opt in s["options"]:
                        opt_copy = dict(opt)
                        opt_copy["subject_type"] = s["subject_type"]
                        add_sub(opt_copy, "Final Year (B.Tech)", sem, scheme)
                else:
                    add_sub(s, "Final Year (B.Tech)", sem, scheme)

    return list(subjects_dict.values())
