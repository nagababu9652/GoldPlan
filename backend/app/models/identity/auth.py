"""
Authentication models: users, authentication_methods, password_history, otp_requests,
user_sessions, refresh_tokens, login_history.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import relationship

from ..base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(150), nullable=False, unique=True)
    mobile_number = Column(String(20), nullable=True)
    display_name = Column(String(200), nullable=True)
    preferred_language = Column(String(20), default="en")
    timezone = Column(String(100), default="Asia/Kolkata")
    email_verified = Column(Boolean, default=False)
    mobile_verified = Column(Boolean, default=False)
    account_status = Column(String(20), default="ACTIVE")
    last_login_at = Column(DateTime, nullable=True)
    last_password_change_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    deleted_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    authentication_methods = relationship("AuthenticationMethod", back_populates="user", lazy="selectin")
    sessions = relationship("UserSession", back_populates="user", lazy="selectin")
    login_history = relationship("LoginHistory", back_populates="user", lazy="selectin")
    roles = relationship("UserRole", back_populates="user", lazy="selectin")


class AuthenticationMethod(Base):
    __tablename__ = "authentication_methods"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    authentication_type = Column(String(30), nullable=False)
    credential_hash = Column(Text, nullable=True)
    external_identifier = Column(String(255), nullable=True)
    password_algorithm = Column(String(30), nullable=True)
    password_expiry_date = Column(Date, nullable=True)
    is_primary = Column(Boolean, default=True)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)

    user = relationship("User", back_populates="authentication_methods", lazy="selectin")


class PasswordHistory(Base):
    __tablename__ = "password_history"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    password_hash = Column(Text, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(BigInteger, nullable=True)

    user = relationship("User", lazy="selectin")


class OTPRequest(Base):
    __tablename__ = "otp_requests"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=True)
    destination = Column(String(255), nullable=False)
    otp_code_hash = Column(Text, nullable=False)
    purpose = Column(String(50), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    failed_attempts = Column(SmallInteger, default=0)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", lazy="selectin")


class UserSession(Base):
    __tablename__ = "user_sessions"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    session_uuid = Column(UUID, nullable=False)
    login_time = Column(DateTime, default=datetime.utcnow)
    last_activity_at = Column(DateTime, nullable=True)
    logout_time = Column(DateTime, nullable=True)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    device_name = Column(String(200), nullable=True)
    operating_system = Column(String(100), nullable=True)
    browser = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="sessions", lazy="selectin")
    refresh_tokens = relationship("RefreshToken", back_populates="session", lazy="selectin")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(BigInteger, ForeignKey("identity.user_sessions.id"), nullable=False)
    token_hash = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("UserSession", back_populates="refresh_tokens", lazy="selectin")


class LoginHistory(Base):
    __tablename__ = "login_history"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=True)
    login_timestamp = Column(DateTime, default=datetime.utcnow)
    login_result = Column(String(20), nullable=True)
    failure_reason = Column(String(200), nullable=True)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    device_name = Column(String(200), nullable=True)
    browser = Column(String(100), nullable=True)
    operating_system = Column(String(100), nullable=True)

    user = relationship("User", back_populates="login_history", lazy="selectin")