"""
Base model with common audit columns for all tables.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, DateTime, Integer, Text
from sqlalchemy.orm import declarative_base, declared_attr

Base = declarative_base()


class AuditMixin:
    """Mixin that adds common audit columns to all tables."""

    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.utcnow, nullable=False)

    @declared_attr
    def created_by(cls):
        return Column(BigInteger, nullable=True)

    @declared_attr
    def updated_at(cls):
        return Column(DateTime, onupdate=datetime.utcnow, nullable=True)

    @declared_attr
    def updated_by(cls):
        return Column(BigInteger, nullable=True)

    @declared_attr
    def deleted_at(cls):
        return Column(DateTime, nullable=True)

    @declared_attr
    def deleted_by(cls):
        return Column(BigInteger, nullable=True)

    @declared_attr
    def version_no(cls):
        return Column(Integer, default=1, nullable=False)

    @declared_attr
    def is_active(cls):
        return Column(Boolean, default=True, nullable=False)