from types import SimpleNamespace
from unittest.mock import Mock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers.advisor import document
from app.services import access


def context(*, actor="EMPLOYEE", permissions=("DOCUMENT.READ",)):
    return access.AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type=actor,
        employee_id=3 if actor != "CLIENT" else None,
        customer_id=10 if actor == "CLIENT" else None,
        roles=frozenset({"EMPLOYEE"} if actor == "EMPLOYEE" else {actor}),
        permissions=frozenset(permissions), denied_permissions=frozenset(),
        customer_ids=frozenset({10}),
    )


def http_client(actor_context, db):
    app = FastAPI()
    app.include_router(document.router)
    app.dependency_overrides[access.get_access_context] = lambda: actor_context
    app.dependency_overrides[get_db] = lambda: db
    return TestClient(app)


def query_returning(row):
    query = Mock()
    query.filter.return_value = query
    query.first.return_value = row
    return query


def test_document_download_rejects_missing_permission_and_client_persona():
    for actor_context in (context(permissions=()), context(actor="CLIENT")):
        db = Mock()
        response = http_client(actor_context, db).get("/documents/5/download")
        assert response.status_code == 403
        db.query.assert_not_called()


def test_document_download_requires_live_employee_and_customer_assignment(tmp_path, monkeypatch):
    monkeypatch.setattr(document, "UPLOAD_ROOT", tmp_path)
    (tmp_path / "private.pdf").write_bytes(b"assigned client document")
    employee_query = query_returning(SimpleNamespace(id=3, organization_id=7))
    document_query = query_returning(SimpleNamespace(id=5, organization_id=7,
        customer_id=10, customer_group_id=None, file_url="/uploads/documents/private.pdf",
        file_type="application/pdf", file_name="private.pdf", document_name="Private"))
    customer_query = query_returning(SimpleNamespace(id=10, group_members=[]))
    assignment_query = query_returning(None)
    db = Mock()
    db.query.side_effect = [employee_query, document_query, customer_query, assignment_query]

    denied = http_client(context(), db).get("/documents/5/download")
    assert denied.status_code == 404
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in employee_query.filter.call_args_list for value in call.args)
    assert "employees.id = 3" in predicates
    assert "employees.organization_id = 7" in predicates

    db2 = Mock()
    db2.query.side_effect = [query_returning(SimpleNamespace(id=3, organization_id=7)),
        query_returning(SimpleNamespace(id=5, organization_id=7,
            customer_id=10, customer_group_id=None, file_url="/uploads/documents/private.pdf",
            file_type="application/pdf", file_name="private.pdf", document_name="Private")),
        query_returning(SimpleNamespace(id=10, group_members=[])),
        query_returning(SimpleNamespace(id=1))]
    allowed = http_client(context(), db2).get("/documents/5/download")
    assert allowed.status_code == 200
    assert allowed.content == b"assigned client document"
    assert allowed.headers["cache-control"] == "no-store"


def test_document_routes_declare_document_permissions():
    expected = {"GET": "DOCUMENT.READ", "POST": "DOCUMENT.UPLOAD",
                "PUT": "DOCUMENT.UPLOAD"}
    for route in document.router.routes:
        deps = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in deps
        assert "require_permission.<locals>.dependency" in deps
        permission = next(dep.call for dep in route.dependant.dependencies
                          if dep.call.__qualname__ == "require_permission.<locals>.dependency")
        code = permission.__closure__[0].cell_contents
        assert code == ("DOCUMENT.UPLOAD" if "/archive" in route.path
                        else expected[next(iter(route.methods))])
