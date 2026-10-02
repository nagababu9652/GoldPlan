from datetime import date
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import groups
from app.schemas.group import MoveHouseholdRequest
from app.services import access
from app.tests.test_groups_router import (
    FakeDB, make_advisor, make_context, make_customer, make_group,
    make_group_member,
)


def test_group_routes_require_staff_and_permissions():
    expected = {
        ("GET", "/advisors/groups/{group_id}/financial-summary"): "GROUP.READ",
        ("GET", "/advisors/groups/"): "GROUP.READ",
        ("POST", "/advisors/groups/"): "GROUP.CREATE",
        ("GET", "/advisors/groups/{group_id}"): "GROUP.READ",
        ("GET", "/advisors/groups/{group_id}/members"): "GROUP.READ",
        ("GET", "/advisors/groups/{group_id}/members/history"): "GROUP.READ",
        ("PUT", "/advisors/groups/{group_id}"): "GROUP.UPDATE",
        ("POST", "/advisors/groups/{group_id}/members"): "GROUP.UPDATE",
        ("PUT", "/advisors/groups/{group_id}/head"): "GROUP.UPDATE",
        ("DELETE", "/advisors/groups/{group_id}/members/{customer_id}"): "GROUP.UPDATE",
        ("POST", "/advisors/groups/{group_id}/deactivate"): "GROUP.DEACTIVATE",
        ("POST", "/advisors/groups/{group_id}/move-client"): "GROUP.UPDATE",
    }
    seen = set()
    for route in groups.router.routes:
        key = (next(iter(route.methods)), route.path)
        seen.add(key)
        names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in names
        permissions = {
            dep.call.__closure__[0].cell_contents
            for dep in route.dependant.dependencies
            if dep.call.__qualname__ == "require_permission.<locals>.dependency"
        }
        assert expected[key] in permissions
        if key[1].endswith("financial-summary"):
            assert permissions == {"GROUP.READ", "ACCOUNT.READ", "HOLDING.READ", "GOAL.READ"}
    assert seen == set(expected)

    app = FastAPI()
    app.include_router(groups.router)
    db = Mock()
    app.dependency_overrides[get_db] = lambda: db
    for actor_context in (
        access.AccessContext(user_id=1, party_id=2, organization_id=7,
                             actor_type="EMPLOYEE", employee_id=3,
                             roles=frozenset({"EMPLOYEE"}), permissions=frozenset(),
                             denied_permissions=frozenset()),
        access.AccessContext(user_id=1, party_id=2, organization_id=7,
                             actor_type="CLIENT", customer_id=5,
                             roles=frozenset({"CLIENT"}), permissions=frozenset({"GROUP.READ"}),
                             denied_permissions=frozenset()),
    ):
        app.dependency_overrides[access.get_access_context] = lambda: actor_context
        assert TestClient(app).get("/advisors/groups/5").status_code == 403
    db.query.assert_not_called()


def test_group_without_primary_advisor_requires_assignment():
    group = make_group(5, primary_advisor_employee_id=None)
    db = FakeDB(employees=[make_advisor()], groups=[group], assignments=[])
    with pytest.raises(HTTPException) as error:
        groups.get_group(5, db, make_context(db))
    assert error.value.status_code == 404
    listed = groups.list_groups(db=db, advisor=make_context(db),
                                group_type=None, search=None, include_inactive=False)
    assert listed.total == 0


def test_move_rejects_unassigned_source_before_changing_history():
    customer = make_customer(7)
    source, target = make_group(1), make_group(2)
    old = make_group_member(1, 1, customer, is_primary=True)
    assignment = SimpleNamespace(
        employee_id=5, assignment_type="ADVISOR", entity_type="CUSTOMER_GROUP",
        entity_id=2, effective_from=date(2020, 1, 1), effective_to=None,
        is_active=True, deleted_at=None,
    )
    db = FakeDB(employees=[make_advisor()], groups=[source, target],
                customers=[customer], members=[old], assignments=[assignment])

    with pytest.raises(HTTPException) as error:
        groups.move_client_to_household(2, MoveHouseholdRequest(customer_id=7),
                                        db, make_context(db))
    assert error.value.status_code == 404
    assert old.left_on is None
    assert source.is_active is True
    assert db.rolled_back is True
