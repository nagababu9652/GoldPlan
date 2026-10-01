from datetime import date, datetime
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.routers.client_portal import customer_report
from app.routers.portal_publications import snapshot_contains_customer


def snapshot():
    return SimpleNamespace(
        id=9, title="Saved plan", report_type="FINANCIAL_SNAPSHOT",
        report_date=date(2026, 9, 30), period_start=date(2025, 10, 1),
        period_end=date(2026, 9, 30), created_at=datetime(2026, 9, 30),
        assumptions={"currency": "INR"},
        payload={"financial_summary": {"clients": [
            {"customer_id": 10, "customer_name": "A", "net_worth": 100},
            {"customer_id": 20, "customer_name": "B", "net_worth": 900},
        ]}, "cash_flow": {"net_cash_flow": 12345}},
    )


def test_published_report_is_reduced_to_the_target_customers_stored_values():
    result = customer_report(snapshot(), 10)
    assert result["client"]["customer_id"] == 10
    assert result["client"]["net_worth"] == 100
    assert "payload" not in result
    assert "cash_flow" not in result
    assert "B" not in str(result)


def test_report_must_contain_customer_before_publication():
    assert snapshot_contains_customer(snapshot(), 10)
    assert not snapshot_contains_customer(snapshot(), 30)
    with pytest.raises(HTTPException) as error:
        customer_report(snapshot(), 30)
    assert error.value.status_code == 404
