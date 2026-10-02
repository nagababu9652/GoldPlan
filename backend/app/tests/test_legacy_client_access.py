from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import clients
from app.services import access


def context(*, actor="EMPLOYEE", permissions=()):
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


def predicates(query):
    return " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                    for call in query.filter.call_args_list for value in call.args)


def test_client_routes_require_staff_and_client_permissions():
    expected = {
        ("GET", "/advisors/clients"): "CLIENT.READ",
        ("POST", "/advisors/clients"): "CLIENT.CREATE",
        ("GET", "/advisors/clients/{client_id}"): "CLIENT.READ",
        ("PUT", "/advisors/clients/{client_id}"): "CLIENT.UPDATE",
        ("DELETE", "/advisors/clients/{client_id}"): "CLIENT.DEACTIVATE",
        ("GET", "/advisors/clients/{client_id}/kyc"): "CLIENT.READ",
        ("PUT", "/advisors/clients/{client_id}/kyc"): "CLIENT.UPDATE",
        ("GET", "/advisors/clients/{client_id}/kyc/history"): "CLIENT.READ",
        ("GET", "/advisors/clients/{client_id}/service-team/employees"): "CLIENT.READ",
        ("GET", "/advisors/clients/{client_id}/service-team"): "CLIENT.READ",
        ("POST", "/advisors/clients/{client_id}/service-team"): "CLIENT.UPDATE",
        ("DELETE", "/advisors/clients/{client_id}/service-team/{assignment_id}"): "CLIENT.UPDATE",
    }
    seen = set()
    for route in clients.router.routes:
        key = (next(iter(route.methods)), route.path)
        seen.add(key)
        names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in names
        permission = next(dep.call for dep in route.dependant.dependencies
                          if dep.call.__qualname__ == "require_permission.<locals>.dependency")
        assert permission.__closure__[0].cell_contents == expected[key]
    assert seen == set(expected)

    app = FastAPI()
    app.include_router(clients.router)
    db = Mock()
    app.dependency_overrides[get_db] = lambda: db
    for actor_context in (context(), context(actor="CLIENT", permissions=("CLIENT.READ",))):
        app.dependency_overrides[access.get_access_context] = lambda: actor_context
        assert TestClient(app).get("/advisors/clients/5").status_code == 403
    db.query.assert_not_called()


def test_client_detail_filters_organization_and_active_state(monkeypatch):
    monkeypatch.setattr(clients, "get_advisor_customer_ids", lambda advisor, db: [5])
    query = query_returning(None)
    query.join.return_value = query
    db = Mock()
    db.query.return_value = query
    with pytest.raises(HTTPException) as error:
        clients.get_client(5, db, context())
    assert error.value.status_code == 404
    text = predicates(query)
    assert "customers.organization_id = 7" in text
    assert "customers.deleted_at IS NULL" in text
    assert "customers.id IN (5)" in text


def test_kyc_access_rechecks_assignment_before_reading_customer(monkeypatch):
    monkeypatch.setattr(clients, "get_advisor_employee",
                        lambda advisor, db: SimpleNamespace(id=3, organization_id=7))
    monkeypatch.setattr(clients, "get_advisor_customer_ids", lambda advisor, db: [])
    db = Mock()
    with pytest.raises(HTTPException) as error:
        clients.get_client_kyc(5, context(), db)
    assert error.value.status_code == 404
    db.query.assert_not_called()
