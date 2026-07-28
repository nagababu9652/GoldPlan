"""
Customer KYC & Compliance models: customer_kyc, customer_fatca, customer_risk_profiles,
customer_communication_preferences, customer_kyc_history.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..base import Base


class CustomerKYC(Base):
    __tablename__ = "customer_kyc"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    pan_number = Column(String(20), nullable=True)
    aadhaar_masked = Column(String(20), nullable=True)
    kyc_status = Column(String(30), nullable=False)
    kyc_verified_date = Column(Date, nullable=True)
    kyc_expiry_date = Column(Date, nullable=True)
    verification_method = Column(String(50), nullable=True)
    verification_reference = Column(String(100), nullable=True)
    politically_exposed_person = Column(Boolean, default=False)
    minor_customer = Column(Boolean, default=False)
    guardian_customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    customer = relationship(
        "Customer",
        back_populates="kyc",
        foreign_keys=[customer_id],
        lazy="selectin",
    )
    guardian = relationship("Customer", foreign_keys=[guardian_customer_id], lazy="selectin")


class CustomerFATCA(Base):
    __tablename__ = "customer_fatca"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    tax_residency_country = Column(String(100), nullable=True)
    tax_identification_number = Column(String(100), nullable=True)
    us_person = Column(Boolean, default=False)
    fatca_status = Column(String(30), nullable=True)
    declaration_date = Column(Date, nullable=True)
    review_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)

    customer = relationship("Customer", lazy="selectin")


class CustomerRiskProfile(Base):
    __tablename__ = "customer_risk_profiles"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    risk_profile = Column(String(30), nullable=False)
    assessed_on = Column(Date, nullable=True)
    next_review_date = Column(Date, nullable=True)
    assessment_method = Column(String(100), nullable=True)
    assessed_by_employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=True)
    remarks = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="risk_profiles", lazy="selectin")
    assessed_by = relationship("Employee", lazy="selectin")


class CustomerCommunicationPreference(Base):
    __tablename__ = "customer_communication_preferences"
    __table_args__ = {"schema": "crm"}

    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), primary_key=True)
    preferred_language = Column(String(30), nullable=True)
    preferred_channel = Column(String(30), nullable=True)
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=True)
    whatsapp_enabled = Column(Boolean, default=True)
    postal_enabled = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    do_not_disturb = Column(Boolean, default=False)
    updated_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", lazy="selectin")


class CustomerKYCHistory(Base):
    __tablename__ = "customer_kyc_history"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=True)
    reviewed_on = Column(DateTime, default=datetime.utcnow)
    reviewed_by = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=True)
    review_reason = Column(Text, nullable=True)

    customer = relationship("Customer", lazy="selectin")
    reviewer = relationship("Employee", lazy="selectin")