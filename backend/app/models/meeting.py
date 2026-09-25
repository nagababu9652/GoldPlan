from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    ForeignKey,
    Index,
    String,
    Text,
    Time,
)
from sqlalchemy.orm import relationship

from .base import Base, AuditMixin


class Meeting(AuditMixin, Base):
    __tablename__ = "meetings"

    __table_args__ = (
        Index("idx_meeting_advisor_date", "advisor_id", "meeting_date"),
        Index("idx_meeting_client_date", "client_id", "meeting_date"),
        {"schema": "advisor"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    advisor_id = Column(
        BigInteger,
        ForeignKey("identity.users.id"),
        nullable=False,
        index=True,
    )

    client_id = Column(
        BigInteger,
        ForeignKey("crm.customers.id"),
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=False)
    meeting_date = Column(Date, nullable=False)
    meeting_time = Column(Time, nullable=False)

    meeting_type = Column(
        String(30),
        nullable=False,
        default="virtual",
    )

    status = Column(
        String(30),
        nullable=False,
        default="scheduled",
    )

    notes = Column(Text, nullable=True)

    advisor = relationship(
        "User",
        foreign_keys=[advisor_id],
        lazy="selectin",
    )

    client = relationship(
        "Customer",
        foreign_keys=[client_id],
        lazy="selectin",
    )