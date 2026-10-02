"""Persisted request keys for retry-safe create operations."""
from sqlalchemy import BigInteger, Column, DateTime, String, text

from ..base import Base


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = {"schema": "identity"}

    key_hash = Column(String(64), primary_key=True)
    request_hash = Column(String(64), nullable=False)
    operation = Column(String(80), nullable=False)
    actor_scope = Column(String(100), nullable=False)
    resource_id = Column(BigInteger, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    expires_at = Column(DateTime, nullable=False)
