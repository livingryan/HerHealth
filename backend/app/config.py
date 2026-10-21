"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "HerHealth AI"
    app_env: str = "development"
    app_version: str = "0.1.0"

    # Local SQLite file for the prototype store. PostgreSQL can replace this later
    # because the data layer in app/database.py is router/repository separated.
    # Relative paths are resolved against the backend "data" directory.
    database_url: str = "sqlite:///herhealth.db"

    # CORS is intentionally limited to local development origins only.
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Screening image constraints.
    max_upload_size_mb: int = 5
    allowed_image_mime_types: List[str] = ["image/jpeg", "image/png", "image/webp"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()