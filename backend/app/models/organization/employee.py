"""
Employee models: employees, employee_roles, employee_reporting, employee_branch_history, employee_department_history.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class Employee(AuditMixin, Base):
    __tablename__ = "employees"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    employee_code = Column(String(30), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=False)
    department_id = Column(BigInteger, ForeignKey("organization.departments.id"), nullable=False)
    designation_id = Column(BigInteger, ForeignKey("organization.designations.id"), nullable=False)
    joining_date = Column(Date, nullable=False)
    confirmation_date = Column(Date, nullable=True)
    relieving_date = Column(Date, nullable=True)
    employment_status = Column(String(30), default="ACTIVE")
    official_email = Column(String(150), nullable=True)
    official_mobile = Column(String(30), nullable=True)

    organization = relationship("Organization", back_populates="employees", lazy="selectin")
    reporting = relationship("EmployeeReporting", back_populates="employee", lazy="selectin",
                             foreign_keys="EmployeeReporting.employee_id")


class EmployeeRole(Base):
    __tablename__ = "employee_roles"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    role_id = Column(BigInteger, ForeignKey("identity.roles.id"), nullable=False)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date, nullable=True)
    is_primary = Column(Boolean, default=False)
    assigned_by = Column(BigInteger, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", lazy="selectin")
    role = relationship("Role", lazy="selectin")


class EmployeeReporting(Base):
    __tablename__ = "employee_reporting"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    manager_employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    effective_from = Column(Date, nullable=True)
    effective_to = Column(Date, nullable=True)

    employee = relationship("Employee", back_populates="reporting", lazy="selectin",
                            foreign_keys=[employee_id])
    manager = relationship("Employee", lazy="selectin",
                           foreign_keys=[manager_employee_id])


class EmployeeBranchHistory(Base):
    __tablename__ = "employee_branch_history"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=False)
    effective_from = Column(Date, nullable=True)
    effective_to = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)

    employee = relationship("Employee", lazy="selectin")
    branch = relationship("Branch", lazy="selectin")


class EmployeeDepartmentHistory(Base):
    __tablename__ = "employee_department_history"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=False)
    department_id = Column(BigInteger, ForeignKey("organization.departments.id"), nullable=False)
    effective_from = Column(Date, nullable=True)
    effective_to = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)

    employee = relationship("Employee", lazy="selectin")
    department = relationship("Department", lazy="selectin")