"""
Assignment models: employee_assignments, employee_skills, employee_certifications, organization_holidays.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, SmallInteger, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class EmployeeAssignment(AuditMixin, Base):
    __tablename__ = "employee_assignments"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    assignment_type = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(BigInteger, nullable=False)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date, nullable=True)
    is_primary = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)

    employee = relationship("Employee", lazy="selectin")


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    skill_name = Column(String(150), nullable=False)
    proficiency_level = Column(SmallInteger, nullable=True)
    certified = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", lazy="selectin")


class EmployeeCertification(Base):
    __tablename__ = "employee_certifications"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    certification_name = Column(String(200), nullable=False)
    certificate_number = Column(String(100), nullable=True)
    issuing_authority = Column(String(200), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    verification_status = Column(String(30), default="PENDING")
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", lazy="selectin")


class OrganizationHoliday(Base):
    __tablename__ = "organization_holidays"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    holiday_date = Column(Date, nullable=False)
    holiday_name = Column(String(200), nullable=False)
    holiday_type = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", lazy="selectin")
    branch = relationship("Branch", lazy="selectin")