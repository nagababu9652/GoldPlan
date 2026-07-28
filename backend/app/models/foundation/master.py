"""
Master models: currencies, financial_years.
"""
from sqlalchemy import Column, BigInteger, Boolean, Date, Integer, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class Currency(AuditMixin, Base):
    __tablename__ = "currencies"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    currency_code = Column(String(3), nullable=False, unique=True)
    currency_name = Column(String(100), nullable=False)
    currency_symbol = Column(String(10), nullable=True)
    decimal_places = Column(SmallInteger, default=2)
    is_base_currency = Column(Boolean, default=False)
    exchange_rate = Column(Numeric(18, 8), nullable=True)
    effective_date = Column(Date, nullable=True)


class FinancialYear(AuditMixin, Base):
    __tablename__ = "financial_years"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    financial_year = Column(String(20), nullable=False, unique=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    assessment_year = Column(String(20), nullable=True)
    is_current = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)