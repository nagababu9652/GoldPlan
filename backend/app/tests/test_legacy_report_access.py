from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import advisors
from app.services import access


def context(*, actor="EMPLOYEE", permissions=("REPORT.READ",)):
    return access.AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type=actor,
        employee_id=3 if actor != "CLIENT" else None,
        customer_id=10 if actor == "CLIENT" else None,
        roles=frozenset({actor}), permissions=frozenset(permissions),
        denied_permissions=frozenset(),
    )


def query_returning(row):
    query = Mock()
    query.filter.return_value = query
    query.first.return_value = row
    return query


def test_report_routes_require_staff_and_report_permissions():
    app = FastAPI()
    app.include_router(advisors.router)
    db = Mock()
    app.dependency_overrides[get_db] = lambda: db
    for actor_context in (context(permissions=()), context(actor="CLIENT")):
        app.dependency_overrides[access.get_access_context] = lambda: actor_context
        assert TestClient(app).get("/advisors/reports/snapshots/5").status_code == 403
    db.query.assert_not_called()

    expected = {
        ("GET", "/advisors/reports/financial-summary"): "REPORT.READ",
        ("GET", "/advisors/reports/cash-flow"): "REPORT.READ",
        ("GET", "/advisors/reports/snapshots"): "REPORT.READ",
        ("GET", "/advisors/reports/snapshots/{snapshot_id}"): "REPORT.READ",
        ("POST", "/advisors/reports/snapshots"): "REPORT.GENERATE",
    }
    for route in advisors.router.routes:
        if not hasattr(route, "methods"):
            continue
        key = (next(iter(route.methods)), route.path)
        if key not in expected:
            continue
        names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in names
        permission = next(dep.call for dep in route.dependant.dependencies
                          if dep.call.__qualname__ == "require_permission.<locals>.dependency")
        assert permission.__closure__[0].cell_contents == expected[key]


def test_report_customer_ids_ignore_deleted_assignments():
    db = Mock()
    assignment_query = Mock()
    assignment_query.join.return_value = assignment_query
    assignment_query.filter.return_value = assignment_query
    assignment_query.filter.return_value.all.return_value = [SimpleNamespace(entity_id=10)]
    db.query.side_effect = [query_returning(SimpleNamespace(id=3, organization_id=7)), assignment_query]
    assert advisors.get_report_customer_ids(context(), db) == [10]
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in assignment_query.filter.call_args_list for value in call.args)
    assert "employee_assignments.deleted_at IS NULL" in predicates
    assert "customers.organization_id = 7" in predicates


def test_saved_report_is_hidden_after_client_reassignment(monkeypatch):
    stored = SimpleNamespace(id=5, payload={"financial_summary": {"clients": [{"customer_id": 10}]}})
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = stored
    monkeypatch.setattr(advisors, "get_report_employee",
                        lambda advisor, db: SimpleNamespace(id=3, organization_id=7))
    monkeypatch.setattr(advisors, "get_report_customer_ids", lambda advisor, db: [])
    with pytest.raises(HTTPException) as error:
        advisors.get_report_snapshot_for_advisor(db, context(), 5)
    assert error.value.status_code == 404
