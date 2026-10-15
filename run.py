#!/usr/bin/env python3
"""
PCCOE Pune AI Peer Learning Platform - Unified Service Runner
Launches FastAPI backend (port 8000) and Vite React frontend (port 5173).
"""

import os
import sys
import subprocess
import signal
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
VENV_PYTHON = os.path.join(BASE_DIR, ".venv", "bin", "python3")

if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable

def start_services():
    print("=" * 70)
    print("🎓 PCCOE Pune • AI-Based Peer Learning Web Platform")
    print("   Domain Enforcement: @pccoepune.org")
    print("   AI Engine: Scikit-Learn Multi-Dimensional Skill Vectorizer")
    print("=" * 70)

    # 1. Start Backend FastAPI
    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = BACKEND_DIR
    backend_env["VIRTUAL_ENV"] = os.path.join(BASE_DIR, ".venv")
    backend_env["PATH"] = f"{os.path.join(BASE_DIR, '.venv', 'bin')}:{backend_env.get('PATH', '')}"
    backend_proc = subprocess.Popen(
        [
            VENV_PYTHON, "-m", "uvicorn", "app.main:app",
            "--host", "0.0.0.0", "--port", "8000",
            "--reload",
            "--reload-exclude", "*.db",
            "--reload-exclude", "*.sqlite*",
            "--reload-exclude", "sample_data/*"
        ],
        cwd=BACKEND_DIR,
        env=backend_env
    )

    # 2. Start Frontend Vite
    print("\n[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR
    )

    print("\n" + "=" * 70)
    print("🚀 Both services are running!")
    print("   🌐 Frontend Portal: http://localhost:5173")
    print("   📡 Backend API:     http://127.0.0.1:8000/api")
    print("   📚 API Docs:        http://127.0.0.1:8000/docs")
    print("\n   👤 Institutional Accounts:")
    print("      • Faculty & Students: Sign in or Register using your @pccoepune.org institutional account")
    print("=" * 70)
    print("Press Ctrl+C to terminate both servers.\n")

    def shutdown_handler(signum, frame):
        print("\n\n🛑 Shutting down PCCOE Peer Learning Platform...")
        backend_proc.terminate()
        frontend_proc.terminate()
        try:
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()
            frontend_proc.kill()
        print("✅ Shutdown complete.")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown_handler(None, None)

if __name__ == "__main__":
    start_services()
