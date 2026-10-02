from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers.advisor import messages
from app.services import access


def context(*, actor="EMPLOYEE", permissions=("MESSAGE.READ",)):
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


def test_message_routes_require_staff_and_explicit_permissions():
    app = FastAPI()
    app.include_router(messages.router)
    db = Mock()
    app.dependency_overrides[get_db] = lambda: db
    for actor_context in (context(permissions=()), context(actor="CLIENT")):
        app.dependency_overrides[access.get_access_context] = lambda: actor_context
        assert TestClient(app).get("/messages/5").status_code == 403
    db.query.assert_not_called()

    expected = {
        ("GET", "/messages/"): "MESSAGE.READ",
        ("GET", "/messages/{message_id}"): "MESSAGE.READ",
        ("POST", "/messages/"): "MESSAGE.CREATE",
        ("PUT", "/messages/{message_id}"): "MESSAGE.UPDATE",
        ("POST", "/messages/{message_id}/read"): "MESSAGE.UPDATE",
        ("POST", "/messages/{message_id}/archive"): "MESSAGE.UPDATE",
    }
    for route in messages.router.routes:
        names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in names
        permission = next(dep.call for dep in route.dependant.dependencies
                          if dep.call.__qualname__ == "require_permission.<locals>.dependency")
        assert permission.__closure__[0].cell_contents == expected[(next(iter(route.methods)), route.path)]


def test_group_message_requires_assignment_when_primary_advisor_is_unset():
    group = SimpleNamespace(id=10, primary_branch_id=4,
                            primary_advisor_employee_id=None)
    assignment_query = query_returning(None)
    db = Mock()
    db.query.side_effect = [query_returning(group), assignment_query]
    employee = SimpleNamespace(id=3, organization_id=7)

    with pytest.raises(HTTPException) as error:
        messages.validate_customer_and_group(db, employee, None, 10)
    assert error.value.status_code == 404
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in assignment_query.filter.call_args_list for value in call.args)
    assert "employee_assignments.employee_id = 3" in predicates
    assert "employee_assignments.deleted_at IS NULL" in predicates

    allowed = Mock()
    allowed.query.side_effect = [query_returning(group), query_returning(SimpleNamespace(id=1))]
    messages.validate_customer_and_group(allowed, employee, None, 10)


def test_existing_message_is_hidden_when_assignment_expires():
    employee = SimpleNamespace(id=3, organization_id=7)
    stored_message = SimpleNamespace(id=5, customer_id=10, customer_group_id=None)
    db = Mock()
    db.query.side_effect = [query_returning(employee), query_returning(stored_message),
                            query_returning(None), query_returning(None)]
    with pytest.raises(HTTPException) as error:
        messages.get_message(5, db, context())
    assert error.value.status_code == 404
