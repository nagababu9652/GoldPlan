from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


class Task(Base):
    __tablename__ = "tasks"
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

    assigned_employee_id = Column(
        BigInteger,
        ForeignKey("organization.employees.id"),
        nullable=False,
    )

    task_type = Column(
        String(30),
        nullable=False,
        default="FOLLOW_UP",
    )

    title = Column(
        String(250),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    due_at = Column(
        DateTime,
        nullable=False,
    )

    priority = Column(
        String(20),
        nullable=False,
        default="MEDIUM",
    )

    status = Column(
        String(30),
        nullable=False,
        default="PENDING",
    )

    notes = Column(
        Text,
        nullable=True,
    )

    completed_at = Column(
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

    assigned_employee = relationship(
        "Employee",
        lazy="selectin",
    )