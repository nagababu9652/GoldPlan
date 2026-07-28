"""
Authorization models: permissions, roles, permission_profiles, profile_permissions,
role_permission_profiles, user_roles.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

from ..base import Base


class Permission(Base):
    __tablename__ = "permissions"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    permission_code = Column(String(100), nullable=False, unique=True)
    permission_name = Column(String(200), nullable=False)
    module_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_system = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, nullable=True)
    role_code = Column(String(50), nullable=False)
    role_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    is_system = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    user_roles = relationship("UserRole", back_populates="role", lazy="selectin")


class PermissionProfile(Base):
    __tablename__ = "permission_profiles"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, nullable=True)
    profile_code = Column(String(50), nullable=False)
    profile_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)


class ProfilePermission(Base):
    __tablename__ = "profile_permissions"
    __table_args__ = {"schema": "identity"}

    profile_id = Column(BigInteger, ForeignKey("identity.permission_profiles.id"), primary_key=True)
    permission_id = Column(BigInteger, ForeignKey("identity.permissions.id"), primary_key=True)
    allow_access = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RolePermissionProfile(Base):
    __tablename__ = "role_permission_profiles"
    __table_args__ = {"schema": "identity"}

    role_id = Column(BigInteger, ForeignKey("identity.roles.id"), primary_key=True)
    profile_id = Column(BigInteger, ForeignKey("identity.permission_profiles.id"), primary_key=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(BigInteger, nullable=True)


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = {"schema": "identity"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    role_id = Column(BigInteger, ForeignKey("identity.roles.id"), nullable=False)
    effective_from = Column(DateTime, default=datetime.utcnow)
    effective_to = Column(DateTime, nullable=True)
    assigned_by = Column(BigInteger, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    is_primary = Column(Boolean, default=False)

    user = relationship("User", back_populates="roles", lazy="selectin")
    role = relationship("Role", back_populates="user_roles", lazy="selectin")