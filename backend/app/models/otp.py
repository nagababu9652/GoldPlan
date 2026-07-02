from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Index
from ..database.base import Base


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    purpose = Column(String(20), nullable=False, default="registration")  # registration, password_reset
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    used_at = Column(DateTime, nullable=True)

    # Composite indexes for better query performance
    __table_args__ = (
        Index('idx_otp_email_purpose', 'email', 'purpose'),
        Index('idx_otp_email_created', 'email', 'created_at'),
    )
