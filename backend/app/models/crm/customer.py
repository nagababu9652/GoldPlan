"""
Customer core models: customer_groups, customers, group_members, customer_status_history.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class CustomerGroup(AuditMixin, Base):
    __tablename__ = "customer_groups"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    group_code = Column(String(30), nullable=False)
    group_name = Column(String(250), nullable=False)
    group_type = Column(String(30), default="INDIVIDUAL")
    head_customer_id = Column(BigInteger, nullable=True)
    primary_branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    primary_advisor_employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=True)
    risk_profile = Column(String(30), nullable=True)
    investment_objective = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)

    members = relationship("GroupMember", back_populates="group", lazy="selectin")


class Customer(AuditMixin, Base):
    __tablename__ = "customers"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    customer_code = Column(String(30), nullable=False)
    occupation = Column(String(150), nullable=True)
    annual_income = Column(Numeric(18, 2), nullable=True)
    net_worth = Column(Numeric(18, 2), nullable=True)
    risk_profile = Column(String(30), nullable=True)
    tax_category = Column(String(50), nullable=True)
    resident_status = Column(String(30), nullable=True)
    onboarding_date = Column(Date, nullable=True)
    customer_status = Column(String(30), default="ACTIVE")
    remarks = Column(Text, nullable=True)

    group_members = relationship("GroupMember", back_populates="customer", lazy="selectin")
    kyc = relationship(
        "CustomerKYC",
        back_populates="customer",
        uselist=False,
        foreign_keys="[CustomerKYC.customer_id]",
        lazy="selectin",
    )
    risk_profiles = relationship("CustomerRiskProfile", back_populates="customer", lazy="selectin")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=False)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    relationship_type = Column(String(50), nullable=True)
    is_group_head = Column(Boolean, default=False)
    joined_on = Column(Date, default=datetime.utcnow)
    left_on = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)

    group = relationship("CustomerGroup", back_populates="members", lazy="selectin")
    customer = relationship("Customer", back_populates="group_members", lazy="selectin")


class CustomerStatusHistory(Base):
    __tablename__ = "customer_status_history"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_on = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(BigInteger, nullable=True)
    reason = Column(Text, nullable=True)

    customer = relationship("Customer", lazy="selectin")