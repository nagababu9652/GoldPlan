"""Customer and household financial-account ownership records."""
from sqlalchemy import BigInteger, CheckConstraint, Column, Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import relationship

from ..base import AuditMixin, Base


class FinancialAccount(AuditMixin, Base):
    __tablename__ = "financial_accounts"
    __table_args__ = (
        CheckConstraint(
            "(customer_id IS NOT NULL) <> (customer_group_id IS NOT NULL)",
            name="ck_financial_account_one_owner",
        ),
        CheckConstraint("current_balance >= 0", name="ck_financial_account_balance_nonnegative"),
        Index("ix_financial_accounts_customer", "customer_id", "is_active"),
        Index("ix_financial_accounts_group", "customer_group_id", "is_active"),
        {"schema": "crm"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=True)
    customer_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=True)
    account_type = Column(String(40), nullable=False)
    account_nature = Column(String(20), nullable=False)
    account_name = Column(String(250), nullable=False)
    institution_name = Column(String(250), nullable=True)
    account_number_masked = Column(String(100), nullable=True)
    currency_code = Column(String(3), nullable=False, default="INR")
    current_balance = Column(Numeric(18, 2), nullable=False, default=0)
    valuation_as_of = Column(Date, nullable=True)
    opened_on = Column(Date, nullable=True)
    maturity_date = Column(Date, nullable=True)
    interest_rate = Column(Numeric(7, 4), nullable=True)
    status = Column(String(30), nullable=False, default="ACTIVE")
    remarks = Column(Text, nullable=True)

    customer = relationship("Customer", lazy="selectin")
    customer_group = relationship("CustomerGroup", lazy="selectin")
