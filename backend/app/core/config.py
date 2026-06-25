"""Core configuration module using pydantic-settings."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/postman_clone"
    CORS_ORIGINS: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    DEFAULT_TIMEOUT: int = 30

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
