from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import financial_accounts, goals, holdings
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


def test_finance_routes_require_staff_and_resource_permissions():
    cases = (
        (goals.router, "GOAL", "/advisors/goals/5"),
        (financial_accounts.router, "ACCOUNT", "/advisors/financial-accounts/5"),
        (holdings.router, "HOLDING", "/advisors/holdings?financial_account_id=5"),
    )
    for router, prefix, path in cases:
        app = FastAPI()
        app.include_router(router)
        db = Mock()
        app.dependency_overrides[get_db] = lambda: db
        for actor_context in (context(), context(actor="CLIENT", permissions=(f"{prefix}.READ",))):
            app.dependency_overrides[access.get_access_context] = lambda: actor_context
            assert TestClient(app).get(path).status_code == 403
        db.query.assert_not_called()

        expected = {
            "GET": f"{prefix}.READ", "POST": f"{prefix}.CREATE",
            "PUT": f"{prefix}.UPDATE", "DELETE": f"{prefix}.UPDATE",
        }
        for route in router.routes:
            names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
            assert "require_employee" in names
            permission = next(dep.call for dep in route.dependant.dependencies
                              if dep.call.__qualname__ == "require_permission.<locals>.dependency")
            assert permission.__closure__[0].cell_contents == expected[next(iter(route.methods))]


def test_group_goal_requires_current_assignment_even_without_primary_advisor(monkeypatch):
    monkeypatch.setattr(goals, "get_report_employee",
                        lambda advisor, db: SimpleNamespace(id=3, organization_id=7))
    group = SimpleNamespace(id=5, primary_branch_id=2, primary_advisor_employee_id=None)
    assignment_query = query_returning(None)
    db = Mock()
    db.query.side_effect = [query_returning(group), assignment_query]

    with pytest.raises(HTTPException) as error:
        goals.authorize_owner(db, context(), None, 5)
    assert error.value.status_code == 404
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in assignment_query.filter.call_args_list for value in call.args)
    assert "employee_assignments.employee_id = 3" in predicates
    assert "employee_assignments.deleted_at IS NULL" in predicates


def test_foreign_account_is_hidden_before_owner_check(monkeypatch):
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = None
    owner = Mock()
    monkeypatch.setattr(financial_accounts, "authorize_owner", owner)
    with pytest.raises(HTTPException) as error:
        financial_accounts.get_account_for_advisor(db, context(), 5)
    assert error.value.status_code == 404
    owner.assert_not_called()
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in db.query.return_value.filter.call_args_list for value in call.args)
    assert "financial_accounts.organization_id = 7" in predicates


def test_holding_detail_rechecks_account_ownership(monkeypatch):
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = SimpleNamespace(
        id=8, financial_account_id=5,
    )
    owner = Mock(side_effect=HTTPException(404, "Financial account not found"))
    monkeypatch.setattr(holdings, "get_account_for_advisor", owner)
    with pytest.raises(HTTPException) as error:
        holdings.owned(db, context(), 8)
    assert error.value.status_code == 404
    owner.assert_called_once_with(db, context(), 5)
