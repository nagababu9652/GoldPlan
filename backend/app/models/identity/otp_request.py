from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from ..base import Base

class OTPRequest(Base):
    __tablename__ = "otp_requests"
    __table_args__ = {"schema": "identity"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("identity.users.id"), nullable=True)
    destination = Column(String(255), nullable=False)
    otp_code_hash = Column(Text, nullable=False)
    purpose = Column(String(50), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    failed_attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", lazy="selectin")