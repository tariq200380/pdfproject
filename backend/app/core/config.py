"""Configuration settings for OmniMedia & PDF Studio backend."""

import os
from pathlib import Path

class Settings:
    PROJECT_NAME: str = "OmniMedia & PDF Studio"
    API_PREFIX: str = "/api"
    
    # Sandbox & Ephemeral Storage
    SANDBOX_BASE_DIR: Path = Path(os.getenv("SANDBOX_DIR", "/tmp/omnistudio_sandbox"))
    SESSION_TTL_MINUTES: int = int(os.getenv("SESSION_TTL_MINUTES", "15"))
    REAPER_INTERVAL_SECONDS: int = int(os.getenv("REAPER_INTERVAL_SECONDS", "300"))
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "100"))
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

settings = Settings()
