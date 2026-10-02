from datetime import datetime, timedelta
from types import SimpleNamespace as Record
from unittest.mock import Mock

from app.models.identity.security import AuditLog
from app.routers import invitations, portal_publications
from app.services import access_lifecycle


def invitation_row():
    return Record(id=8, organization_id=7, employee_id=4, customer_id=None,
                  invitation_type="EMPLOYEE_ACCESS", email="employee@example.com",
                  accepted_at=None, revoked_at=None, created_at=datetime.utcnow(),
                  expires_at=datetime.utcnow() + timedelta(days=1))


def test_invitation_revocation_is_audited_once():
    row = invitation_row()
    db = Mock(); query = db.query.return_value
    query.filter.return_value = query; query.with_for_update.return_value = query
    query.first.return_value = row
    context = Record(organization_id=7, user_id=1, session_id=3)

    invitations.revoke_invitation(8, context, db)
    invitations.revoke_invitation(8, context, db)

    audit = db.add.call_args.args[0]
    assert isinstance(audit, AuditLog)
    assert audit.action == "INVITATION_REVOKED"
    assert audit.record_id == 8
    assert db.add.call_count == 1


def test_login_disable_has_separate_session_revocation_audit(monkeypatch):
    employee = Record(id=4)
    user = Record(id=5, account_status="ACTIVE", is_active=True, updated_by=None)
    monkeypatch.setattr(access_lifecycle, "employee_user_for_update", lambda *args: (employee, user))
    monkeypatch.setattr(access_lifecycle, "protect_last_active_head", lambda *args: None)
    monkeypatch.setattr(access_lifecycle, "revoke_user_sessions", lambda *args: 2)
    db = Mock()
    actor = Record(organization_id=7, user_id=1, session_id=3)

    access_lifecycle.set_employee_login_access(db, employee_id=4, enabled=False, actor=actor)

    audits = [call.args[0] for call in db.add.call_args_list]
    assert [audit.action for audit in audits] == ["SESSIONS_REVOKED", "LOGIN_DISABLED"]
    assert audits[0].new_values["count"] == 2


def test_publication_revocation_is_audited_once(monkeypatch):
    monkeypatch.setattr(portal_publications, "customer_for_staff", lambda *args: None)
    row = Record(id=9, organization_id=7, customer_id=4, resource_type="REPORT",
                 resource_id=12, revoked_at=None, revoked_by_user_id=None,
                 published_at=datetime.utcnow(), published_by_user_id=5)
    db = Mock(); query = db.query.return_value
    query.filter.return_value = query; query.with_for_update.return_value = query
    query.first.return_value = row
    context = Record(organization_id=7, user_id=1, session_id=3,
                     check_permission=lambda code: None)

    portal_publications.revoke(4, 9, context, db)
    portal_publications.revoke(4, 9, context, db)

    audit = db.add.call_args.args[0]
    assert isinstance(audit, AuditLog)
    assert audit.action == "REVOKE_PUBLICATION"
    assert audit.record_id == 9
    assert db.add.call_count == 1
