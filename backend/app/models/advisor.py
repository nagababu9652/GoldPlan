"""Advisor model for financial institutes."""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from ..database.base import Base


class Advisor(Base):
    """Financial institute/company that manages investors."""
    __tablename__ = "advisors"

    id = Column(Integer, primary_key=True, index=True)
    
    # Company Information
    company_name = Column(String(200), nullable=False, index=True)
    registration_number = Column(String(100), unique=True, nullable=True)
    license_number = Column(String(100), nullable=True)
    established_year = Column(Integer, nullable=True)
    
    # Contact Information
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    website = Column(String(200), nullable=True)
    
    # Address
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    
    # Business Details
    business_type = Column(String(100), nullable=True)  # e.g., "Wealth Management", "Financial Planning"
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    # Login Credentials
    password_hash = Column(String(255), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Subscription
    subscription_plan = Column(String(50), default="basic", nullable=True)
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    
    # Timestamps
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)