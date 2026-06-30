from typing import List

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FinPlan API"
    frontend_origins: List[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]
    database_url: str = "sqlite:///./dev.db"
    secret_key: str = "CHANGE_ME"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
