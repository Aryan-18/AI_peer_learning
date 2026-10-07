from typing import Dict, List, Any
import json

# Knowledge Base of Institutional Micro-Projects across Domains
PROJECT_CATALOG = {
    "Machine Learning": [
        {
            "title": "Predictive Campus Energy Consumption Forecasting",
            "domain": "Applied Artificial Intelligence & Sustainability",
            "description": "Develop an end-to-end regression model utilizing LSTM and Random Forest to forecast institutional building electricity load based on weather and timetable data.",
            "tech_stack": "Python, Scikit-Learn, PyTorch, Pandas, Matplotlib, Streamlit",
            "milestones": [
                {"phase": 1, "title": "Data Pipeline & Feature Engineering", "description": "Clean hourly load logs, interpolate missing sensor data, and extract cyclic time embeddings.", "deliverable": "Jupyter Notebook & Data Preprocessing Script", "completed": False},
                {"phase": 2, "title": "Model Architecture & Hyperparameter Tuning", "description": "Train baseline Ridge regression vs XGBoost and fine-tune hyperparameters via GridSearchCV.", "deliverable": "Model weights & validation performance metrics", "completed": False},
                {"phase": 3, "title": "Interactive Dashboard & Visualization", "description": "Construct an interactive dashboard for campus facility engineers to visualize predictions.", "deliverable": "Streamlit/React interactive dashboard", "completed": False},
                {"phase": 4, "title": "Peer Review & Institutional Report", "description": "Complete cross-validation benchmarking and draft institutional technical report.", "deliverable": "Comprehensive PDF report & GitHub repository", "completed": False}
            ]
        },
        {
            "title": "Automated Medical Symptom Classification with Explainable AI",
            "domain": "Healthcare AI & Interpretability",
            "description": "Construct a multi-label disease prediction pipeline with SHAP and LIME interpretability layers to elucidate feature contributions for clinicians.",
            "tech_stack": "Python, Scikit-Learn, SHAP, FastAPI, React",
            "milestones": [
                {"phase": 1, "title": "Clinical Dataset Preprocessing", "description": "Handle class imbalances using SMOTE and encode categorical medical variables.", "deliverable": "Normalized training/testing tensors", "completed": False},
                {"phase": 2, "title": "Classifier Development", "description": "Train Gradient Boosting and evaluate using Precision-Recall curves.", "deliverable": "Trained classification model checkpoint", "completed": False},
                {"phase": 3, "title": "Explainability Layer Integration", "description": "Generate SHAP waterfall plots to explain diagnostic reasoning.", "deliverable": "SHAP summary explanations module", "completed": False},
                {"phase": 4, "title": "Final Institutional Demonstration", "description": "Present findings during the peer symposium and compile documentation.", "deliverable": "Project presentation deck & technical report", "completed": False}
            ]
        }
    ],
    "Cloud Computing": [
        {
            "title": "Serverless Microservices Architecture for Smart Campus Attendance",
            "domain": "Distributed Systems & Cloud Infrastructure",
            "description": "Design an event-driven serverless workflow deploying AWS Lambda/Cloud Functions and NoSQL database to ingest geofenced student check-ins.",
            "tech_stack": "Python, Docker, AWS Lambda, FastAPI, Redis, PostgreSQL",
            "milestones": [
                {"phase": 1, "title": "System Architecture & Schema Design", "description": "Design OpenAPI schema and distributed event streaming topologies.", "deliverable": "System architecture diagram & API spec", "completed": False},
                {"phase": 2, "title": "Microservice Containerization", "description": "Build lightweight Docker containers with automated health checks.", "deliverable": "Dockerfile & docker-compose configurations", "completed": False},
                {"phase": 3, "title": "Cloud Deployment & Load Testing", "description": "Deploy to cloud cluster and simulate 500 concurrent student requests with Locust.", "deliverable": "Locust stress test benchmark report", "completed": False},
                {"phase": 4, "title": "Cost Optimization & Peer Review", "description": "Benchmark execution latency and finalize engineering report.", "deliverable": "Cloud cost analysis & final documentation", "completed": False}
            ]
        }
    ],
    "Database Systems": [
        {
            "title": "High-Throughput Distributed Indexing & Query Optimizer",
            "domain": "Database Engineering & Optimization",
            "description": "Implement B+ tree and LSM-tree indexing algorithms to benchmark read/write query latencies on large-scale academic datasets.",
            "tech_stack": "Python, SQLite, PostgreSQL, Cython, Performance Profilers",
            "milestones": [
                {"phase": 1, "title": "Data Modeling & Benchmarking Setup", "description": "Generate 1,000,000 synthetic records and formulate benchmark queries.", "deliverable": "Database schema & benchmark harness", "completed": False},
                {"phase": 2, "title": "Index Algorithm Implementation", "description": "Implement custom indexing structures and optimize buffer pool usage.", "deliverable": "Core indexing engine source code", "completed": False},
                {"phase": 3, "title": "Query Performance Analysis", "description": "Measure query plan execution times and memory consumption.", "deliverable": "Comparative performance report with charts", "completed": False},
                {"phase": 4, "title": "Documentation & Presentation", "description": "Synthesize recommendations for high-throughput academic record retrieval.", "deliverable": "Final research paper draft & slide deck", "completed": False}
            ]
        }
    ],
    "Operating Systems": [
        {
            "title": "Simulated Process Scheduler & Memory Paging Visualizer",
            "domain": "Systems Software & Kernel Simulation",
            "description": "Simulate preemptive priority scheduling and LRU page replacement algorithms with an interactive timeline visualizer.",
            "tech_stack": "Python, C++, Pygame / React, Chart.js",
            "milestones": [
                {"phase": 1, "title": "Process State Machine Modeling", "description": "Implement PCB structures, ready queues, and context switching logic.", "deliverable": "Process simulation engine", "completed": False},
                {"phase": 2, "title": "Scheduling Algorithms", "description": "Implement Round Robin, Multi-Level Feedback Queue, and calculate turnaround times.", "deliverable": "Algorithm benchmark suite", "completed": False},
                {"phase": 3, "title": "Memory Paging & LRU Cache", "description": "Simulate virtual memory addressing and page fault rates.", "deliverable": "Paging simulator module", "completed": False},
                {"phase": 4, "title": "Interactive GUI & Demonstration", "description": "Deliver intuitive timeline visualization and submit technical dossier.", "deliverable": "Visual simulator & project writeup", "completed": False}
            ]
        }
    ]
}

