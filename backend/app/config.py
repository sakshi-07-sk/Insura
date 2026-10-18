"""
Application Configuration Module.

Loads configuration from environment variables or .env file with safe defaults.
"""

from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable bindings."""

    # Application
    APP_NAME: str = "Insurance Claim Risk Scoring API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="Environment: development, testing, production")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./claims.db",
        description="SQLAlchemy database connection string (SQLite fallback or PostgreSQL)",
    )
    DB_ECHO: bool = False

    # Machine Learning Model Integration
    MODEL_ARTIFACT_PATH: str = Field(
        default="backend/models/risk_model.joblib",
        description="Path to Member 1's serialized model artifact",
    )
    MODEL_METADATA_PATH: str = Field(
        default="backend/models/metadata.json",
        description="Path to Member 1's model metadata JSON",
    )
    ALLOW_MOCK_MODEL: bool = Field(
        default=True,
        description="Explicit flag allowing test baseline inference when real artifact is missing",
    )

    # Risk Thresholds
    RISK_THRESHOLD_LOW: float = Field(
        default=0.30,
        ge=0.0,
        le=1.0,
        description="Fraud probability boundary for LOW risk category (< threshold)",
    )
    RISK_THRESHOLD_HIGH: float = Field(
        default=0.70,
        ge=0.0,
        le=1.0,
        description="Fraud probability boundary for HIGH risk category (>= threshold)",
    )

    # Security & Access Control
    REQUIRE_AUTH: bool = Field(
        default=False,
        description="Whether to enforce API key / token validation on reviewer endpoints",
    )
    API_KEY: str = Field(
        default="demo-insura-secret-key-2026",
        description="Internal reviewer secret key when authentication is enforced",
    )
    CORS_ORIGINS: Union[List[str], str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
        description="List of allowed CORS origins for React frontend",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
