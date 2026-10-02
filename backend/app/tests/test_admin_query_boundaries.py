from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from fastapi.routing import APIRoute

from app.main import app
from app.routers.admin_employees import employee_response
from app.routers.admin_external import agency_out, associate_out, arn_out


def test_admin_and_employee_routes_declare_persona_and_permission_guards():
    """Catch new protected routes that omit either authorization dependency."""
    checked = 0
    for included in app.routes:
        if not hasattr(included, "original_router"):
            continue
        for route in included.original_router.routes:
            if not isinstance(route, APIRoute):
                continue
            path = included.include_context.prefix + route.path
            if not path.startswith(("/admin/", "/employee/")) and path not in {"/admin", "/employee"}:
                continue
            names = {dependency.call.__qualname__ for dependency in route.dependant.dependencies}
            assert names & {"require_head", "require_employee"}, path
            assert "require_permission.<locals>.dependency" in names, path
            checked += 1
    assert checked >= 78


def test_employee_response_does_not_read_a_foreign_organization_party():
    employee = SimpleNamespace(id=4, organization_id=7, party_id=12)
    db = Mock()
    query = db.query.return_value
    query.filter.return_value = query
    query.first.return_value = None

    with pytest.raises(HTTPException) as error:
        employee_response(db, employee)

    assert error.value.status_code == 409
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in query.filter.call_args_list for value in call.args)
    assert "parties.id = 12" in predicates
    assert "parties.organization_id = 7" in predicates
    assert "parties.organization_id IS NULL" in predicates  # legacy linked Parties


@pytest.mark.parametrize("render, party_attribute", [
    (agency_out, "party"), (associate_out, "party"), (arn_out, "holder_party"),
])
def test_external_organization_response_rejects_foreign_party(render, party_attribute):
    row = SimpleNamespace(organization_id=7, **{
        party_attribute: SimpleNamespace(organization_id=8, deleted_at=None)})
    with pytest.raises(HTTPException) as error:
        render(row)
    assert error.value.status_code == 409
