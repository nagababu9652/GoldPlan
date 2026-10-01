from types import SimpleNamespace as Record
from unittest.mock import Mock
import pytest
from fastapi import HTTPException
from app.models.organization.core import Branch
from app.routers import admin_organization

def query(first=None):
    value=Mock(); value.filter.return_value=value; value.first.return_value=first; return value

def test_scoped_lookup_includes_organization_boundary():
    db=Mock(); q=query(Record(id=4,organization_id=7)); db.query.return_value=q
    assert admin_organization.scoped(db,Branch,4,7).organization_id==7
    predicates=" ".join(str(arg.compile(compile_kwargs={"literal_binds":True})) for arg in q.filter.call_args.args)
    assert "branches.id = 4" in predicates and "branches.organization_id = 7" in predicates

def test_scoped_lookup_hides_another_organization():
    db=Mock(); db.query.return_value=query(None)
    with pytest.raises(HTTPException) as error: admin_organization.scoped(db,Branch,4,7)
    assert error.value.status_code==404

def test_referenced_branch_cannot_be_deactivated(monkeypatch):
    branch=Record(id=4,organization_id=7,is_active=True,updated_by=None)
    monkeypatch.setattr(admin_organization,"scoped",lambda *args:branch)
    db=Mock(); db.query.return_value=query(Record(id=10)); context=Record(organization_id=7,user_id=1,session_id=2)
    with pytest.raises(HTTPException) as error: admin_organization.set_branch_active(4,False,context,db)
    assert error.value.status_code==409; db.commit.assert_not_called()