DEFAULT_PROJECT = {
    "title": "Collaborative Academic Analytics & Knowledge Graph",
    "domain": "Educational Data Mining & Semantic Web",
    "description": "Construct a collaborative knowledge graph mapping prerequisite relationships and student learning trajectories across engineering disciplines.",
    "tech_stack": "Python, NetworkX, Neo4j, FastAPI, React, D3.js",
    "milestones": [
        {"phase": 1, "title": "Domain Ontology Formulation", "description": "Define engineering concepts, prerequisites, and learning objectives ontology.", "deliverable": "Ontology definition & JSON-LD schema", "completed": False},
        {"phase": 2, "title": "Graph Database & API Construction", "description": "Ingest curriculum nodes and build graph traversal endpoints.", "deliverable": "REST API with Neo4j/NetworkX backend", "completed": False},
        {"phase": 3, "title": "Interactive D3.js Graph Visualizer", "description": "Create responsive network graph with zoom, filter, and search capabilities.", "deliverable": "Frontend network visualization view", "completed": False},
        {"phase": 4, "title": "Peer Review & Institutional Submission", "description": "Evaluate graph utility with student focus group and finalize report.", "deliverable": "Final technical report & demo recording", "completed": False}
    ]
}

def recommend_project_for_pair(
    subject_name: str,
    mentor_proficiency: float,
    mentee_proficiency: float,
    strategy: str
) -> Dict[str, Any]:
    """
    Selects or generates an optimized micro-project based on subject domain
    and collective pair skill profile.
    """
    matched_subject = None
    sub_lower = subject_name.lower()
    
    for key in PROJECT_CATALOG.keys():
        if key.lower() in sub_lower or any(word in sub_lower for word in key.lower().split()):
            matched_subject = key
            break

    candidates = PROJECT_CATALOG.get(matched_subject, [DEFAULT_PROJECT])

    # Constraint satisfaction:
    # High skill pair (balanced high or mentor > 0.85) -> advanced project
    collective_skill = (mentor_proficiency + mentee_proficiency) / 2.0
    project_idx = 0 if collective_skill < 0.65 or len(candidates) == 1 else 1

    selected = candidates[min(project_idx, len(candidates) - 1)]

    return {
        "title": selected["title"],
        "domain": selected["domain"],
        "description": selected["description"],
        "tech_stack": selected["tech_stack"],
        "milestones": selected["milestones"]
    }
