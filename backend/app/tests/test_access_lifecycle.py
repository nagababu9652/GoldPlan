from types import SimpleNamespace as Record
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.models.identity.security import AuditLog
from app.services import access_lifecycle
from app.services.access import AccessContext


def actor(**updates):
    values = dict(
        user_id=1, session_id=9, party_id=2, organization_id=7,
        actor_type="HEAD", employee_id=3, roles=frozenset({"ORG_ADMIN"}),
        permissions=frozenset({"ORG.EMPLOYEE.ACCESS_MANAGE"}),
        denied_permissions=frozenset(), subscription_status="ACTIVE",
        subscription_active=True, entitlements=frozenset({"FEATURE.EMPLOYEE_MANAGEMENT"}),
    )
    return AccessContext(**(values | updates))


def query_with(*, first=None, rows=None, updated=0):
    query = Mock()
    for method in ("filter", "join", "with_for_update"):
        getattr(query, method).return_value = query
    query.first.return_value = first
    query.all.return_value = rows or []
    query.update.return_value = updated
    return query


def test_last_active_head_cannot_be_disabled():
    db = Mock()
    db.query.return_value = query_with(rows=[(Record(), 5)])
    with pytest.raises(HTTPException) as error:
        access_lifecycle.protect_last_active_head(db, target_user_id=5, organization_id=7)
    assert error.value.status_code == 409
    assert error.value.detail == "Cannot disable the last active Head"


def test_head_can_be_disabled_when_another_active_head_remains():
    db = Mock()
    db.query.return_value = query_with(rows=[(Record(), 5), (Record(), 6)])
    access_lifecycle.protect_last_active_head(db, target_user_id=5, organization_id=7)


def test_session_revocation_ends_sessions_and_refresh_tokens():
    sessions = [Record(id=10, is_active=True, logout_time=None), Record(id=11, is_active=True, logout_time=None)]
    session_query = query_with(rows=sessions)
    token_query = query_with(updated=2)
    db = Mock()
    db.query.side_effect = [session_query, token_query]
    assert access_lifecycle.revoke_user_sessions(db, user_id=5) == 2
    assert all(not session.is_active and session.logout_time is not None for session in sessions)
    token_query.update.assert_called_once()


def test_disable_access_updates_user_revokes_sessions_and_audits(monkeypatch):
    employee = Record(id=4)
    user = Record(id=5, account_status="ACTIVE", is_active=True, updated_by=None)
    monkeypatch.setattr(access_lifecycle, "employee_user_for_update", lambda *args: (employee, user))
    protect = Mock()
    revoke = Mock(return_value=3)
    monkeypatch.setattr(access_lifecycle, "protect_last_active_head", protect)
    monkeypatch.setattr(access_lifecycle, "revoke_user_sessions", revoke)
    db = Mock()
    result, count = access_lifecycle.set_employee_login_access(
        db, employee_id=4, enabled=False, actor=actor(),
    )
    assert result is user and count == 3
    assert user.account_status == "DISABLED" and not user.is_active
    protect.assert_called_once_with(db, 5, 7)
    revoke.assert_called_once_with(db, 5)
    audit = db.add.call_args.args[0]
    assert isinstance(audit, AuditLog)
    assert audit.action == "LOGIN_DISABLED"
    assert audit.session_id == 9
    assert audit.new_values["revoked_sessions"] == 3


def test_enable_access_does_not_create_or_restore_sessions(monkeypatch):
    employee = Record(id=4)
    user = Record(id=5, account_status="DISABLED", is_active=False, updated_by=None)
    monkeypatch.setattr(access_lifecycle, "employee_user_for_update", lambda *args: (employee, user))
    revoke = Mock()
    monkeypatch.setattr(access_lifecycle, "revoke_user_sessions", revoke)
    db = Mock()
    _, count = access_lifecycle.set_employee_login_access(
        db, employee_id=4, enabled=True, actor=actor(),
    )
    assert count == 0
    assert user.account_status == "ACTIVE" and user.is_active
    revoke.assert_not_called()

