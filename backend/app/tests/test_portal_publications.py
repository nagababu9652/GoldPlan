from datetime import date, datetime
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.routers.client_portal import customer_report
from app.routers import portal_publications
from app.routers.portal_publications import snapshot_contains_customer
from app.services.access import AccessContext


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


def test_publication_list_requires_resource_read_permission(monkeypatch):
    monkeypatch.setattr(portal_publications, "customer_for_staff", lambda *args: None)
    context = AccessContext(user_id=1, party_id=2, organization_id=7,
        actor_type="EMPLOYEE", employee_id=3, customer_ids=frozenset({10}),
        roles=frozenset({"EMPLOYEE"}), permissions=frozenset(),
        denied_permissions=frozenset())
    db = Mock()
    with pytest.raises(HTTPException) as error:
        portal_publications.list_publications(10, False, context, db)
    assert error.value.status_code == 403
    db.query.assert_not_called()


def test_publication_list_filters_denied_resource_type(monkeypatch):
    monkeypatch.setattr(portal_publications, "customer_for_staff", lambda *args: None)
    context = AccessContext(user_id=1, party_id=2, organization_id=7,
        actor_type="EMPLOYEE", employee_id=3, customer_ids=frozenset({10}),
        roles=frozenset({"EMPLOYEE"}),
        permissions=frozenset({"DOCUMENT.READ", "REPORT.READ"}),
        denied_permissions=frozenset({"REPORT.READ"}))
    db = Mock()
    query = db.query.return_value
    query.filter.return_value = query
    query.order_by.return_value = query
    query.all.return_value = []
    assert portal_publications.list_publications(10, False, context, db) == []
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in query.filter.call_args_list for value in call.args)
    assert "portal_publications.organization_id = 7" in predicates
    assert "portal_publications.customer_id = 10" in predicates
    assert "portal_publications.resource_type IN ('DOCUMENT')" in predicates
