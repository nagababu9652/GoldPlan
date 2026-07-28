"""
Security models: devices, user_devices, account_lockouts, security_events, audit_logs.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import relationship

from ..base import Base


class Device(Base):
    __tablename__ = "devices"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    device_uuid = Column(UUID, nullable=False, unique=True)
    device_name = Column(String(200), nullable=True)
    device_type = Column(String(50), nullable=True)
    operating_system = Column(String(100), nullable=True)
    os_version = Column(String(100), nullable=True)
    browser = Column(String(100), nullable=True)
    browser_version = Column(String(100), nullable=True)
    device_fingerprint = Column(Text, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserDevice(Base):
    __tablename__ = "user_devices"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    device_id = Column(BigInteger, ForeignKey("identity.devices.id"), nullable=False)
    first_login_at = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    trusted_until = Column(DateTime, nullable=True)
    is_trusted = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", lazy="selectin")
    device = relationship("Device", lazy="selectin")


class AccountLockout(Base):
    __tablename__ = "account_lockouts"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    failed_attempts = Column(Integer, default=0)
    locked_at = Column(DateTime, nullable=True)
    unlock_at = Column(DateTime, nullable=True)
    unlocked_by = Column(BigInteger, nullable=True)
    reason = Column(String(250), nullable=True)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", lazy="selectin")


class SecurityEvent(Base):
    __tablename__ = "security_events"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=True)
    event_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=True)
    event_timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(INET, nullable=True)
    device_id = Column(BigInteger, ForeignKey("identity.devices.id"), nullable=True)
    session_id = Column(BigInteger, ForeignKey("identity.user_sessions.id"), nullable=True)
    description = Column(Text, nullable=True)
    event_metadata = Column(JSONB, nullable=True)

    user = relationship("User", lazy="selectin")
    device = relationship("Device", lazy="selectin")
    session = relationship("UserSession", lazy="selectin")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, nullable=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=True)
    module_name = Column(String(100), nullable=True)
    table_name = Column(String(100), nullable=True)
    record_id = Column(BigInteger, nullable=True)
    action = Column(String(20), nullable=True)
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)
    ip_address = Column(INET, nullable=True)
    session_id = Column(BigInteger, ForeignKey("identity.user_sessions.id"), nullable=True)
    correlation_id = Column(UUID, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", lazy="selectin")
    session = relationship("UserSession", lazy="selectin")