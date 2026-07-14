from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Index

from ..database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default="user", nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    # Advisor-specific fields
    firm_name = Column(String(100), nullable=True)
    registration_number = Column(String(50), nullable=True, index=True)
    experience_years = Column(Integer, nullable=True)

    # Composite indexes for better query performance
    __table_args__ = (
        Index('idx_user_email_active', 'email', 'is_active'),
        Index('idx_user_role_created', 'role', 'created_at'),
        Index('idx_user_verified_active', 'is_verified', 'is_active'),
    )