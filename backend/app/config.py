import os

class Settings:
    PROJECT_NAME: str = "PCCOE AI-Based Peer Learning Platform"
    ALLOWED_DOMAIN: str = "pccoepune.org"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pccoe_super_secure_jwt_secret_key_2026_peer_learning")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # SQLite default database path
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'peer_learning.db')}")

settings = Settings()
