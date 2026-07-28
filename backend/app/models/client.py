"""Client model for advisor-managed clients."""
from datetime import datetime, date
from sqlalchemy import Boolean, Column, DateTime, Date, Integer, String, Text, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from ..database.base import Base


class Client(Base):
    """Client managed by an advisor."""
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True, index=True)

    # Personal Information
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    alternate_phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    marital_status = Column(String(20), nullable=True)
    occupation = Column(String(100), nullable=True)
    pan_number = Column(String(10), nullable=True, index=True)
    aadhar_number = Column(String(12), nullable=True)

    # Address
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    country = Column(String(100), default="India")

    # Financial Profile
    annual_income = Column(Float, nullable=True)
    net_worth = Column(Float, nullable=True)
    risk_profile = Column(String(20), nullable=True)  # conservative, moderate, aggressive
    investment_experience = Column(String(50), nullable=True)
    financial_goals = Column(Text, nullable=True)

    # Nominee Details
    nominee_name = Column(String(100), nullable=True)
    nominee_relation = Column(String(50), nullable=True)
    nominee_contact = Column(String(20), nullable=True)

    # Banking Details
    bank_name = Column(String(100), nullable=True)
    account_number = Column(String(50), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    account_type = Column(String(20), nullable=True)

    # KYC Status
    kyc_status = Column(String(20), default="pending")  # pending, verified, rejected
    kyc_document_url = Column(String(500), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    # Timestamps
    assigned_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    advisor = relationship("User", backref="advisor_clients", foreign_keys=[advisor_id])
    user = relationship("User", backref="client_profile", foreign_keys=[user_id])
    group = relationship("Group", back_populates="clients", foreign_keys=[group_id])

    # Indexes
    __table_args__ = (
        Index('idx_client_advisor_group', 'advisor_id', 'group_id'),
        Index('idx_client_name_search', 'first_name', 'last_name'),
    )