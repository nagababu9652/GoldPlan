"""
Core organization models: organizations, branches, departments, designations, organization_settings.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class Organization(AuditMixin, Base):
    __tablename__ = "organizations"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_code = Column(String(30), nullable=False, unique=True)
    legal_name = Column(String(250), nullable=False)
    trade_name = Column(String(250), nullable=True)
    registration_number = Column(String(100), nullable=True)
    pan_number = Column(String(20), nullable=True)
    gst_number = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    website = Column(String(250), nullable=True)
    logo_url = Column(Text, nullable=True)
    financial_year_id = Column(BigInteger, nullable=True)
    base_currency_id = Column(BigInteger, nullable=True)

    branches = relationship("Branch", back_populates="organization", lazy="selectin")
    departments = relationship("Department", back_populates="organization", lazy="selectin")
    designations = relationship("Designation", back_populates="organization", lazy="selectin")
    employees = relationship("Employee", back_populates="organization", lazy="selectin")


class Branch(AuditMixin, Base):
    __tablename__ = "branches"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    parent_branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    branch_code = Column(String(30), nullable=False)
    branch_name = Column(String(200), nullable=False)
    branch_type = Column(String(50), nullable=True)
    manager_employee_id = Column(BigInteger, nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)

    organization = relationship("Organization", back_populates="branches", lazy="selectin")
    departments = relationship("Department", back_populates="branch", lazy="selectin")


class Department(AuditMixin, Base):
    __tablename__ = "departments"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=False)
    department_code = Column(String(30), nullable=False)
    department_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="departments", lazy="selectin")
    branch = relationship("Branch", back_populates="departments", lazy="selectin")


class Designation(AuditMixin, Base):
    __tablename__ = "designations"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    designation_code = Column(String(30), nullable=False)
    designation_name = Column(String(150), nullable=False)
    hierarchy_level = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="designations", lazy="selectin")


class OrganizationSetting(AuditMixin, Base):
    __tablename__ = "organization_settings"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    setting_key = Column(String(100), nullable=False)
    setting_value = Column(Text, nullable=True)
    data_type = Column(String(30), default="STRING")
    category = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)