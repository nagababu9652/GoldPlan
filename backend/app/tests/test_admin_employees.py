from types import SimpleNamespace as Record
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.models.organization.employee import Employee
from app.routers import admin_employees


def query(first=None):
    value = Mock()
    value.filter.return_value = value
    value.first.return_value = first
    return value


def test_employee_lookup_is_organization_scoped():
    db = Mock()
    q = query(Record(id=4, organization_id=7))
    db.query.return_value = q
    assert admin_employees.scoped(db, Employee, 4, 7).organization_id == 7
    predicates = " ".join(str(arg.compile(compile_kwargs={"literal_binds": True})) for arg in q.filter.call_args.args)
    assert "employees.id = 4" in predicates
    assert "employees.organization_id = 7" in predicates


def test_employee_lookup_hides_another_organization():
    db = Mock()
    db.query.return_value = query(None)
    with pytest.raises(HTTPException) as error:
        admin_employees.scoped(db, Employee, 4, 7)
    assert error.value.status_code == 404


def test_employee_cannot_report_to_themselves():
    with pytest.raises(HTTPException) as error:
        admin_employees.validate_manager(Mock(), 7, 4, 4)
    assert error.value.status_code == 422


def test_head_cannot_deactivate_own_employee_record():
    context = Record(employee_id=4, organization_id=7, user_id=1, session_id=2)
    with pytest.raises(HTTPException) as error:
        admin_employees.deactivate_employee(4, context, Mock())
    assert error.value.status_code == 409
