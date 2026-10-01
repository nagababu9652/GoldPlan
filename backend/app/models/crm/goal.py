"""First-class financial planning goals."""
from sqlalchemy import BigInteger, CheckConstraint, Column, Date, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from ..base import AuditMixin, Base


class FinancialGoal(AuditMixin, Base):
    __tablename__ = "financial_goals"
    __table_args__ = (
        CheckConstraint(
            "(customer_id IS NOT NULL) <> (customer_group_id IS NOT NULL)",
            name="ck_financial_goal_one_owner",
        ),
        CheckConstraint("target_amount > 0", name="ck_financial_goal_target_positive"),
        CheckConstraint("current_amount >= 0", name="ck_financial_goal_current_nonnegative"),
        CheckConstraint("priority BETWEEN 1 AND 5", name="ck_financial_goal_priority"),
        Index("ix_financial_goals_customer", "customer_id", "is_active"),
        Index("ix_financial_goals_group", "customer_group_id", "is_active"),
        {"schema": "crm"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=True)
    customer_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=True)
    goal_type = Column(String(30), nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    target_amount = Column(Numeric(18, 2), nullable=False)
    current_amount = Column(Numeric(18, 2), nullable=False, default=0)
    target_date = Column(Date, nullable=False)
    priority = Column(Integer, nullable=False, default=3)
    expected_inflation_rate = Column(Numeric(7, 4), nullable=True)
    expected_return_rate = Column(Numeric(7, 4), nullable=True)
    status = Column(String(30), nullable=False, default="ACTIVE")
    remarks = Column(Text, nullable=True)

    customer = relationship("Customer", lazy="selectin")
    customer_group = relationship("CustomerGroup", lazy="selectin")
