import os

def _load_env():
    cur_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(cur_dir, "..", "..", ".env")),
        os.path.abspath(os.path.join(cur_dir, "..", ".env")),
        os.path.abspath(os.path.join(cur_dir, ".env")),
    ]
    for env_path in candidates:
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass
            break

_load_env()

class Settings:
    PROJECT_NAME: str = "PCCOE AI-Based Peer Learning Platform"
    ALLOWED_DOMAIN: str = os.getenv("ALLOWED_DOMAIN", "pccoepune.org")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pccoe_super_secure_jwt_secret_key_2026_peer_learning")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # SQLite default database path
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _raw_db = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'peer_learning.db')}")
    if _raw_db.startswith("sqlite:///"):
        _p = _raw_db[len("sqlite:///"):]
        if not os.path.isabs(_p):
            if _p.startswith("backend/") or _p.startswith("backend\\"):
                _p = _p[8:]
            _raw_db = f"sqlite:///{os.path.abspath(os.path.join(BASE_DIR, _p))}"
    DATABASE_URL: str = _raw_db

settings = Settings()
