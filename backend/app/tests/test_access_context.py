"""Authorization policy and pilot-route regression tests."""
from datetime import datetime, timedelta
from types import SimpleNamespace as Record
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.services import access


def context(**updates):
    values = dict(
        user_id=1, party_id=2, organization_id=3, actor_type="EMPLOYEE",
        employee_id=4, roles=frozenset({"ADVISOR"}),
        permissions=frozenset({"CLIENT.READ"}), denied_permissions=frozenset(),
        customer_ids=frozenset({10}),
        subscription_status="ACTIVE", entitlements=frozenset({"FEATURE.CRM"}),
        limits={"LIMIT.CLIENTS": 10},
        subscription_active=True,
    )
    return access.AccessContext(**(values | updates))


def setup_resolver(monkeypatch, *, grants=(), employee_grants=(), overrides=(), role_code="ADVISOR", expired=False,
                   extra_employee=False, session=True, user=True, organization=True):
    now = datetime.utcnow()
    role = Record(id=5, role_code=role_code, is_active=True, organization_id=None if extra_employee else 3)
    actor = Record(id=1, party_id=2, roles=[Record(
        role=role, effective_from=now - timedelta(days=2),
        effective_to=now - timedelta(days=1) if expired else None,
    )])
    employee = Record(id=4, organization_id=3)
    employees = [employee, Record(id=6, organization_id=8)] if extra_employee else [employee]
    # Exercise the real resolver with ordered query results; SQL filters are
    # inspected separately below so a missing scope predicate cannot go unnoticed.
    subscription = Record(
        status="ACTIVE", current_period_end=now + timedelta(days=1), grace_ends_at=None,
        entitlement_snapshot={"features": ["FEATURE.CRM"], "limits": {"LIMIT.CLIENTS": 10}},
    )
    results = [actor if user else None, Record(id=9) if session else None, Record(),
               employees, [], Record() if organization else None, subscription,
               list(grants), list(employee_grants), list(overrides), [(10,)]]
    queries = []
    db = Mock()
    def query(*args):
        q = Mock()
        for method in ("filter", "join", "outerjoin"):
            getattr(q, method).return_value = q
        result = results[len(queries)]
        q.first.return_value = result
        q.all.return_value = result
        queries.append(q)
        return q
    db.query.side_effect = query
    monkeypatch.setattr(access.auth, "decode_token", lambda token: Record(
        sub="1", session_uuid="11111111-1111-1111-1111-111111111111",
        type="access", role="ORG_ADMIN",  # Untrusted claim must not promote the actor.
    ))
    return db, queries


def test_live_roles_override_jwt_and_denial_wins(monkeypatch):
    db, _ = setup_resolver(monkeypatch, grants=[
        ("CLIENT.READ", True), ("CLIENT.READ", False), ("PROFILE.READ", False),
    ])
    result = access.resolve_access_context("token", db)
    assert result.actor_type == "EMPLOYEE"
    assert "ORG_ADMIN" not in result.roles
    assert result.customer_ids == {10}
    assert not result.permissions
    with pytest.raises(HTTPException) as error:
        result.check_permission("PROFILE.READ")
    assert error.value.status_code == 403


@pytest.mark.parametrize("option", [{"session": False}, {"user": False}])
def test_inactive_login_or_session_rejected(monkeypatch, option):
    db, _ = setup_resolver(monkeypatch, **option)
    with pytest.raises(HTTPException) as error:
        access.resolve_access_context("token", db)
    assert error.value.status_code == 401


@pytest.mark.parametrize("option", [{"expired": True}, {"organization": False}, {"extra_employee": True}])
def test_expired_role_or_inactive_organization_denied(monkeypatch, option):
    db, _ = setup_resolver(monkeypatch, **option)
    with pytest.raises(HTTPException) as error:
        access.resolve_access_context("token", db)
    assert error.value.status_code == 403


def test_query_predicates_enforce_session_and_assignment_scope(monkeypatch):
    db, queries = setup_resolver(monkeypatch)
    access.resolve_access_context("token", db)
    def filters(index):
        return " ".join(str(arg.compile(compile_kwargs={"literal_binds": True}))
                        for call in queries[index].filter.call_args_list for arg in call.args)
    assert "user_sessions.user_id = 1" in filters(1)
    assert "user_sessions.is_active IS true" in filters(1)
    assert "users.account_status = 'ACTIVE'" in filters(0)
    assert "organization_subscriptions.organization_id = 3" in filters(6)
    assert "employee_assignments.assignment_type = 'ADVISOR'" in filters(10)
    join_predicates = " ".join(str(arg.compile(compile_kwargs={"literal_binds": True}))
                               for call in queries[10].join.call_args_list for arg in call.args[1:])
    assert "employee_assignments.entity_type = 'CUSTOMER'" in join_predicates
    assert "employee_assignments.entity_type = 'CUSTOMER_GROUP'" in join_predicates
    assert "employee_assignments.entity_type = 'BRANCH'" in join_predicates
    assert "customers.organization_id = 3" in filters(10)
    assert "employee_assignments.effective_to >=" in filters(10)
    assert "employee_assignments.effective_from <=" in filters(10)
    assert "permission_profiles.organization_id = 3" in filters(7)


