from datetime import datetime,timedelta
from types import SimpleNamespace as Record
from unittest.mock import Mock
import pytest
from fastapi import HTTPException
from app.routers import invitations

def test_invitation_tokens_are_stored_as_one_way_hashes():
    raw="a"*43
    assert invitations.token_hash(raw)!=raw
    assert len(invitations.token_hash(raw))==64

def test_acceptance_lookup_locks_row_for_single_use(monkeypatch):
    row=Record(accepted_at=None,revoked_at=None,expires_at=datetime.utcnow()+timedelta(hours=1))
    query=Mock();query.filter.return_value=query;query.with_for_update.return_value=query;query.first.return_value=row
    db=Mock();db.query.return_value=query
    assert invitations.invitation_by_token(db,"token",True) is row
    query.with_for_update.assert_called_once()

@pytest.mark.parametrize("changes",[{"accepted_at":datetime.utcnow()},{"revoked_at":datetime.utcnow()},{"expires_at":datetime.utcnow()-timedelta(seconds=1)}])
def test_used_revoked_or_expired_invitation_cannot_be_replayed(changes):
    row=Record(accepted_at=None,revoked_at=None,expires_at=datetime.utcnow()+timedelta(hours=1))
    for key,value in changes.items():setattr(row,key,value)
    query=Mock();query.filter.return_value=query;query.first.return_value=row
    db=Mock();db.query.return_value=query
    with pytest.raises(HTTPException) as error:invitations.invitation_by_token(db,"token")
    assert error.value.status_code==410


@pytest.mark.parametrize("case", ["role", "party", "email"])
def test_acceptance_rechecks_role_party_and_recipient(monkeypatch, case):
    row = Record(id=5, party_id=7, organization_id=3, employee_id=9, customer_id=None,
                 invitation_type="EMPLOYEE_ACCESS", target_role="ORG_ADMIN" if case == "role" else "EMPLOYEE",
                 email="employee@example.com", accepted_at=None, revoked_at=None,
                 expires_at=datetime.utcnow()+timedelta(hours=1))
    party = Record(id=7, email="employee@example.com")
    employee = Record(id=9, party_id=8 if case == "party" else 7,
                      official_email="changed@example.com" if case == "email" else row.email)
    monkeypatch.setattr(invitations, "invitation_by_token", lambda *args: row)
    monkeypatch.setattr(invitations, "require_current_inviter_authority", lambda *args: None)
    monkeypatch.setattr(invitations, "linked_party", lambda *args: party)
    monkeypatch.setattr(invitations, "scoped_employee", lambda *args: employee)
    db = Mock()

    with pytest.raises(HTTPException) as error:
        invitations.accept_invitation(Record(token="x"*40, password="long-password"), db)

    assert error.value.status_code == 410
    db.commit.assert_not_called()


def test_employee_invitation_target_must_remain_active():
    query = Mock(); query.filter.return_value = query; query.first.return_value = None
    db = Mock(); db.query.return_value = query

    with pytest.raises(HTTPException) as error:
        invitations.scoped_employee(db, 9, 3)

    assert error.value.status_code == 404
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for value in query.filter.call_args.args)
    assert "employees.is_active IS true" in predicates
    assert "employees.employment_status = 'ACTIVE'" in predicates


@pytest.mark.parametrize("identity,grants,expected_status", [
    (None, [], 410),
    ((4, 9), [], 410),
    ((4, 9), [(True,)], None),
    ((4, 9), [(True,), (False,)], 410),
])
def test_inviter_authority_is_live_and_denial_wins(identity, grants, expected_status):
    db = Mock()
    queries = []
    results = [identity, grants, [], []]
    def query(*args):
        q = Mock()
        q.join.return_value = q
        q.filter.return_value = q
        q.first.return_value = results[len(queries)] if len(queries) == 0 else None
        q.all.return_value = results[len(queries)] if len(queries) > 0 else []
        queries.append(q)
        return q
    db.query.side_effect = query
    invitation = Record(invited_by_user_id=2, organization_id=3)
    if expected_status:
        with pytest.raises(HTTPException) as error:
            invitations.require_current_inviter_authority(db, invitation)
        assert error.value.status_code == expected_status
    else:
        invitations.require_current_inviter_authority(db, invitation)
