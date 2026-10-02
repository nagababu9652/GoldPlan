"""Application settings are validated, versioned, and Head-only."""
from types import SimpleNamespace as Record
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.database.session import get_db
from app.routers import admin_configuration, clients
from app.schemas.application_configuration import (
    CommonConfiguration, ConfigSection, ConfigurationSave,
    DomainRelatedConfiguration, PreSalesConfiguration,
)
from app.services import access


def risk_profiles():
    return [
        {"risk_code": code, "equity_allocation_pct": equity,
         "debt_allocation_pct": 100 - equity,
         "expected_equity_return_pct": 12, "expected_debt_return_pct": 7}
        for code, equity in (("CONSERVATIVE", 20), ("MODERATE", 40),
                             ("AGGRESSIVE", 70), ("VERY_AGGRESSIVE", 90))
    ]


def context(*, actor="HEAD", permissions=("ORG.CONFIG.READ", "ORG.CONFIG.UPDATE")):
    return access.AccessContext(
        user_id=4, party_id=2, organization_id=7, actor_type=actor,
        employee_id=3 if actor != "CLIENT" else None,
        roles=frozenset({"ORG_ADMIN"} if actor == "HEAD" else {"EMPLOYEE"}),
        permissions=frozenset(permissions), denied_permissions=frozenset(),
        subscription_status="ACTIVE", subscription_active=True,
    )


def test_risk_parameters_require_four_distinct_profiles_and_complete_allocations():
    values = {"default_inflation_rate_pct": 6, "section_80c_limit": 150000,
              "income_tax_assumption_pct": 30, "risk_profiles": risk_profiles()}
    assert len(PreSalesConfiguration.model_validate(values).risk_profiles) == 4
    with pytest.raises(ValidationError):
        PreSalesConfiguration.model_validate({**values, "risk_profiles": risk_profiles()[:3]})
    wrong = risk_profiles()
    wrong[0]["debt_allocation_pct"] = 70
    with pytest.raises(ValidationError):
        PreSalesConfiguration.model_validate({**values, "risk_profiles": wrong})


def test_secret_like_fields_are_rejected_in_common_and_domain_settings():
    common = {"empanelment_contact_name": "Contact", "empanelment_email": "contact@example.com",
              "empanelment_phone": "1234567890", "empanelment_address": "Office",
              "report_title": "FinPlan"}
    assert CommonConfiguration.model_validate(common).report_title == "FinPlan"
    with pytest.raises(ValidationError):
        CommonConfiguration.model_validate({**common, "portal_password": "secret"})
    with pytest.raises(ValidationError):
        DomainRelatedConfiguration.model_validate({"archive_password": "secret"})
    with pytest.raises(ValidationError):
        DomainRelatedConfiguration.model_validate({"show_customer_login_password": True})


def test_domain_pdf_settings_are_validated_and_versionable():
    configuration = DomainRelatedConfiguration.model_validate({
        "cost_basis_method": "FIFO",
        "show_stp_in_recent_widgets": True,
        "show_gst_breakup_in_brokerage_analysis": True,
        "calculate_lt_capital_gain_exemption": True,
        "include_switches_in_absolute_return": True,
        "include_fully_redeemed_units_in_gain_loss": True,
        "monthly_ecas_request_limit": 30,
        "auto_import_enabled": True,
        "forwarding_email_addresses": ["ops@example.com"],
        "cams_arn_number": "ARN-123",
        "cams_subscription_expires_on": "2027-01-29",
        "cams_registered_email": "cams@example.com",
        "cams_provider_user_id": "CAMS-ID",
        "kfin_provider_user_id": "KFIN-ID",
        "cams_360_user_id": "CAMS-360-ID",
        "overwrite_address_from_life_provider": False,
    })
    assert configuration.cams_subscription_expires_on.year == 2027
    assert configuration.forwarding_email_addresses[0] == "ops@example.com"
    assert configuration.model_dump(mode="json")["cost_basis_method"] == "FIFO"
    with pytest.raises(ValidationError):
        DomainRelatedConfiguration.model_validate({"monthly_ecas_request_limit": -1})
    with pytest.raises(ValidationError):
        DomainRelatedConfiguration.model_validate({"forwarding_email_addresses": ["not-an-email"]})


