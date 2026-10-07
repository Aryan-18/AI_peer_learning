# PCCOE Pune • AI-Based Peer Learning Platform

A full-stack, production-grade academic web application engineered for **Pimpri Chinchwad College of Engineering (PCCOE Pune)**. The platform enforces strict institutional domain security (`@pccoepune.org`), features role-based portals for Faculty and Students, incorporates an advanced **Scikit-Learn multi-dimensional peer-matching engine**, and delivers a pristine **Apple-inspired aesthetic** with an instant Light/Dark mode toggle switch.

---

## 🌟 Key System Features

### 1. Apple-Style Design System & Theme Engine
- **Typography & Aesthetics**: Minimalist, clean Apple interface utilizing system-ui typography (`-apple-system`, `SF Pro Display`, `Inter`), subtle glassmorphism (`backdrop-filter: blur`), glowing electric borders, and `rounded-3xl` cards.
- **Dynamic Theme Switcher**: Instant transition pill switch between:
  - **Dark Mode**: Deep space obsidian (`#060911`) and card panels (`#0E1526`) with electric blue (`#0A84FF`) and cyan accents (`#38BDF8`).
  - **Light Mode**: Crisp ice-blue (`#F0F5FA`) with pristine white glass cards and deep slate typography (`#0F172A`).

### 2. Comprehensive Institutional Domain Security
- **Domain Enforcement**: Every authentication and registration request strictly enforces that emails end with `@pccoepune.org`. Any attempts using external domains (e.g., `@gmail.com`, `@yahoo.com`) are immediately rejected with clear HTTP 400 rejection responses.
- **Dual Role-Based Portals**:
  - **Teacher Portal**: Faculty analytics, batch Excel uploads with credit guardrails, and AI matching controls.
  - **Student Portal**: Assigned peer card, AI synergy insights, comparative skill radar, and interactive 4-phase micro-project roadmap.

### 3. Credit-Aware Excel/CSV Ingestion & Validation Guardrails
The backend parser parses student records and validates institutional credit rules:
- **Theory / Standard Subjects**:
  - 2-Credit Subjects: Total marks ($\text{FA1} + \text{FA2} + \text{SA}$) $\le 50$.
  - 3-Credit Subjects: Total marks ($\text{FA1} + \text{FA2} + \text{SA}$) $\le 100$.
- **Lab Subjects**:
  - 1-Credit Labs: Maximum marks capped at $\le 25$.
  - 2-Credit Labs: Maximum marks capped at $\le 50$.
  - 3-Credit Labs: Maximum marks capped at $\le 100$.
- **Error Diagnostic Drawer**: If any row violates mark caps or domain constraints, the ingestion pipeline safely aborts and renders a row-by-row diagnostic log for the instructor.

### 4. Advanced AI Peer-Matching & Micro-Project Recommender
- **Multi-Dimensional Skill Vectorization**: Computes normalized feature representations using Pandas and NumPy over marks, attendance rates, formative-to-summative ratios, and external certifications.
- **Pairing Strategies**:
  - **Complementary (Weak + Strong)**: Bridges lagging students with high-performing mentors in that specific domain.
  - **Balanced (Peer Equivalence)**: Clusters equivalent mid-tier peers using cosine similarity for collaborative research.
- **Micro-Project Recommender**: Auto-recommends industry-standard mini-projects mapped to the course domain, equipped with a 4-phase milestone roadmap and interactive deliverable tracking.

---

## 🏗️ Architecture

```
ai_peer_learning/
├── backend/
│   ├── app/
│   │   ├── api/             # Auth, Teacher, Student, and Subjects routes
│   │   ├── models/          # User, StudentProfile, Subject, AcademicRecord, Pairing
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── core/            # Security (bcrypt, JWT) and domain validation dependencies
│   │   ├── services/        # Credit-aware Excel parser and matching service
│   │   └── ai/              # Vectorizer, Matcher, Rationale generator, Project recommender
│   ├── tests/               # Pytest suite for security, parser guardrails, and AI matching
│   ├── seed_data.py         # Seed script with realistic PCCOE student cohort
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ThemeToggle, etc.
│   │   ├── context/         # AuthContext and ThemeContext
│   │   ├── pages/           # Login, Register, TeacherDashboard, StudentDashboard
│   │   └── services/        # API communication client
│   ├── tailwind.config.js   # Apple color tokens and glow utilities
│   └── package.json
├── sample_data/
│   ├── pccoe_sample_student_data.xlsx # Ready-to-upload valid sample
│   └── pccoe_invalid_data.xlsx        # File containing intentional credit cap violations
├── run.py                   # Concurrent service runner
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Launch the Application
Run the unified launcher:
```bash
python3 run.py
```
This automatically starts:
- **Backend API**: http://127.0.0.1:8000 (Docs at `/docs`)
- **Frontend App**: http://localhost:5173

---

## 🔑 Institutional Access
 
| Role | Access Method | Credentials / Account | Details |
| :--- | :--- | :--- | :--- |
| **Faculty (Teacher)** | Institutional Login | Authentic `@pccoepune.org` faculty credentials | Full access to Excel upload, direct fill, AI engine, and pairings matrix |
| **Students** | Google Workspace SSO | Any authentic `@pccoepune.org` account | Secure authentication, AI peer recommendations, milestones |

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
source .venv/bin/activate
PYTHONPATH=backend pytest backend/tests -v
```

All 8 tests verify:
- Strict rejection of unauthorized email domains (`@gmail.com`, etc.)
- Strict enforcement of Theory & Lab credit caps
- Scikit-Learn skill vectorization and pairing strategies
- Atomic transaction rollbacks during Excel ingestion
