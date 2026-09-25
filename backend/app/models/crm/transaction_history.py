"""Audit history for advisor/customer financial transactions."""

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

from ...database.base import Base


class TransactionHistory(Base):
    __tablename__ = "transaction_history"
    __table_args__ = (
        {"schema": "crm"},
    )

    id = Column(BigInteger, primary_key=True)

    transaction_id = Column(
        BigInteger,
        ForeignKey("crm.transactions.id"),
        nullable=False,
        index=True,
    )

    action = Column(
        String(20),
        nullable=False,
        index=True,
    )

    changed_by = Column(
        BigInteger,
        nullable=True,
        index=True,
    )

    changed_at = Column(
        DateTime,
        nullable=False,
    )

    old_values = Column(
        JSON,
        nullable=True,
    )

    new_values = Column(
        JSON,
        nullable=True,
    )

    transaction = relationship(
        "Transaction",
        back_populates="history",
    )