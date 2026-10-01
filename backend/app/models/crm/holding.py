from sqlalchemy import BigInteger, CheckConstraint, Column, Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import relationship
from ..base import AuditMixin, Base

class Holding(AuditMixin, Base):
    __tablename__ = "holdings"
    __table_args__ = (
        CheckConstraint("quantity >= 0 AND average_cost >= 0 AND current_price >= 0", name="ck_holding_nonnegative_values"),
        Index("ix_holdings_account", "financial_account_id", "is_active"), {"schema": "crm"},
    )
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    financial_account_id = Column(BigInteger, ForeignKey("crm.financial_accounts.id"), nullable=False)
    security_type = Column(String(40), nullable=False)
    security_name = Column(String(250), nullable=False)
    symbol = Column(String(50)); isin = Column(String(20)); folio_number = Column(String(100))
    quantity = Column(Numeric(24, 8), nullable=False, default=0)
    average_cost = Column(Numeric(18, 4), nullable=False, default=0)
    current_price = Column(Numeric(18, 4), nullable=False, default=0)
    valuation_as_of = Column(Date); remarks = Column(Text)
    financial_account = relationship("FinancialAccount", lazy="selectin")