def test_employee_profile_and_override_denials_win(monkeypatch):
    db, _ = setup_resolver(
        monkeypatch,
        grants=[("CLIENT.READ", True)],
        employee_grants=[("TASK.READ", True)],
        overrides=[("CLIENT.READ", False), ("REPORT.READ", True)],
    )
    result = access.resolve_access_context("token", db)
    assert result.permissions == {"TASK.READ", "REPORT.READ"}
    assert result.denied_permissions == {"CLIENT.READ"}


@pytest.mark.parametrize("kind", ["refresh", None])
def test_refresh_or_untyped_tokens_cannot_call_protected_endpoints(monkeypatch, kind):
    monkeypatch.setattr(access.auth, "decode_token", lambda _: Record(type=kind))
    with pytest.raises(HTTPException) as error:
        access.resolve_access_context("token", Mock())
    assert error.value.status_code == 401


def test_customer_scope_requires_current_assignment_and_organization():
    context().check_customer(10, 3)
    for customer_id, org_id in [(11, 3), (10, 9)]:
        with pytest.raises(HTTPException):
            context().check_customer(customer_id, org_id)
    with pytest.raises(HTTPException):
        context(actor_type="HEAD").check_customer(10, 9)
    with pytest.raises(HTTPException):
        access.require_head(context())


def test_subscription_entitlement_and_limits_are_separate_from_permissions():
    active = context()
    active.check_entitlement("FEATURE.CRM")
    active.check_limit("LIMIT.CLIENTS", current_usage=9)
    with pytest.raises(HTTPException) as missing:
        active.check_entitlement("FEATURE.MULTI_BRANCH")
    assert missing.value.status_code == 403
    with pytest.raises(HTTPException) as exceeded:
        active.check_limit("LIMIT.CLIENTS", current_usage=10)
    assert exceeded.value.status_code == 409


def test_inactive_subscription_blocks_business_dependencies():
    inactive = context(
        subscription_status="SUSPENDED", subscription_active=False,
        entitlements=frozenset(), limits={},
    )
    with pytest.raises(HTTPException) as blocked:
        access.require_active_subscription(inactive)
    assert blocked.value.status_code == 403
    assert "active organization subscription" in blocked.value.detail

    entitlement_dependency = access.require_subscription_entitlement("FEATURE.CRM")
    with pytest.raises(HTTPException):
        entitlement_dependency(inactive)


def test_active_subscription_still_requires_requested_feature():
    dependency = access.require_subscription_entitlement("FEATURE.GROUPS")
    with pytest.raises(HTTPException) as missing:
        dependency(context(entitlements=frozenset({"FEATURE.CRM"})))
    assert missing.value.status_code == 403


def test_permission_removal_is_seen_on_next_resolution(monkeypatch):
    first_db, _ = setup_resolver(monkeypatch, grants=[("CLIENT.READ", True)])
    assert "CLIENT.READ" in access.resolve_access_context("token", first_db).permissions
    second_db, _ = setup_resolver(monkeypatch)
    assert "CLIENT.READ" not in access.resolve_access_context("token", second_db).permissions


def test_client_scope_is_own_customer_only():
    client = context(actor_type="CLIENT", employee_id=None, customer_id=20)
    client.check_customer(20, 3)
    with pytest.raises(HTTPException):
        client.check_customer(10, 3)
    with pytest.raises(HTTPException):
        access.require_employee(client)


def test_pilot_route_enforces_new_dependency(monkeypatch):
    from app.routers.advisors import router, get_current_advisor
    from app.database.session import get_db
    app = FastAPI()
    app.include_router(router)
    user = Record(party_id=2, display_name="Advisor", email="a@example.com",
                  mobile_number="", created_at=datetime.utcnow())
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = Record(first_name="A", last_name="B")
    app.dependency_overrides[get_current_advisor] = lambda: user
    app.dependency_overrides[get_db] = lambda: db
    client = TestClient(app)
    app.dependency_overrides[access.get_access_context] = lambda: context(permissions=frozenset({"PROFILE.READ"}))
    assert client.get("/advisors/profile").status_code == 200
    app.dependency_overrides[access.get_access_context] = lambda: context(permissions=frozenset())
    assert client.get("/advisors/profile").status_code == 403


def test_application_router_blocks_inactive_subscription():
    from app.main import app
    from app.database.session import get_db
    from app.routers.advisors import get_current_advisor

    user = Record(
        party_id=2, display_name="Advisor", email="a@example.com",
        mobile_number="", created_at=datetime.utcnow(),
    )
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = Record(first_name="A", last_name="B")
    app.dependency_overrides[get_current_advisor] = lambda: user
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[access.get_access_context] = lambda: context(
        permissions=frozenset({"PROFILE.READ"}),
        subscription_status="SUSPENDED", subscription_active=False,
        entitlements=frozenset(),
    )
    try:
        response = TestClient(app).get("/advisors/profile")
        assert response.status_code == 403
        assert response.json()["detail"] == "An active organization subscription is required"
    finally:
        app.dependency_overrides.clear()
