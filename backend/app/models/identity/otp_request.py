from sqlalchemy import Column, Integer

from ..base import Base


class OTPRequest(Base):
    """Compatibility shim for the old OTPRequest module path."""

    __tablename__ = "otp_requests"
    __table_args__ = {"schema": "identity", "extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)
