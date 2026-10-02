from types import SimpleNamespace
from unittest.mock import Mock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import advisors
from app.services import access


def context(*, actor="EMPLOYEE", permissions=()):
    return access.AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type=actor,
        employee_id=3 if actor != "CLIENT" else None,
        customer_id=10 if actor == "CLIENT" else None,
        roles=frozenset({actor}), permissions=frozenset(permissions),
        denied_permissions=frozenset(),
    )


def test_overview_routes_require_staff_and_permissions():
    app = FastAPI()
    app.include_router(advisors.router)
    db = Mock()
    app.dependency_overrides[get_db] = lambda: db
    expected = {
        "/advisors/dashboard": "CLIENT.READ",
        "/advisors/portfolio": "HOLDING.READ",
        "/advisors/profile": "PROFILE.READ",
    }
    for path, code in expected.items():
        for actor_context in (context(), context(actor="CLIENT", permissions=(code,))):
            app.dependency_overrides[access.get_access_context] = lambda: actor_context
            assert TestClient(app).get(path).status_code == 403
    db.query.assert_not_called()

    for route in advisors.router.routes:
        if getattr(route, "path", None) not in expected:
            continue
        names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in names
        permission = next(dep.call for dep in route.dependant.dependencies
                          if dep.call.__qualname__ == "require_permission.<locals>.dependency")
        assert permission.__closure__[0].cell_contents == expected[route.path]


def test_portfolio_uses_assigned_client_holdings_not_fixed_figures(monkeypatch):
    monkeypatch.setattr(advisors, "get_report_employee",
                        lambda advisor, db: SimpleNamespace(id=3, organization_id=7))
    monkeypatch.setattr(advisors, "get_report_customer_ids", lambda advisor, db: [10])
    account = SimpleNamespace(id=20)
    holdings = [
        SimpleNamespace(security_type="EQUITY", quantity=2, average_cost=80, current_price=100),
        SimpleNamespace(security_type="EQUITY", quantity=1, average_cost=50, current_price=60),
    ]
    account_query = Mock()
    account_query.filter.return_value.all.return_value = [account]
    holding_query = Mock()
    holding_query.filter.return_value.all.return_value = holdings
    db = Mock()
    db.query.side_effect = [account_query, holding_query]

    result = advisors.get_advisor_portfolio(context(permissions=("HOLDING.READ",)), db)

    assert result["total_value"] == 260
    assert result["total_cost"] == 210
    assert result["total_returns"] == 50
    assert result["holdings"][0]["name"] == "EQUITY"
    assert result["holdings"][0]["allocation"] == 100
    account_predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                                  for call in account_query.filter.call_args_list for value in call.args)
    assert "financial_accounts.organization_id = 7" in account_predicates
    assert "financial_accounts.customer_id IN (10)" in account_predicates
