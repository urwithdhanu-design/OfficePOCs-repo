from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/personalization_agent"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    debug: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
