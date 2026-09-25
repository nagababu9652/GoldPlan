"""Advisor/customer financial transaction model."""

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from ..base import AuditMixin
from ...database.base import Base


class Transaction(Base, AuditMixin):
    __tablename__ = "transactions"
    __table_args__ = (
        {"schema": "crm"},
    )

    id = Column(BigInteger, primary_key=True)

    customer_id = Column(
        BigInteger,
        ForeignKey("crm.customers.id"),
        nullable=False,
        index=True,
    )

    transaction_date = Column(Date, nullable=False, index=True)

    transaction_type = Column(
        String(30),
        nullable=False,
        index=True,
    )

    amount = Column(
        Numeric(18, 2),
        nullable=False,
    )

    description = Column(String(500), nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="COMPLETED",
        index=True,
    )

    reference_number = Column(
        String(100),
        nullable=True,
        unique=True,
        index=True,
    )

    notes = Column(Text, nullable=True)

    customer = relationship(
        "Customer",
        back_populates="transactions",
    )

    history = relationship(
        "TransactionHistory",
        back_populates="transaction",
        lazy="selectin",
    )