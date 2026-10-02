from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.identity.authorization import Role, UserRole
from app.models.identity.security import AuditLog
from app.models.organization.core import Branch, Department, Designation, Organization
from app.models.organization.employee import Employee, EmployeeRole
from app.routers import auth as auth_router
from app.routers import onboarding
from app.schemas.auth import UserRegister
from app.schemas.organization import OrganizationBootstrap
from app.services.access import AuthenticatedIdentity
from app.services.onboarding_service import bootstrap_head_organization


class EmptyQuery:
    def filter(self, *args):
        return self

    def first(self):
        return None

    def all(self):
        return []


class RecordingDB:
    def __init__(self):
        self.added = []
        self.next_id = 1

    def query(self, *args):
        return EmptyQuery()

    def add(self, value):
        self.added.append(value)

    def flush(self):
        for value in self.added:
            if hasattr(value, "id") and value.id is None:
                value.id = self.next_id
                self.next_id += 1


def test_public_registration_rejects_role_and_organization_grants():
    base = dict(first_name="A", last_name="User", email="a@example.com", password="password1")
    for extra in ({"role": "org_admin"}, {"organization_id": 7}, {"organization_name": "Other Org"}):
        with pytest.raises(ValidationError):
            UserRegister(**base, **extra)


def test_registration_requires_a_verified_otp(monkeypatch):
    db = Mock()
    db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
    monkeypatch.setattr(auth_router.auth, "get_user_by_email", Mock(return_value=None))
    monkeypatch.setattr(auth_router.auth, "create_user", Mock())
    request = UserRegister(
        first_name="A", last_name="User", email="a@example.com", password="password1",
    )
    with pytest.raises(HTTPException) as error:
        auth_router.register(request, db)
    assert error.value.status_code == 403
    auth_router.auth.create_user.assert_not_called()


def test_bootstrap_builds_employee_head_grant_and_audit_record():
    db = RecordingDB()
    party = SimpleNamespace(
        id=11, organization_id=None, email="head@example.com", mobile_number="123",
        updated_by=None,
    )
    organization, branch, employee, role = bootstrap_head_organization(
        db,
        organization_name="Example Planning",
        branch_name="Head Office",
        party=party,
        user_id=5,
        session_id=9,
    )
    assert party.organization_id == organization.id
    assert branch.organization_id == organization.id
    assert employee.organization_id == organization.id
    assert role.organization_id == organization.id
    assert role.role_code == "ORG_ADMIN"
    assert {value.role_code for value in db.added if isinstance(value, Role)} == {"ORG_ADMIN", "ADVISOR"}
    assert any(isinstance(value, Department) for value in db.added)
    assert any(isinstance(value, Designation) for value in db.added)
    assert any(isinstance(value, UserRole) and value.assigned_by == 5 for value in db.added)
    assert any(isinstance(value, EmployeeRole) and value.assigned_by == 5 for value in db.added)
    audit = next(value for value in db.added if isinstance(value, AuditLog))
    assert audit.action == "BOOTSTRAP"
    assert audit.session_id == 9
    assert audit.new_values["authorized_by_user_id"] == 5


def test_bootstrap_rejects_unverified_identity_before_writing():
    identity = AuthenticatedIdentity.model_construct(
        user=SimpleNamespace(id=5, party_id=11, email_verified=False),
        session=SimpleNamespace(id=9),
    )
    db = Mock()
    with pytest.raises(HTTPException) as error:
        onboarding.create_organization_onboarding_endpoint(
            OrganizationBootstrap(organization_name="Example Planning"), identity, db,
        )
    assert error.value.status_code == 403
    db.add.assert_not_called()
