"""Group/Family model for grouping clients under an advisor."""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from ..database.base import Base


class Group(Base):
    """Group/Family that clients can be assigned to."""
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    advisor_id = Column(Integer, ForeignKey("identity.users.id"), nullable=False, index=True)
    head_client_id = Column(
        Integer,
        ForeignKey("crm.customers.id"),
        nullable=True,
    )

    head_client = relationship(
    "Client",
    foreign_keys=[head_client_id],
    post_update=True,
    )

    # Group Information
    name = Column(String(200), nullable=False, index=True)
    group_type = Column(String(50), default="family")  # family, HUF, trust, corporate, other
    description = Column(Text, nullable=True)

    # Contact
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)

    # Address
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    total_investment = Column(Float, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    advisor = relationship("User", backref="groups")
    head_client = relationship(
    "Customer",
    foreign_keys=[head_client_id],
    primaryjoin="Group.head_client_id == Customer.id",
    post_update=True,
)
    __table_args__ = (
        Index('idx_group_advisor_type', 'advisor_id', 'group_type'),
    )