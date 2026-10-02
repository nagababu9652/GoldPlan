from unittest.mock import Mock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers.admin_external import router
from app.services import access


def context(*, actor="HEAD", permissions=("ORG.AGENCY.READ",), denied=()):
    return access.AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type=actor,
        employee_id=3 if actor != "CLIENT" else None,
        roles=frozenset({"ORG_ADMIN"} if actor == "HEAD" else {"EMPLOYEE"}),
        permissions=frozenset(permissions), denied_permissions=frozenset(denied),
        subscription_status="ACTIVE", subscription_active=True,
    )


def client_for(actor_context, db):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[access.get_access_context] = lambda: actor_context
    app.dependency_overrides[get_db] = lambda: db
    return TestClient(app)


def test_agency_read_requires_head_and_live_permission():
    db = Mock()
    for actor_context in (
        context(actor="EMPLOYEE"),
        context(permissions=()),
        context(denied=("ORG.AGENCY.READ",)),
    ):
        response = client_for(actor_context, db).get("/admin/organization/agencies")
        assert response.status_code == 403
    db.query.assert_not_called()


def test_agency_read_is_scoped_to_the_current_organization():
    db = Mock(); query = db.query.return_value
    query.filter.return_value = query
    query.order_by.return_value = query
    query.all.return_value = []

    response = client_for(context(), db).get("/admin/organization/agencies")

    assert response.status_code == 200
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in query.filter.call_args_list for value in call.args)
    assert "agencies.organization_id = 7" in predicates


def test_arn_document_read_hides_foreign_parent():
    db = Mock(); query = db.query.return_value
    query.filter.return_value = query
    query.first.return_value = None

    response = client_for(context(permissions=("ORG.ARN.READ",)), db).get(
        "/admin/organization/arn-holders/9/documents")

    assert response.status_code == 404
    db.query.assert_called_once()
