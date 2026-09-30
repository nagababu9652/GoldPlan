from sqlalchemy import text
from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base


class CrmDocument(Base):
    __tablename__ = "documents"
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

    uploaded_by_employee_id = Column(
        BigInteger,
        ForeignKey("organization.employees.id"),
        nullable=False,
    )

    document_type = Column(
        String(50),
        nullable=False,
        default="OTHER",
    )

    document_name = Column(
        String(250),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    file_name = Column(
        String(250),
        nullable=True,
    )

    file_url = Column(
        String(1000),
        nullable=True,
    )

    file_type = Column(
        String(100),
        nullable=True,
    )

    file_size = Column(
        BigInteger,
        nullable=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="ACTIVE",
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    customer = relationship(
        "Customer",
        lazy="selectin",
    )

    customer_group = relationship(
        "CustomerGroup",
        lazy="selectin",
    )

    uploaded_by_employee = relationship(
        "Employee",
        lazy="selectin",
    )