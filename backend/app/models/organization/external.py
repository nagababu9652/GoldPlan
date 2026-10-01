"""External organization relationships: agencies, associates, and ARN registrations."""
from datetime import datetime

from sqlalchemy import (BigInteger, CheckConstraint, Column, Date, DateTime,
    ForeignKey, Index, String, Text, UniqueConstraint, text)
from sqlalchemy.orm import relationship

from ..base import AuditMixin, Base


class Agency(AuditMixin, Base):
    __tablename__ = "agencies"
    __table_args__ = (
        UniqueConstraint("organization_id", "agency_code", name="uq_agency_org_code"),
        {"schema": "organization"},
    )
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    agency_code = Column(String(30), nullable=False)
    registration_number = Column(String(100), nullable=True)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    primary_contact_party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")
    remarks = Column(Text, nullable=True)
    party = relationship("Party", foreign_keys=[party_id], lazy="selectin")
    primary_contact = relationship("Party", foreign_keys=[primary_contact_party_id], lazy="selectin")
    branch = relationship("Branch", lazy="selectin")


class Associate(AuditMixin, Base):
    __tablename__ = "associates"
    __table_args__ = (
        UniqueConstraint("organization_id", "associate_code", name="uq_associate_org_code"),
        {"schema": "organization"},
    )
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    associate_code = Column(String(30), nullable=False)
    associate_type = Column(String(30), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    agency_id = Column(BigInteger, ForeignKey("organization.agencies.id"), nullable=True)
    joining_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")
    referral_code = Column(String(50), nullable=True)
    remarks = Column(Text, nullable=True)
    party = relationship("Party", lazy="selectin")
    branch = relationship("Branch", lazy="selectin")
    agency = relationship("Agency", lazy="selectin")


class ArnHolder(AuditMixin, Base):
    __tablename__ = "arn_holders"
    __table_args__ = (
        UniqueConstraint("organization_id", "arn_number", name="uq_arn_holder_org_number"),
        CheckConstraint("holder_type IN ('ORGANIZATION','EMPLOYEE','ASSOCIATE','AGENCY','OTHER')", name="ck_arn_holder_type"),
        CheckConstraint("status IN ('ACTIVE','EXPIRED','SUSPENDED','INACTIVE')", name="ck_arn_holder_status"),
        CheckConstraint(
            "(holder_type = 'EMPLOYEE' AND employee_id IS NOT NULL AND associate_id IS NULL AND agency_id IS NULL) OR "
            "(holder_type = 'ASSOCIATE' AND associate_id IS NOT NULL AND employee_id IS NULL AND agency_id IS NULL) OR "
            "(holder_type = 'AGENCY' AND agency_id IS NOT NULL AND employee_id IS NULL AND associate_id IS NULL) OR "
            "(holder_type IN ('ORGANIZATION','OTHER') AND employee_id IS NULL AND associate_id IS NULL AND agency_id IS NULL)",
            name="ck_arn_holder_linkage"),
        Index("ix_arn_holders_expiry", "organization_id", "valid_to", "status"),
        {"schema": "organization"},
    )
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    arn_number = Column(String(50), nullable=False)
    holder_party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    holder_type = Column(String(20), nullable=False)
    branch_id = Column(BigInteger, ForeignKey("organization.branches.id"), nullable=True)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=True)
    associate_id = Column(BigInteger, ForeignKey("organization.associates.id"), nullable=True)
    agency_id = Column(BigInteger, ForeignKey("organization.agencies.id"), nullable=True)
    registration_date = Column(Date, nullable=True)
    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")
    remarks = Column(Text, nullable=True)
    holder_party = relationship("Party", lazy="selectin")
    branch = relationship("Branch", lazy="selectin")
    employee = relationship("Employee", lazy="selectin")
    associate = relationship("Associate", lazy="selectin")
    agency = relationship("Agency", lazy="selectin")


class ArnStatusHistory(Base):
    __tablename__ = "arn_status_history"
    __table_args__ = {"schema": "organization"}
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    arn_holder_id = Column(BigInteger, ForeignKey("organization.arn_holders.id"), nullable=False)
    old_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    changed_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))
    changed_by = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    reason = Column(Text, nullable=True)
    arn_holder = relationship("ArnHolder", lazy="selectin")
