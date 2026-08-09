from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = (
        "postgresql://dsa_user:dsa_password@localhost:5432/dsa_mentor"
    )

    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "dev-secret-key-change-later"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: Optional[str] = None

    GROQ_API_KEY: Optional[str] = None

    PREFERRED_LLM: str = "gemini"

    CHROMA_DB_PATH: str = "./chroma_data"

    DEBUG: bool = True

    ENV: str = "development"

    LOG_LEVEL: str = "INFO"

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()