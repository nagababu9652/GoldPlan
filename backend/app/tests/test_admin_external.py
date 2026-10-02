from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.routers import admin_external
from app.models.organization.external import Agency


def test_arn_history_requires_organization_scoped_parent():
    db = Mock()
    parent_query = Mock()
    parent_query.filter.return_value = parent_query
    parent_query.first.return_value = None
    db.query.return_value = parent_query

    with pytest.raises(HTTPException) as error:
        admin_external.arn_history(42, SimpleNamespace(organization_id=7), db)

    assert error.value.status_code == 404
    db.query.assert_called_once()
    predicates = " ".join(
        str(value.compile(compile_kwargs={"literal_binds": True}))
        for value in parent_query.filter.call_args.args
    )
    assert "arn_holders.id = 42" in predicates
    assert "arn_holders.organization_id = 7" in predicates


@pytest.mark.parametrize("operation", [
    lambda db, context: admin_external.list_arn_documents(42, context, db),
    lambda db, context: admin_external.download_arn_document(42, 9, context, db),
])
def test_arn_document_reads_reject_other_organizations(operation):
    db = Mock()
    parent_query = Mock()
    parent_query.filter.return_value = parent_query
    parent_query.first.return_value = None
    db.query.return_value = parent_query

    with pytest.raises(HTTPException) as error:
        operation(db, SimpleNamespace(organization_id=7))

    assert error.value.status_code == 404
    db.query.assert_called_once()


def test_bulk_agency_change_is_atomic_when_id_is_outside_organization():
    db = Mock()
    query = db.query.return_value
    query.filter.return_value = query
    query.with_for_update.return_value = query
    row = SimpleNamespace(id=2, is_active=True, status="ACTIVE", end_date=None, updated_by=None)
    query.all.return_value = [row]
    context = SimpleNamespace(organization_id=7, user_id=1, session_id=3)

    with pytest.raises(HTTPException) as error:
        admin_external.bulk_change_active(db, context, Agency, [2, 99], False)

    assert error.value.status_code == 404
    assert row.is_active is True
    db.commit.assert_not_called()


def test_bulk_agency_change_audits_each_changed_record():
    db = Mock()
    query = db.query.return_value
    query.filter.return_value = query
    query.with_for_update.return_value = query
    rows = [SimpleNamespace(id=i, is_active=True, status="ACTIVE", end_date=None, updated_by=None) for i in (2, 3)]
    query.all.return_value = rows
    context = SimpleNamespace(organization_id=7, user_id=1, session_id=3)

    result = admin_external.bulk_change_active(db, context, Agency, [2, 3], False)

    assert result == {"updated_ids": [2, 3]}
    assert all(row.is_active is False and row.status == "INACTIVE" for row in rows)
    assert db.add.call_count == 2
    db.commit.assert_called_once()


def test_bulk_arn_change_preserves_status_history():
    db = Mock()
    query = db.query.return_value
    query.filter.return_value = query
    query.with_for_update.return_value = query
    row = SimpleNamespace(id=6, status="SUSPENDED", is_active=True, updated_by=None)
    query.all.return_value = [row]
    context = SimpleNamespace(organization_id=7, user_id=1, session_id=3)

    result = admin_external.bulk_arn_status(db, context, [6], False)

    assert result == {"updated_ids": [6]}
    assert row.status == "INACTIVE" and row.is_active is False
    assert any(isinstance(call.args[0], admin_external.ArnStatusHistory) for call in db.add.call_args_list)
    db.commit.assert_called_once()
