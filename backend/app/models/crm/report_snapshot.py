"""Immutable generated financial report snapshots."""
from sqlalchemy import BigInteger, Column, Date, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB

from ..base import AuditMixin, Base


class ReportSnapshot(AuditMixin, Base):
    __tablename__ = "report_snapshots"
    __table_args__ = (
        Index("ix_report_snapshots_advisor_date", "advisor_employee_id", "report_date"),
        {"schema": "crm"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(
        BigInteger,
        ForeignKey("organization.organizations.id"),
        nullable=False,
    )
    advisor_employee_id = Column(
        BigInteger,
        ForeignKey("organization.employees.id"),
        nullable=False,
    )
    title = Column(String(250), nullable=False)
    report_type = Column(String(40), nullable=False, default="FINANCIAL_SNAPSHOT")
    report_date = Column(Date, nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    assumptions = Column(JSONB, nullable=False)
    payload = Column(JSONB, nullable=False)
