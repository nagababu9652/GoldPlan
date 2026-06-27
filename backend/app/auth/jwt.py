from datetime import datetime, timedelta

from jose import jwt

from ..core.config import settings


def create_access_token(data: dict, expires_delta: int | None = None) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=expires_delta if expires_delta is not None else settings.access_token_expire_minutes
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")
