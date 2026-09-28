from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


class Message(Base):
    __tablename__ = "messages"
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

    sender_employee_id = Column(
        BigInteger,
        ForeignKey("organization.employees.id"),
        nullable=False,
    )

    message_type = Column(
        String(30),
        nullable=False,
        default="CLIENT_MESSAGE",
    )

    subject = Column(
        String(250),
        nullable=True,
    )

    body = Column(
        Text,
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="SENT",
    )

    sent_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    read_at = Column(
        DateTime,
        nullable=True,
    )

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

    sender_employee = relationship(
        "Employee",
        lazy="selectin",
    )