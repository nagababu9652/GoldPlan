from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    organization_id = Column(
        BigInteger,
        ForeignKey("organization.organizations.id"),
        nullable=False,
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("crm.customers.id"),
        nullable=True,
    )

    customer_group_id = Column(
        BigInteger,
        ForeignKey("crm.customer_groups.id"),
        nullable=True,
    )

    advisor_employee_id = Column(
        BigInteger,
        ForeignKey("organization.employees.id"),
        nullable=False,
    )

    meeting_type = Column(String(30), nullable=False, default="REVIEW")

    title = Column(String(250), nullable=False)

    description = Column(Text, nullable=True)

    scheduled_start = Column(DateTime, nullable=False)

    scheduled_end = Column(DateTime, nullable=False)

    location = Column(String(250), nullable=True)

    meeting_link = Column(String(500), nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="SCHEDULED",
    )

    outcome = Column(Text, nullable=True)

    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    customer = relationship(
        "Customer",
        lazy="selectin",
    )

    customer_group = relationship(
        "CustomerGroup",
        lazy="selectin",
    )