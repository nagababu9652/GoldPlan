"""HTTP checks for publication-gated client downloads."""
from datetime import date, datetime
from types import SimpleNamespace
from unittest.mock import Mock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import client_portal
from app.services import access


def client_context(*, permissions=("PORTAL.DOCUMENT.READ", "PORTAL.REPORT.READ"), customer_id=10):
    return access.AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type="CLIENT",
        customer_id=customer_id, roles=frozenset({"CLIENT"}),
        permissions=frozenset(permissions), denied_permissions=frozenset(),
        subscription_status="ACTIVE", subscription_active=True,
    )


def http_client(context, db):
    app = FastAPI()
    app.include_router(client_portal.router)
    app.dependency_overrides[access.get_access_context] = lambda: context
    app.dependency_overrides[get_db] = lambda: db
    return TestClient(app)


def query_returning(row):
    query = Mock()
    query.filter.return_value = query
    query.first.return_value = row
    return query


def predicates(query):
    return " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                    for call in query.filter.call_args_list for value in call.args)


def test_document_download_requires_permission_before_querying_database():
    db = Mock()
    response = http_client(client_context(permissions=()), db).get(
        "/client-portal/documents/5/download")
    assert response.status_code == 403
    db.query.assert_not_called()


def test_document_download_rejects_revoked_publication():
    db = Mock()
    db.query.return_value = query_returning(None)
    response = http_client(client_context(), db).get(
        "/client-portal/documents/5/download")
    assert response.status_code == 404
    db.query.assert_called_once()


def test_document_download_rechecks_customer_and_serves_private_file(tmp_path, monkeypatch):
    monkeypatch.setattr(client_portal, "DOCUMENT_ROOT", tmp_path)
    (tmp_path / "private.pdf").write_bytes(b"private customer document")
    document = SimpleNamespace(id=5, file_url="/uploads/documents/private.pdf",
                               file_type="application/pdf", file_name="statement.pdf",
                               document_name="Statement")
    db = Mock()
    publication_query = query_returning(SimpleNamespace(id=1))
    document_query = query_returning(document)
    db.query.side_effect = [publication_query, document_query]
    response = http_client(client_context(), db).get(
        "/client-portal/documents/5/download")
    assert response.status_code == 200
    assert response.content == b"private customer document"
    assert "attachment" in response.headers["content-disposition"]
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert "portal_publications.organization_id = 7" in predicates(publication_query)
    assert "portal_publications.customer_id = 10" in predicates(publication_query)
    assert "portal_publications.revoked_at IS NULL" in predicates(publication_query)
    assert "documents.organization_id = 7" in predicates(document_query)
    assert "documents.customer_id = 10" in predicates(document_query)

    foreign = Mock()
    foreign.query.side_effect = [query_returning(SimpleNamespace(id=1)), query_returning(None)]
    denied = http_client(client_context(customer_id=11), foreign).get(
        "/client-portal/documents/5/download")
    assert denied.status_code == 404


def test_report_download_uses_published_snapshot_only():
    snapshot = SimpleNamespace(
        id=8, title="Saved plan", report_date=date(2026, 9, 30),
        period_start=date(2026, 1, 1), period_end=date(2026, 9, 30),
        created_at=datetime(2026, 9, 30), report_type="FINANCIAL_SNAPSHOT",
        assumptions={"currency": "INR"},
        payload={"financial_summary": {"clients": [
            {"customer_id": 10, "net_worth": 100},
            {"customer_id": 11, "net_worth": 900},
        ]}},
    )
    db = Mock()
    publication_query = query_returning(SimpleNamespace(id=1))
    snapshot_query = query_returning(snapshot)
    db.query.side_effect = [publication_query, snapshot_query]
    response = http_client(client_context(), db).get(
        "/client-portal/reports/8/download")
    assert response.status_code == 200
    assert "Net Worth,100" in response.text
    assert "900" not in response.text
    assert "Currency,INR" in response.text
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert "portal_publications.customer_id = 10" in predicates(publication_query)
    assert "report_snapshots.organization_id = 7" in predicates(snapshot_query)

    revoked = Mock()
    revoked.query.return_value = query_returning(None)
    denied = http_client(client_context(), revoked).get(
        "/client-portal/reports/8/download")
    assert denied.status_code == 404
    revoked.query.assert_called_once()
