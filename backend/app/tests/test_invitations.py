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
