"""Validated, non-secret organization configuration sections."""
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, EmailStr, model_validator


class ConfigSection(str, Enum):
    COMMON = "COMMON"
    PRE_SALES = "PRE_SALES"
    DOMAIN_RELATED = "DOMAIN_RELATED"


class StrictConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")


class CommonConfiguration(StrictConfig):
    """Organization contact and report identity used in empanelment material."""

    empanelment_contact_name: str = Field(min_length=1, max_length=150)
    empanelment_email: EmailStr
    empanelment_phone: str = Field(min_length=5, max_length=30)
    empanelment_address: str = Field(min_length=1, max_length=500)
    report_title: str = Field(min_length=1, max_length=200)
    report_subtitle: str | None = Field(default=None, max_length=200)
    report_address_line1: str | None = Field(default=None, max_length=200)
    report_address_line2: str | None = Field(default=None, max_length=200)
    report_mobile: str | None = Field(default=None, max_length=30)
    report_landline: str | None = Field(default=None, max_length=30)
    report_email: EmailStr | None = None
    report_website: HttpUrl | None = None
    letterhead_style: Literal["FULL", "CENTER", "RIGHT", "NONE"] = "FULL"
    email_sender_name: str | None = Field(default=None, max_length=150)
    email_sender_address: EmailStr | None = None
    email_footer: str | None = Field(default=None, max_length=2000)
    default_country: str = Field(default="India", min_length=1, max_length=100)
    default_state: str | None = Field(default=None, max_length=100)
    default_city: str | None = Field(default=None, max_length=100)
    birthday_lookahead_days: int = Field(default=1, ge=0, le=365)
    anniversary_lookahead_days: int = Field(default=1, ge=0, le=365)


RiskCode = Literal["CONSERVATIVE", "MODERATE", "AGGRESSIVE", "VERY_AGGRESSIVE"]
RISK_CODES = ("CONSERVATIVE", "MODERATE", "AGGRESSIVE", "VERY_AGGRESSIVE")


class RiskProfileParameter(StrictConfig):
    risk_code: RiskCode
    equity_allocation_pct: Decimal = Field(ge=0, le=100, decimal_places=2)
    debt_allocation_pct: Decimal = Field(ge=0, le=100, decimal_places=2)
    expected_equity_return_pct: Decimal = Field(ge=0, le=100, decimal_places=2)
    expected_debt_return_pct: Decimal = Field(ge=0, le=100, decimal_places=2)

    @model_validator(mode="after")
    def allocation_totals_100(self):
        if self.equity_allocation_pct + self.debt_allocation_pct != 100:
            raise ValueError("Equity and debt allocation must total 100%")
        return self


class PreSalesConfiguration(StrictConfig):
    default_inflation_rate_pct: Decimal = Field(ge=0, le=100, decimal_places=2)
    section_80c_limit: Decimal = Field(ge=0, decimal_places=2)
    income_tax_assumption_pct: Decimal = Field(ge=0, le=100, decimal_places=2)
    investment_frequency: Literal["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"] = "MONTHLY"
    recommended_equity_fund: str | None = Field(default=None, max_length=200)
    recommended_debt_fund: str | None = Field(default=None, max_length=200)
    default_insurer: str | None = Field(default=None, max_length=200)
    term_insurance_product: str | None = Field(default=None, max_length=200)
    allow_advisor_override: bool = False
    risk_profiles: list[RiskProfileParameter] = Field(min_length=4, max_length=4)

    @model_validator(mode="after")
    def all_profiles_present(self):
        if {row.risk_code for row in self.risk_profiles} != set(RISK_CODES):
            raise ValueError("Configure each of the four risk profiles exactly once")
        return self


class DomainRelatedConfiguration(StrictConfig):
    """Safe domain policies; RTA credentials live in the future integration module."""

    cost_basis_method: Literal["WEIGHTED_AVERAGE", "FIFO"] = "WEIGHTED_AVERAGE"
    fund_visibility: Literal["ALL", "DIRECT", "REGULAR"] = "ALL"
    default_ranking_basis: Literal["INCEPTION", "ONE_YEAR", "THREE_YEAR", "FIVE_YEAR"] = "INCEPTION"
    crm_report_tolerance: Decimal = Field(default=Decimal("0"), ge=0, decimal_places=3)
    mask_pan_internal: bool = True
    mask_folio_internal: bool = True
    mask_folio_client_portal: bool = True
    show_indices: bool = False
    show_sub_one_year_returns: bool = False
    show_negative_xirr_cagr: bool = False
    xirr_min_holding_days: int = Field(default=365, ge=0, le=36500)
    sip_summary_source: Literal["SIP_MASTER", "LAST_MONTH_TRANSACTIONS"] = "SIP_MASTER"
    show_stp_in_recent_widgets: bool = False
    show_gst_breakup_in_brokerage_analysis: bool = False
    calculate_lt_capital_gain_exemption: bool = False
    include_switches_in_absolute_return: bool = False
    show_surrender_value_in_mobile_app: bool = False
    active_sip_report_from_last_month: bool = False
    include_fully_redeemed_units_in_gain_loss: bool = False
    export_capital_gains_in_finsys_format: bool = False
    monthly_ecas_request_limit: int = Field(default=30, ge=0, le=1000)
    auto_import_enabled: bool = False
    forwarding_email_addresses: list[EmailStr] = Field(default_factory=list, max_length=20)
    cams_arn_number: str | None = Field(default=None, max_length=50)
    cams_subscription_expires_on: date | None = None
    cams_registered_email: EmailStr | None = None
    cams_provider_user_id: str | None = Field(default=None, max_length=150)
    cams_is_corporate: bool = False
    kfin_arn_number: str | None = Field(default=None, max_length=50)
    kfin_subscription_expires_on: date | None = None
    kfin_registered_email: EmailStr | None = None
    kfin_provider_user_id: str | None = Field(default=None, max_length=150)
    kfin_is_corporate: bool = False
    cams_360_user_id: str | None = Field(default=None, max_length=150)
    auto_create_customers_from_rta: bool = False
    self_reconcile_aum: bool = False
    update_folio_bank_details_from_rta: bool = False
    update_nominee_details_from_rta: bool = False
    auto_map_subbroker: bool = False
    import_closed_ended_transfer_in_out: bool = False
    import_segregated_schemes: bool = False
    show_active_sip: bool = False
    show_sip_summary: bool = False
    show_subbroker_name_code: bool = False
    active_folio_only: bool = False
    inward_transaction_type_codes: list[str] = Field(default_factory=list, max_length=30)
    outward_transaction_type_codes: list[str] = Field(default_factory=list, max_length=30)
    default_life_insurer: str | None = Field(default=None, max_length=200)
    overwrite_address_from_life_provider: bool = False
    default_general_insurer: str | None = Field(default=None, max_length=200)
    renewal_basis: Literal["RENEWAL_DATE", "EXPIRY_DATE"] = "RENEWAL_DATE"
    default_fixed_term_investment_type: str | None = Field(default=None, max_length=100)


CONFIG_SCHEMAS = {
    ConfigSection.COMMON: CommonConfiguration,
    ConfigSection.PRE_SALES: PreSalesConfiguration,
    ConfigSection.DOMAIN_RELATED: DomainRelatedConfiguration,
}


class ConfigurationSave(StrictConfig):
    expected_version: int = Field(ge=0)
    values: dict


class ConfigurationVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    section: ConfigSection
    version: int
    values: dict
    created_by: int
    created_at: datetime
