from typing import List

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FinPlan API"
    frontend_origins: List[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5433/finplan_db"
    secret_key: str = "CHANGE_ME"
    access_token_expire_minutes: int = 30
    
    # Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "FinPlan <noreply@finplan.in>"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


settings = Settings()