def test_read_requires_head_and_live_permission():
    for actor_context in (context(actor="EMPLOYEE"), context(permissions=())):
        db = Mock()
        app = FastAPI()
        app.include_router(admin_configuration.router)
        app.dependency_overrides[access.get_access_context] = lambda: actor_context
        app.dependency_overrides[get_db] = lambda: db
        response = TestClient(app).get("/admin/configuration/COMMON")
        assert response.status_code == 403
        db.query.assert_not_called()


def test_latest_read_filters_by_organization_and_section():
    db = Mock()
    query = db.query.return_value
    query.filter.return_value = query
    query.order_by.return_value = query
    query.first.return_value = Record(version=2)
    assert admin_configuration.latest(db, 7, ConfigSection.PRE_SALES).version == 2
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for value in query.filter.call_args.args)
    assert "organization_id = 7" in predicates
    assert "section = 'PRE_SALES'" in predicates


def test_stale_update_is_rejected_before_writing(monkeypatch):
    db = Mock()
    org_query = db.query.return_value
    org_query.filter.return_value = org_query
    org_query.with_for_update.return_value = org_query
    org_query.first.return_value = Record(id=7)
    monkeypatch.setattr(admin_configuration, "latest", lambda *args: Record(version=2))
    with pytest.raises(HTTPException) as error:
        admin_configuration.save_configuration(
            ConfigSection.DOMAIN_RELATED, ConfigurationSave(expected_version=1, values={}),
            context(), db,
        )
    assert error.value.status_code == 409
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_save_creates_new_version_and_audit_record(monkeypatch):
    db = Mock()
    org_query = db.query.return_value
    org_query.filter.return_value = org_query
    org_query.with_for_update.return_value = org_query
    org_query.first.return_value = Record(id=7)
    monkeypatch.setattr(admin_configuration, "latest", lambda *args: None)
    payload = ConfigurationSave(expected_version=0, values={})
    row = admin_configuration.save_configuration(ConfigSection.DOMAIN_RELATED, payload, context(), db)
    assert row.version == 1 and row.organization_id == 7
    assert row.values["auto_create_customers_from_rta"] is False
    assert db.add.call_count == 2
    assert db.add.call_args.args[0].module_name == "APPLICATION_CONFIGURATION"
    db.commit.assert_called_once()


def test_client_risk_parameters_use_only_accessible_client_and_current_org(monkeypatch):
    db = Mock()
    advisor = context(actor="EMPLOYEE", permissions=("CLIENT.READ",))
    monkeypatch.setattr(clients, "get_assigned_customer", lambda *args: (Record(id=3), Record(risk_profile="MODERATE")))
    query = db.query.return_value
    query.filter.return_value = query
    query.order_by.return_value = query
    query.first.return_value = Record(version=3, values={"risk_profiles": risk_profiles()})
    response = clients.get_client_risk_parameters(12, advisor, db)
    assert response["configuration_version"] == 3
    assert response["parameters"]["equity_allocation_pct"] == 40
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for value in query.filter.call_args.args)
    assert "organization_id = 7" in predicates
    assert "section = 'PRE_SALES'" in predicates


def test_client_risk_parameters_do_not_lookup_config_when_client_is_inaccessible(monkeypatch):
    db = Mock()
    def denied(*args):
        raise HTTPException(404, "Client not found")
    monkeypatch.setattr(clients, "get_assigned_customer", denied)
    with pytest.raises(HTTPException) as error:
        clients.get_client_risk_parameters(12, context(actor="EMPLOYEE"), db)
    assert error.value.status_code == 404
    db.query.assert_not_called()
