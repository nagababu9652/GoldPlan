"""
Core organization models: organizations, branches, departments, designations, organization_settings.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class Organization(AuditMixin, Base):
    __tablename__ = "organizations"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_code = Column(String(30), nullable=False, unique=True)
    legal_name = Column(String(250), nullable=False)
    trade_name = Column(String(250), nullable=True)
    organization_type = Column(String(50), nullable=True)
    registration_number = Column(String(100), nullable=True)
    pan_number = Column(String(20), nullable=True)
    gst_number = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    website = Column(String(250), nullable=True)
    logo_url = Column(Text, nullable=True)
    financial_year_start = Column(String(5), nullable=True)
    default_currency_code = Column(String(3), nullable=False, default="INR")
    timezone = Column(String(100), nullable=False, default="Asia/Kolkata")
    financial_year_id = Column(BigInteger, nullable=True)
    base_currency_id = Column(BigInteger, nullable=True)

    branches = relationship("Branch", back_populates="organization", lazy="selectin")
    departments = relationship("Department", back_populates="organization", lazy="selectin")
    designations = relationship("Designation", back_populates="organization", lazy="selectin")
    employees = relationship("Employee", back_populates="organization", lazy="selectin")


class Branch(AuditMixin, Base):
    __tablename__ = "branches"
    __table_args__ = (UniqueConstraint("organization_id", "branch_code", name="uq_branch_org_code"), {"schema": "organization"})

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    parent_branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    branch_code = Column(String(30), nullable=False)
    branch_name = Column(String(200), nullable=False)
    branch_type = Column(String(50), nullable=False, default="BRANCH", server_default="BRANCH")
    manager_employee_id = Column(BigInteger, nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    postal_code = Column(String(15), nullable=True)
    opening_date = Column(Date, nullable=True)
    closing_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="branches", lazy="selectin")
    departments = relationship("Department", back_populates="branch", lazy="selectin")


class Department(AuditMixin, Base):
    __tablename__ = "departments"
    __table_args__ = (UniqueConstraint("organization_id", "department_code", name="uq_department_org_code"), {"schema": "organization"})

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=False)
    department_code = Column(String(30), nullable=False)
    department_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    head_employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=True)

    organization = relationship("Organization", back_populates="departments", lazy="selectin")
    branch = relationship("Branch", back_populates="departments", lazy="selectin")


class Designation(AuditMixin, Base):
    __tablename__ = "designations"
    __table_args__ = (UniqueConstraint("organization_id", "designation_code", name="uq_designation_org_code"), {"schema": "organization"})

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
