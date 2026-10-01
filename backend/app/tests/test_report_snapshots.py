from datetime import date, datetime
from types import SimpleNamespace

from app.routers import advisors
from app.schemas.report import ReportSnapshotCreate


class SnapshotQuery:
    def __init__(self, snapshot):
        self.snapshot = snapshot

    def filter(self, *args):
        return self

    def first(self):
        return self.snapshot


class SnapshotDB:
    def __init__(self, snapshot=None):
        self.snapshot = snapshot
        self.added = None

    def add(self, value):
        self.added = value

    def commit(self):
        if self.added:
            self.added.id = 1
            self.added.created_at = datetime(2026, 9, 30, 12, 0)

    def refresh(self, value):
        pass

    def query(self, model):
        return SnapshotQuery(self.snapshot)


def test_saved_report_payload_is_a_value_snapshot(monkeypatch):
    financial = {"report_date": date(2026, 9, 30), "net_worth": 125}
    cash_flow = {
        "period_start": date(2025, 10, 1),
        "period_end": date(2026, 9, 30),
        "net_cash_flow": 20,
    }
    monkeypatch.setattr(
        advisors, "get_advisor_employee",
        lambda advisor, db: SimpleNamespace(id=7, organization_id=3),
    )
    monkeypatch.setattr(advisors, "get_financial_summary_report", lambda **kwargs: financial)
    monkeypatch.setattr(advisors, "get_cash_flow_report", lambda **kwargs: cash_flow)
    db = SnapshotDB()

    saved = advisors.create_report_snapshot(
        ReportSnapshotCreate(title="September close"),
        SimpleNamespace(id=11),
        db,
    )

    financial["net_worth"] = 999
    cash_flow["net_cash_flow"] = 999
    assert saved.payload["financial_summary"]["net_worth"] == 125
    assert saved.payload["cash_flow"]["net_cash_flow"] == 20
    assert saved.assumptions["currency"] == "INR"
    assert saved.advisor_employee_id == 7


def test_historical_report_read_returns_stored_payload(monkeypatch):
    snapshot = SimpleNamespace(
        id=4,
        organization_id=3,
        advisor_employee_id=7,
        is_active=True,
        deleted_at=None,
        payload={"financial_summary": {"net_worth": 125}},
    )
    monkeypatch.setattr(
        advisors, "get_advisor_employee",
        lambda advisor, db: SimpleNamespace(id=7, organization_id=3),
    )

    result = advisors.get_report_snapshot(4, SimpleNamespace(id=11), SnapshotDB(snapshot))

    assert result is snapshot
    assert result.payload["financial_summary"]["net_worth"] == 125
