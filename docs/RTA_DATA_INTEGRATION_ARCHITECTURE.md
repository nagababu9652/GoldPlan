# FINPLAN — RTA DATA INTEGRATION & APPLICATION CONFIGURATION ARCHITECTURE

**Document:** `RTA_DATA_INTEGRATION_ARCHITECTURE.md`  
**Scope:** CAMS and KFintech (formerly Karvy) mutual-fund data acquisition, report scheduling, secure credential management, encrypted file ingestion, DBF/CSV/Text/Excel processing, canonical FinPlan mapping, reconciliation, Admin Application Configuration, audit, monitoring, and implementation plan.

> **Important security note:** Portal passwords, mailback archive passwords, OTPs, security-question answers and similar secrets must never be stored in normal configuration JSON, logs, source code, screenshots, audit payloads, or ordinary database columns. Use a secret vault or envelope-encrypted secret store. The uploaded reference screenshots contain credential/security-answer material and must be treated as sensitive.

---

# 1. Correct Scope

CAMS and KFintech are major Registrar and Transfer Agents (RTAs) for Indian mutual funds. Their distributor mailback/subscription feeds should be treated as authoritative source feeds for the mutual-fund folios, transactions and servicing data for the AMCs they service.

They are **not** the source of truth for the entire Indian financial ecosystem. FinPlan must therefore use a provider-adapter architecture so additional sources can be added later, for example:

- other mutual-fund/RTA sources when required;
- AMFI/NAV sources;
- exchanges;
- depositories;
- insurance providers;
- banks;
- account aggregators;
- PMS/AIF providers;
- manual/verified financial-account sources.

The first implementation scope should be **CAMS + KFintech mutual-fund data**.

---

# 2. What the Uploaded Sample Shows

The uploaded sample archive contains one encrypted file:

```text
30092026052601_148482153R9.dbf
```

The `R9` suffix is consistent with a CAMS WBR9-style investor/static-data file.

The archive is encrypted. CAMS documentation states that distributor mailback reports are AES-256 encrypted and password protected.

The implementation must therefore support:

```text
Encrypted ZIP
    ↓
Safe extraction
    ↓
DBF
    ↓
Report detection
    ↓
Schema validation
    ↓
Staging
    ↓
Canonical import
```

Do not assume the portal login password and the file-extraction password are the same secret. They must be configured independently.

---

# 3. Key Research Findings

## CAMS

CAMS Distributor Mailback Services provides a large catalog of web-based reports. CAMS documents DBF/Excel output availability and password-protected encrypted mailback delivery.

Important CAMS report families for FinPlan include:

```text
WBR1 / WBR8   NAV data
WBR2          Transaction / upfront brokerage feed
WBR4          Investor details
WBR9          Investor static details / balances
WBR21         AUM by scheme
WBR22         AUM by investor by scheme
WBR46         Unprocessed/rejected transactions
WBR49         SIP/STP procured
WBR50         Unoperational SIP/STP
WBR76         Brokerage payout summary by folio
WBR77         Consolidated mailback
WBR89         PAN/Aadhaar seeding-pending style report
```

CAMS specifically identifies WBR9 as an investor static-details feed. It contains folio/investor identity and investment information such as PAN, holding nature, product, units/balance and other static fields.

CAMS also recommends using WBR2 together with WBR46 for transaction reconciliation.

## KFintech

The current KFintech Distributor Services Manual documents both:

```text
Subscription Reports
Mail Back Services
Reports Console
```

Subscription reports are designed to be delivered periodically to the distributor's registered email address, which is preferable to repeatedly automating a browser login.

Important KFintech subscription reports include:

```text
MFSD301   Daily NAV
MFSD307   Transaction Report
MFSD308   NAV Report
MFSD309   Dividend & Bonus
MFSD310   Client Wise AUM
MFSD311   Investor Master Information
MFSD312   Transaction Wise Investor Master
MFSD313   SIP Registration
MFSD314   SIP Registration Rejection
MFSD315   Purchase Rejection
MFSD316   Pre-Process Rejection
MFSD327   SIP Expiry
MFSD331   SIP Termination
MFSD339   KYC
MFSD345   Redemption Payout
MFSD347   EUIN Remediation
MFSD347A  OTBM
MFSD348   Returned Undelivered
MFSD352   Non-commercial Transactions
```

Important KFintech on-demand/historical Mail Back reports include:

```text
MFSD201   Transaction Report
MFSD203   Client Wise AUM
MFSD211   Investor Master
MFSD218   Rejections
MFSD221   Transaction Wise Investor Master
MFSD223   Account Wise Transaction + Investor Master
MFSD224   Account Wise Investor Master
MFSD230   SIP/STP Report
MFSD239   KYC Report
MFSD240   Investor KYC Report
MFSD246   Folio Wise Transaction Report
MFSD247   Special Reports
MFSD263   Registered Bank Account Details
```

Brokerage/business reports include:

```text
MFSD205
MFSD206
MFSD207
MFSD208
MFSD222
MFSD238
MFSD249
MFSD250
MFSD260
```

The KFintech report console retains recent requested reports for only a limited recent period, so FinPlan must keep its own immutable raw-file archive.

---

# 4. Primary Design Decision — Do Not Build Daily Screen Scraping

FinPlan should **not** make daily operation depend on logging into CAMS/KFintech websites with username/password and clicking report forms.

Reasons:

1. Both providers already have native mailback/subscription mechanisms.
2. KFintech's distributor login includes CAPTCHA, making unattended browser automation brittle.
3. Portal HTML, navigation, CAPTCHA/MFA and authentication flows can change.
4. Storing high-value portal credentials increases risk.
5. Subscription/mailback delivery is the provider-supported recurring-data path.

Recommended order of preference:

```text
1. Official API/SFTP/direct feed if contractually available
2. Provider-native subscription/mailback delivery
3. Connected mailbox ingestion
4. Manual historical/on-demand request
5. Human-assisted browser workflow when required
6. Unattended browser automation only when explicitly permitted and technically stable
```

FinPlan should support portal credentials because they may be required for setup, historical requests and operational recovery, but they should not be the normal daily ingestion mechanism.

---

# 5. Multi-Tenant Principle

Each FinPlan organization owns its own RTA configuration.

```text
Organization
   │
   ├── CAMS Connection
   │      ├── ARN
   │      ├── registered email
   │      ├── optional portal credential secret
   │      ├── archive passwords
   │      └── report subscriptions
   │
   └── KFintech Connection
          ├── ARN
          ├── user id / registered email
          ├── portal credential secret
          ├── archive passwords
          └── report subscriptions
```

Every integration record must contain `organization_id`.

No import file may be attached to an organization solely because its filename looks similar. Tenant identification should come from a trusted mailbox/recipient mapping plus configured source connection and ARN/report metadata.

---

# 6. Admin Navigation

Add a new Admin area:

```text
Admin
│
├── Organization Setup
│
├── Application Configuration
│   ├── Common
│   ├── Pre-Sales / Goal Planning
│   └── Domain Related
│
└── Data Integrations
    └── Mutual Fund RTAs
        ├── CAMS
        ├── KFintech
        ├── Report Subscriptions
        ├── Import History
        ├── Quarantine
        ├── Reconciliation
        └── Integration Health
```

Do **not** place RTA passwords directly inside the Domain Related form.

The settings page may show secret status such as:

```text
Portal password             Configured ••••••••   [Replace]
Mailback extraction secret  3 active passwords    [Manage]
Last verified               02-Oct-2026 08:12
```

but must never return the plaintext secret after save.

---

# 7. Application Configuration — Common

**Implemented for FinPlan:** `Admin → Application Configuration → Common &
Empanelment` stores organization contact, report identity, sender, location, and
reminder details as immutable organization-scoped versions. The reference's
third-party support-access switch, client-login activation, logos, and delivery
provider credentials are not part of this form; those need their own guarded
workflows or storage.

The uploaded Common configuration reference contains concepts for:

```text
Post-save behavior
Address defaults
Birthday reminder window
Anniversary reminder window
PDF password protection
Implementation/support access
Investor login URL
Auto client-login activation
Report header
Report title/sub-title
Address lines
Phone/email/website
Letterhead style
Brand logo
Investor-login logo
Email service
Sender name
Sender email
BCC behavior
Email footer/signature
SMS sender ID
SMS brand name
Scheduling CC/BCC behavior
Document management settings
Client document-delete behavior
```

## Recommended FinPlan structure

### General

```text
post_save_behavior
default_country_id
default_state_id
default_city_id
default_phone_area_code
birthday_lookahead_days
anniversary_lookahead_days
```

### Client Portal

```text
client_portal_base_url
auto_activate_client_login
```

### PDF / Report Security

```text
pdf_password_protection_default
report_mask_pan_default
report_mask_folio_default
```

### Branding

```text
report_title
report_subtitle
report_address_line1
report_address_line2
report_mobile
report_landline
report_email
report_website
letterhead_style
report_logo_asset_id
portal_logo_asset_id
```

### Email

```text
email_provider
sender_name
sender_email
enable_bcc
email_footer_html
```

### SMS

```text
sms_sender_id
sms_brand_name
```

### Scheduling

```text
investor_cc_enabled
advisor_bcc_enabled
```

### Documents

```text
external_drive_enabled
allow_client_document_delete
```

### Support Access

Do not model support/implementation access as a permanent Boolean only.

Use:

```text
support_access_grant
- organization_id
- granted_by
- reason
- valid_from
- expires_at
- revoked_at
- audit trail
```

---

# 8. Application Configuration — Pre-Sales / Goal Planning

**Implemented for FinPlan:** `Admin → Application Configuration → Pre-Sales &
Risk` stores the planning fields below and all four validated risk-profile
parameter rows. An advisor with client access can see the current organization
parameters that match that client's saved risk code. Existing goal/report
calculations are not rewritten when a configuration version changes.

The uploaded reference includes:

```text
Default Inflation Rate
Section 80C Limit
Income Tax Slab assumption
Investment Frequency
Recommended Equity Fund
Recommended Debt Fund
Default Insurer
Term Insurance Product
Risk Profile Parameters
```

Risk profile parameters shown in the reference include:

```text
Conservative
Moderate
Aggressive
Very Aggressive
```

with editable:

```text
Equity Allocation %
Debt Allocation %
Average Equity Return %
Average Debt Return %
```

These must be organization-configurable and versioned.

## Tables

### `planning_assumption_sets`

```text
id
organization_id
name
effective_from
effective_to
default_inflation_rate
section_80c_limit
income_tax_assumption
investment_frequency
recommended_equity_fund_id nullable
recommended_debt_fund_id nullable
default_insurer_id nullable
term_insurance_product_id nullable
allow_advisor_override
status
created_by
created_at
updated_at
```

### `risk_profile_parameter_sets`

```text
id
organization_id
name
effective_from
effective_to
status
created_by
created_at
```

### `risk_profile_parameters`

```text
id
parameter_set_id
risk_code
risk_name
display_order
equity_allocation_pct
debt_allocation_pct
expected_equity_return_pct
expected_debt_return_pct
```

Validation:

```text
equity_allocation_pct + debt_allocation_pct = 100
percentages between 0 and 100
effective ranges cannot overlap for active sets unless intentionally versioned
```

## Critical Goal-Planning Rule

When a financial goal/plan is created, snapshot the assumptions used into the goal/plan calculation record.

Do not recalculate old advice automatically merely because Admin changes next year's default inflation or expected-return assumptions.

---

# 9. Application Configuration — Domain Related

**Implemented for FinPlan:** `Admin → Application Configuration → Domain Related`
stores 52 versioned, validated non-secret settings drawn from the Domain Related
reference PDF. They cover mutual-fund display and calculation preferences,
reports and tax options, eCAS limits, data-import rules, provider identifiers,
and insurance defaults. Settings are stored configuration; each importer,
report, and client UI must explicitly read and apply its relevant setting.
The current transaction engine still calculates cost basis by weighted average:
selecting FIFO records a preference but does not change historical or current
calculations until lot accounting is implemented.

The PDF's CAMS/KFintech archive and portal passwords, CAMS 360 password and
security answers are deliberately excluded from versioned configuration JSON.
They require a dedicated encrypted connection workflow with controlled access,
redacted audit, rotation, and provider-specific validation. The PDF's password
visibility options are replaced by FinPlan's always-hidden password policy;
its bulk ETF transaction-deletion control is not offered as a configuration
toggle. This means the PDF is represented as far as ordinary configuration can
safely go, but operational provider setup is **not yet complete**.

The uploaded Domain Related reference includes a broad group of mutual-fund and data-import settings.

Recommended sections:

## Mutual Fund Calculation

```text
cost_basis_method            # FIFO, average, etc.
fund_visibility              # ALL / DIRECT / REGULAR
default_ranking_basis
crm_report_tolerance
show_indices
show_sub_one_year_returns
show_negative_xirr_cagr
xirr_min_holding_days
sip_summary_source
```

## Privacy / Display

```text
mask_pan_internal
mask_folio_internal
mask_folio_client_portal
show_customer_login_password  # should remain false/not supported in FinPlan
```

FinPlan should never support displaying a user's actual password.

## Data Import

```text
auto_create_customers_from_rta
self_reconcile_aum
update_folio_bank_details_from_rta
update_nominee_details_from_rta
auto_map_subbroker
import_closed_ended_transfer_in_out
import_segregated_schemes
```

## Client Portal / CRM

```text
show_active_sip
show_sip_summary
show_subbroker_name_code
active_folio_only
```

## Transaction Classification

```text
inward_transaction_type_codes
outward_transaction_type_codes
```

## Insurance Defaults

```text
default_life_insurer_id
overwrite_address_from_external_life_source
default_general_insurer_id
renewal_basis
```

## Other Investments

```text
default_fixed_term_investment_type
```

## RTA Auto Import

The reference also contains:

```text
Auto Import
Forwarding email addresses
CAMS/Karvy extraction passwords
Data subscription expiry
Mailback login details
ARN
CAMS/Karvy identifiers
Corporate indicator
CAMS 360 login/security information
```

The non-secret auto-import, forwarding-address, subscription-expiry, ARN,
provider-ID and corporate-account fields are now available in Domain Related.
The passwords and security answers must be managed in the dedicated secure
integration layer described below. Provider metadata can move into
`integration.rta_connections` when that module is built; existing organization
configuration versions must be migrated or read during that transition.

---

# 10. Secure RTA Connection Model

Create an `integration` PostgreSQL schema.

## `integration.rta_connections`

```text
id
organization_id
provider                 # CAMS / KFINTECH
connection_name
arn_number
registered_email
provider_user_id nullable
corporate_flag nullable
subscription_expires_on nullable
status                   # DRAFT / ACTIVE / EXPIRED / DISABLED / ERROR
portal_secret_ref nullable
mailbox_connection_id nullable
last_verified_at nullable
last_successful_file_at nullable
created_by
created_at
updated_at
```

Never store the portal password in this table.

## `integration.rta_archive_passwords`

This table stores only references to secrets.

```text
id
organization_id
rta_connection_id
report_code nullable
secret_ref
label
priority
valid_from
valid_to
is_active
last_success_at
created_by
created_at
```

Password selection order:

```text
1. Exact report-specific active password
2. Provider-connection default password
3. Organization legacy active passwords
4. Older valid password candidates
```

The import log stores `archive_password_id`, never the password itself.

---

# 11. Secret Storage

Production recommendation:

```text
AWS Secrets Manager
Azure Key Vault
Google Secret Manager
HashiCorp Vault
or equivalent
```

If FinPlan initially runs on a single private server:

```text
PostgreSQL metadata
+
envelope-encrypted secret payload
+
master key outside PostgreSQL
```

Rules:

```text
Never log secrets.
Never return secret plaintext in GET APIs.
Never include secrets in audit old_values/new_values.
Never include secrets in frontend state after save.
Never put secrets in .env committed to Git.
Never store CAMS/KFin security answers in ordinary tables.
Require Head/Admin re-authentication to replace secrets.
```

---

# 12. Report Catalog

Report definitions should be system-level, not editable by each organization.

## `integration.rta_report_definitions`

```text
id
provider
report_code
report_aliases
report_name
data_domain
delivery_modes
supported_formats
parser_key
current_parser_version
supports_subscription
supports_date_range
supports_all_funds
is_active
```

Example:

```text
provider: CAMS
report_code: WBR9
aliases: ["WBR9", "R9"]
report_name: Investor Static Details
data_domain: INVESTOR_MASTER
formats: ["DBF", "XLS", "XLSX"]
parser_key: cams_wbr9
```

This supports filenames that contain an alias rather than the full report code.

---

# 13. Organization Report Subscriptions

## `integration.rta_report_subscriptions`

```text
id
organization_id
rta_connection_id
report_definition_id
enabled
source_schedule_type       # PROVIDER_SUBSCRIPTION / MANUAL / EXTERNAL_SCHEDULER
frequency                  # DAILY / WEEKLY / MONTHLY / ON_DEMAND
days_of_week nullable
day_of_month nullable
lookback_business_days nullable
output_format
delivery_method            # EMAIL_ATTACHMENT / EMAIL_LINK / CONSOLE
parameters_json
expected_by_time nullable
last_received_at
next_expected_at
created_at
updated_at
```

The platform should distinguish:

```text
PROVIDER SCHEDULE
```

from:

```text
FINPLAN INGESTION SCHEDULE
```

The provider decides when it generates the source file; FinPlan imports it immediately when received.

---

# 14. Recommended Core Report Matrix

## Daily Core Data

| Data | CAMS | KFintech | Recommended FinPlan Cadence | Canonical Target |
|---|---|---|---|---|
| Investor/Folio master | WBR9 | MFSD311 subscription / MFSD211 historical | Daily incremental | Party/Customer + MF account |
| Transactions | WBR2 | MFSD307 subscription / MFSD201 historical | Daily | Transactions |
| Current AUM/positions | WBR9 balance and/or WBR22 | MFSD310 subscription / MFSD203 on-demand | Daily or weekly snapshot | Holdings/position snapshots |
| NAV | WBR1/WBR8 | MFSD301 | Daily | Scheme NAV |
| Transaction rejections | WBR46 | MFSD314/315/316 | Daily | Exception/rejection queue |
| SIP registrations | WBR49 | MFSD313 | Daily | Systematic plans |
| SIP termination/unoperational | WBR50 | MFSD327/331 or MFSD229/231 | Daily/weekly | Systematic plans |

## Weekly / Operational Reconciliation

| Data | CAMS | KFintech | Cadence |
|---|---|---|---|
| Full/expanded static reconciliation | WBR9 | MFSD311/211 | Weekly |
| Investor-scheme AUM | WBR22 | MFSD310/203 | Weekly |
| SIP/STP master reconciliation | WBR49/WBR50 | MFSD230 plus subscription reports | Weekly |
| KYC | WBR9/special feeds | MFSD339/240/262 | Weekly |
| Bank/nominee exceptions | WBR9/relevant special feeds | MFSD263/special reports | Weekly or monthly |

## Monthly / Business & Compliance

| Data | CAMS | KFintech | Cadence |
|---|---|---|---|
| Brokerage payout | WBR76/WBR77 and relevant brokerage feeds | MFSD205/206/207/208/238/249/250 | Monthly |
| AUM/business MIS | WBR21/WBR22 | MFSD202/203/219 | Month-end |
| KYC/compliance exception reports | provider special reports | MFSD247/253/258/262 | Monthly |
| PAN/Aadhaar status | WBR89 or current equivalent | relevant special report | Monthly |
| Nomination/contact exceptions | provider special reports | MFSD247 special reports | Monthly |

## Provider-Published Monthly Reports

KFintech documents:

```text
MFSD302 Market Size Estimation
- second week of every month

MFSD303 Ranking Report
- first week of every month
```

These are analytics/MIS, not necessary for FinPlan's core client portfolio ledger.

---

# 15. Recommended Scheduling Strategy

Do not hard-code a specific hour as if it were an RTA contractual SLA.

Use event-driven ingestion:

```text
Email/file arrives
      ↓
Import immediately
```

Then add expected-file watchdogs.

Suggested operational policy:

```text
Every 5–10 minutes
- poll mailbox only if push/webhook is unavailable

Every morning
- check whether previous expected business-day core feeds arrived

First warning
- MISSING_EXPECTED_REPORT

Second warning
- escalate to Organization Head / data administrator

Business day close
- unresolved missing feed remains visible in Integration Health
```

For provider-native subscriptions, schedule the recurring report once at the provider.

For late corrections, use overlap windows where the provider supports them, and make all imports idempotent. A common operational pattern is requesting the last few business days rather than only one exact day.

---

# 16. Historical Bootstrap

Do historical imports before enabling automatic daily updates.

Recommended order:

```text
1. Product/scheme/NAV master
2. Investor/folio master
3. Historical transactions
4. Current AUM/positions
5. SIP/STP registrations
6. KYC/compliance data
7. Brokerage history if required
8. Reconciliation
9. Activate recurring subscription ingestion
```

Suggested source reports:

## CAMS

```text
WBR9 historical investor/static data
WBR2 historical transactions
WBR1/WBR8 NAV/product mapping as needed
WBR49 SIP/STP
WBR22 current AUM snapshot
```

## KFintech

```text
MFSD211 investor master
MFSD201 transactions
MFSD203 client-wise AUM
MFSD230 SIP/STP
MFSD217 or MFSD301 NAV depending workflow
```

Large historical ranges should be requested in manageable chunks. Do not assume a single ten-year request will always be accepted or delivered safely.

---

# 17. Mailbox Ingestion

Prefer a dedicated connected mailbox or alias.

Example:

```text
registered RTA mailbox
        ↓ forwarding / provider delivery
unique organization ingestion alias
        ↓
FinPlan Mail Intake
```

Use:

```text
Google OAuth + Gmail API/watch
Microsoft OAuth + Graph webhook
or IMAP with secure credential only when necessary
```

Do not ask organizations to store their normal mailbox password inside FinPlan if OAuth is available.

## `integration.mailbox_connections`

```text
id
organization_id
provider_type
mailbox_address
oauth_secret_ref
status
last_sync_at
created_at
updated_at
```

Each received message should record:

```text
message_id
sender
recipient
subject
received_at
attachment count
organization mapping
source connection
```

---

# 18. Immutable Raw File Vault

Never import directly from an email attachment into live CRM tables.

Pipeline:

```text
Email / Manual Upload
        ↓
Raw File Vault
        ↓
Hash
        ↓
Decrypt / Extract
        ↓
Parse
        ↓
Stage
        ↓
Validate
        ↓
Normalize
        ↓
Canonical Import
```

Store raw encrypted files in object storage:

```text
S3 / MinIO / equivalent
```

Metadata in PostgreSQL.

## `integration.rta_files`

```text
id
organization_id
rta_connection_id
report_definition_id nullable
external_request_reference nullable
mail_message_id nullable
original_filename
object_storage_key
sha256
file_size
mime_type
is_encrypted
received_at
report_period_from nullable
report_period_to nullable
status
detected_report_code nullable
parser_version nullable
archive_password_id nullable
created_at
```

Unique protection:

```text
organization_id + sha256
```

A duplicate file must not create duplicate financial records.

---

# 19. File State Machine

```text
RECEIVED
  ↓
IDENTIFIED
  ↓
DECRYPTING
  ↓
EXTRACTED
  ↓
PARSING
  ↓
VALIDATING
  ↓
STAGED
  ↓
IMPORTING
  ↓
IMPORTED
  ↓
RECONCILING
  ↓
COMPLETED
```

Error states:

```text
DUPLICATE
PASSWORD_REQUIRED
UNKNOWN_REPORT
SCHEMA_MISMATCH
PARSE_FAILED
VALIDATION_FAILED
IMPORT_FAILED
RECONCILIATION_FAILED
QUARANTINED
```

---

# 20. Safe Archive Extraction

CAMS mailbacks can be AES encrypted. Standard Python `zipfile` alone is not enough for modern AES-encrypted ZIPs.

Production worker should use an AES-capable library/tool, for example:

```text
pyzipper
libarchive
7-Zip in a restricted worker
```

Rules:

```text
Do not execute self-extracting EXEs.
Treat EXE/SFX files as archives only when safely supported.
Reject archive path traversal.
Reject absolute paths.
Limit nested archive depth.
Limit uncompressed size.
Limit file count.
Reject unexpected executable payloads.
Extract to an isolated temporary directory.
Delete decrypted temporary files after processing.
```

---

# 21. Multiple Archive Passwords

The reference configuration demonstrates multiple possible RTA file passwords. FinPlan should support this cleanly.

Algorithm:

```text
for candidate in ordered_password_candidates:
    try extract
    if success:
        record candidate_id
        stop
if none succeeded:
    PASSWORD_REQUIRED / QUARANTINE
```

Never log:

```text
"Trying password abc123"
```

Log only:

```text
password_candidate_id=42
result=FAILED
```

---

# 22. Report Type Detection

Do not rely on filename alone.

Detection order:

```text
1. Known provider/source connection
2. Email subject / provider metadata
3. Requested report reference
4. Filename/report-code alias
5. Extracted inner filename
6. DBF/CSV header fingerprint
7. Column count + required-field signature
8. Date/data pattern validation
```

Example:

```text
R9
→ alias candidate WBR9

Required schema fingerprint:
folio number
investor name
product/scheme
PAN/static fields
balance fields
```

If filename suggests WBR9 but schema matches WBR2:

```text
QUARANTINE
```

Do not guess.

---

# 23. Parser Versioning

RTA layouts change over time.

Never implement:

```text
column 19 is always PAN forever
```

without a parser-version boundary.

Use:

## `integration.rta_parser_versions`

```text
id
report_definition_id
version
effective_from
effective_to
schema_fingerprint
parser_module
status
```

Every imported file records the parser version used.

This allows a raw file to be reprocessed later with a corrected parser.

---

# 24. Supported File Formats

Build parser adapters:

```text
DBF
CSV
TXT
XLS
XLSX
ZIP
PDF only when a source report truly requires it
```

## DBF

Support:

```text
field names
DBF dates
numeric/decimal precision
legacy encodings
blank values
deleted-record flags
```

## CSV

Support:

```text
UTF-8
Windows-1252/legacy encodings
comma/pipe/tab delimiters
quoted values
embedded commas
```

## Text

Support both:

```text
delimited
fixed-width
```

based on the report definition.

## Excel

Support:

```text
XLSX
legacy XLS where provider still emits it
```

Do not convert Excel manually before import.

---

# 25. Staging Layer

Every parsed row lands in staging before touching CRM.

## `integration.rta_import_runs`

```text
id
organization_id
rta_file_id
report_definition_id
parser_version
started_at
completed_at
status
rows_read
rows_valid
rows_rejected
rows_inserted
rows_updated
rows_unchanged
error_summary
```

## `integration.rta_staging_rows`

For early implementation a generic JSONB staging model is acceptable:

```text
id
import_run_id
row_number
external_row_key nullable
raw_payload_json
normalized_payload_json nullable
validation_status
validation_errors_json
```

For very high volume later, replace selected generic staging with report-specific bulk staging tables.

---

# 26. Provenance

Every normalized/canonical value coming from an RTA must be traceable.

Minimum provenance fields:

```text
source_provider
source_report_code
source_file_id
source_import_run_id
source_row_number
source_effective_date
source_record_hash
```

Raw source data is immutable.

If a user corrects FinPlan data manually, never edit the raw RTA row.

---

# 27. Canonical Mutual Fund Model

The existing FinPlan models are a good generic base:

```text
FinancialAccount
Holding
Transaction
Party
Customer
CustomerKYC
PartyBankAccount
```

RTA integration needs additional mutual-fund-specific identity.

Recommended extensions:

## `crm.mutual_fund_accounts`

One row per folio/account context.

```text
id
financial_account_id
organization_id
customer_id
registrar
amc_code
folio_number
holding_nature
tax_status
broker_arn
subbroker_arn nullable
euin nullable
source_last_seen_at
```

Unique:

```text
organization_id + registrar + amc_code + folio_number
```

## `crm.mutual_fund_schemes`

```text
id
registrar
amc_code
scheme_code
scheme_name
isin
plan_type
option_type
asset_class
is_active
```

## Holding extension

Add:

```text
mutual_fund_scheme_id
source_provider
source_position_date
source_file_id
```

to the Holding concept, or create a mutual-fund holding extension table.

## Transaction extension

The current `crm.transactions` should gain or be paired with:

```text
source_provider
source_transaction_id
source_file_id
source_report_code
amc_code
folio_number
scheme_code
posted_date
process_date
external_transaction_type
transaction_mode
reversal_code
exchange_flag
```

Idempotency must use provider business keys, not description text.

---

# 28. Systematic Plans

Create a real domain object rather than deriving active SIP solely from recent transactions.

## `crm.systematic_plans`

```text
id
organization_id
customer_id
financial_account_id
holding_id nullable
plan_type              # SIP / STP / SWP
registrar
external_registration_id
amount
frequency
start_date
end_date
cease_date nullable
pause_from_date nullable
pause_to_date nullable
target_scheme_id nullable
status
source_file_id
source_last_seen_at
```

Feeds:

```text
CAMS WBR49/WBR50
KFintech MFSD313/314/327/331 and MFSD230/229/231
```

---

# 29. Rejection / Exception Model

Rejected/unprocessed transactions should not be inserted as normal completed portfolio transactions.

Create:

## `integration.rta_transaction_exceptions`

```text
id
organization_id
provider
folio_number
scheme_code
application_number
external_transaction_id
transaction_type
trade_date
amount
reason
status
source_file_id
resolved_at
resolved_by
```

Sources:

```text
CAMS WBR46
KFintech MFSD314/315/316/218/236
```

Admin/Operations can then review unresolved cases.

---

# 30. Identity Resolution

Do not identify investors by name alone.

Recommended resolution:

```text
1. PAN / permitted tax identifier
2. Existing RTA external identity mapping
3. Folio + AMC + registrar
4. Holding pattern / joint-holder context
5. Name/date/contact as supporting evidence only
6. Manual review if ambiguous
```

Create:

## `integration.external_entity_links`

```text
id
organization_id
provider
external_entity_type
external_key
internal_entity_type
internal_entity_id
confidence
match_method
confirmed_by nullable
confirmed_at nullable
```

---

# 31. Auto-Create Customers

The Domain Related reference contains an "Auto Create Customers in data import" concept.

FinPlan should support:

```text
OFF
REVIEW
AUTO
```

Recommended default:

```text
REVIEW
```

Behavior:

## OFF

Unknown RTA investors stay unmatched.

## REVIEW

FinPlan creates an import candidate:

```text
Possible new customer
PAN: ...
Name: ...
Folios: ...
[Match Existing] [Create Customer]
```

## AUTO

Create Party + Customer only if strict identity validation succeeds.

Never create duplicate Customers merely because two RTAs spell the same investor name differently.

---

# 32. Static Data Conflict Policy

Do not blindly overwrite CRM details from every WBR9/MFSD master.

Example:

```text
FinPlan verified mobile: A
CAMS mobile: B
KFintech mobile: C
```

Instead:

```text
Source facts
   ↓
Field reconciliation policy
   ↓
Canonical CRM value
```

Recommended field states:

```text
RTA_SEEN
MANUALLY_VERIFIED
CLIENT_CONFIRMED
LOCKED
CONFLICT
```

Admin can choose a policy such as:

```text
Do not overwrite manually verified contact details automatically.
Raise a discrepancy instead.
```

---

# 33. Holdings & Position Reconciliation

Transactions create the ledger.

Position/AUM feeds provide an independent current-state check.

```text
Transaction-derived units
        vs
RTA current units
```

If within tolerance:

```text
RECONCILED
```

If not:

```text
MISMATCH
```

Store:

```text
folio
scheme
calculated_units
rta_units
difference
value_difference
as_of_date
status
```

This directly supports the existing "Self-Reconciliation of AUM" configuration concept.

---

# 34. Reversal Handling

Never delete an old transaction merely because a later RTA feed contains a reversal.

Model the reversal explicitly.

For CAMS transaction modes/codes and similar KFintech statuses:

```text
original transaction
        ↓
reversal/correction transaction
        ↓
current ledger state
```

Historical audit must remain reproducible.

---

# 35. Import Order per File Batch

For each daily source batch:

```text
1. Validate provider + organization
2. Import/update scheme references
3. Import investor/folio static facts
4. Resolve Customer/Folio mappings
5. Import transactions
6. Import position/AUM snapshots
7. Import systematic plans
8. Import rejections/exceptions
9. Import KYC/compliance facts
10. Reconcile units/AUM
11. Recalculate affected holdings/account balances
12. Refresh affected household/client summaries
13. Mark report completed
```

---

# 36. Request Engine

Create a provider abstraction:

```python
class RtaProviderAdapter:
    def validate_connection(...)
    def supported_reports(...)
    def request_report(...)
    def check_request_status(...)
    def parse_request_reference(...)
```

Possible results:

```text
REQUESTED
SUBSCRIPTION_CONFIGURED
MANUAL_ACTION_REQUIRED
HUMAN_AUTH_REQUIRED
UNSUPPORTED
```

If a provider does not expose a supported programmatic request mechanism, the adapter should return:

```text
MANUAL_ACTION_REQUIRED
```

rather than silently screen-scraping.

---

# 37. Human-Assisted Portal Requests

For historical/ad-hoc reports:

```text
Admin
  ↓
Request Report
  ↓
FinPlan prepares parameters
  ↓
Open provider workflow
  ↓
Head completes CAPTCHA / OTP if required
  ↓
Request reference recorded
  ↓
FinPlan waits for mailbox delivery
```

If Playwright/browser automation is introduced later, it must:

```text
not bypass CAPTCHA
not bypass MFA
not scrape undocumented APIs
pause for human authentication
use short-lived browser sessions
never log credentials
record request reference only
```

---

# 38. Import API

Recommended backend routes:

```text
GET   /admin/integrations/rta
POST  /admin/integrations/rta
GET   /admin/integrations/rta/{id}
PATCH /admin/integrations/rta/{id}

POST  /admin/integrations/rta/{id}/verify
POST  /admin/integrations/rta/{id}/portal-secret
POST  /admin/integrations/rta/{id}/archive-passwords

GET   /admin/integrations/rta/{id}/reports
POST  /admin/integrations/rta/{id}/subscriptions
PATCH /admin/integrations/rta/{id}/subscriptions/{subscription_id}

POST  /admin/integrations/rta/{id}/request-report

POST  /admin/integrations/imports/upload
GET   /admin/integrations/imports
GET   /admin/integrations/imports/{id}
POST  /admin/integrations/imports/{id}/reprocess

GET   /admin/integrations/quarantine
POST  /admin/integrations/quarantine/{id}/retry

GET   /admin/integrations/reconciliation
POST  /admin/integrations/reconciliation/{id}/resolve

GET   /admin/integrations/health
```

---

# 39. Permissions

Add:

```text
ORG.CONFIG.READ
ORG.CONFIG.UPDATE

ORG.RTA.READ
ORG.RTA.MANAGE
ORG.RTA.SECRET_MANAGE
ORG.RTA.REQUEST

ORG.DATA_IMPORT.READ
ORG.DATA_IMPORT.UPLOAD
ORG.DATA_IMPORT.REPROCESS

ORG.RECONCILIATION.READ
ORG.RECONCILIATION.RESOLVE
```

Recommended:

```text
Head/Admin → all
Employee → none by default
Operations/Compliance employee → explicitly granted subset
```

Secrets should require the strongest permission plus re-authentication.

---

# 40. Audit

Audit:

```text
RTA connection created
RTA connection changed
Portal secret replaced
Archive password added/revoked
Subscription enabled/disabled
Historical report request initiated
Manual file uploaded
File imported
File reprocessed
File quarantined
Reconciliation overridden
Auto-create policy changed
Risk-profile assumptions changed
```

Never include secret values in audit payloads.

---

# 41. Integration Health Dashboard

Recommended Admin dashboard:

```text
CAMS
Status: Healthy
Last WBR9: 06:12 today
Last WBR2: 06:18 today
Last reconciliation: Passed
Files last 7 days: 14/14
Errors: 0

KFintech
Status: Warning
Last MFSD311: 06:05 today
Last MFSD307: Missing
Expected: Daily
[Investigate]
```

Sections:

```text
Expected Reports
Received Reports
Missing Reports
Failed Passwords
Schema Changes
Row Validation Errors
Unmatched Investors
AUM Mismatches
Subscription Expiry
Credential Verification
```

---

# 42. Alert Rules

Examples:

```text
Expected daily report missing
Subscription expiry within 30 days
Connection verification failed
No password candidate opened archive
Unknown report received
Schema fingerprint changed
Import row failure > threshold
AUM reconciliation mismatch > tolerance
Large change in customer count
Large change in AUM
Duplicate report storm
Mailbox disconnected
```

---

# 43. Data Quality Rules

Examples:

```text
PAN format validation
folio non-empty
scheme code known or queued
transaction date reasonable
posted date reasonable
units precision preserved
amount precision preserved
negative values only where report semantics allow
holding units non-negative after valid reversals
AUM snapshot date not in unreasonable future
ARN matches organization connection where expected
```

Do not discard bad rows silently.

---

# 44. Idempotency

Core rule:

> The same source file or source transaction can be processed multiple times without creating duplicate economic events.

Use:

```text
file SHA-256
provider
report code
source transaction number
folio
scheme
process/posted date
reversal/adjustment indicator
```

as appropriate per report.

Parser-specific business-key builders are required.

---

# 45. Current FinPlan Mapping

The current backend already has:

```text
foundation.Party
foundation.PartyAddress
foundation.PartyBankAccount
crm.Customer
crm.CustomerKYC
crm.CustomerRiskProfile
crm.FinancialAccount
crm.Holding
crm.Transaction
```

There is currently no dedicated RTA/integration ingestion layer.

Therefore this feature should be built as a new `integration` module rather than placing RTA parsing inside the existing transaction router.

Recommended backend structure:

```text
backend/app/integrations/
├── rta/
│   ├── service.py
│   ├── catalog.py
│   ├── detection.py
│   ├── extraction.py
│   ├── validation.py
│   ├── reconciliation.py
│   ├── providers/
│   │   ├── base.py
│   │   ├── cams.py
│   │   └── kfintech.py
│   └── parsers/
│       ├── base.py
│       ├── cams_wbr9.py
│       ├── cams_wbr2.py
│       ├── cams_wbr46.py
│       ├── cams_wbr49.py
│       ├── kfin_mfsd311.py
│       ├── kfin_mfsd307.py
│       ├── kfin_mfsd203.py
│       └── ...
├── mailbox/
└── secrets/
```

Models:

```text
backend/app/models/integration/
```

Routers:

```text
backend/app/routers/admin_integrations.py
```

Workers:

```text
backend/app/workers/rta_import_worker.py
backend/app/workers/rta_mailbox_worker.py
backend/app/workers/rta_watchdog_worker.py
```

---

# 46. Queue / Worker Architecture

Heavy parsing must not happen inside the API request.

```text
FastAPI
  ↓ enqueue
Job Queue
  ↓
RTA Import Worker
  ↓
PostgreSQL + Object Storage
```

Suitable queue options:

```text
Celery + Redis
RQ
Dramatiq
Arq
or another existing project-standard worker
```

Do not add multiple queue technologies.

For the first implementation, a database-backed job table plus one worker is sufficient if you want minimal infrastructure.

---

# 47. Recommended First Development Milestone

Do **not** begin with automated site login.

Begin with the sample WBR9 file.

## Milestone 1

```text
Admin
 ↓
Data Integrations
 ↓
Manual Upload
 ↓
Upload encrypted CAMS WBR9 ZIP
 ↓
Choose configured CAMS connection
 ↓
Worker tries configured archive passwords
 ↓
Extract DBF safely
 ↓
Detect WBR9
 ↓
Parse DBF
 ↓
Show import preview
 ↓
Stage
 ↓
Validate
 ↓
Map investors/folios
 ↓
Import
 ↓
Show reconciliation/import summary
```

Acceptance criteria:

```text
No duplicate imports
No plaintext password persisted
Raw ZIP preserved
Decrypted temp file removed
Every imported row has provenance
Unknown investors visible in review queue
Parser errors visible
Reprocess works from raw file
```

---

# 48. Milestone 2

Implement CAMS WBR2.

```text
WBR9
→ investor/folio identity

WBR2
→ transaction ledger
```

This pair creates the core CAMS portfolio ingestion foundation.

Then implement:

```text
WBR46
WBR49
AUM reconciliation
```

---

# 49. Milestone 3

Implement KFintech:

```text
MFSD211 + MFSD201 for historical/manual bootstrap

MFSD311 + MFSD307 for recurring subscription ingestion
```

Then:

```text
MFSD310/203 AUM
MFSD313 SIP
MFSD314/315/316 rejections
```

---

# 50. Milestone 4

Connected mailbox:

```text
Receive mail
Detect organization
Download attachment/link
Store raw file
Start import
Track status
```

Only after manual upload parsing is stable.

---

# 51. Milestone 5

Provider subscription health:

```text
Expected report calendar
Missing report watchdog
Subscription expiry
Last received
Last successfully imported
Last reconciled
```

At this stage FinPlan can maintain portfolios daily without daily portal interaction.

---

# 52. Milestone 6

Advanced business feeds:

```text
KYC/compliance
Nomination/contact exceptions
Bank details
Brokerage
Commission
AUM business analytics
PAN/Aadhaar status
GST/brokerage reports
```

---

# 53. Test Strategy

For every parser, keep anonymized/synthetic fixture files.

Tests:

```text
Correct report detected
Wrong report quarantined
Correct password opens
Wrong passwords do not leak
Duplicate file skipped
Duplicate transaction skipped
Blank fields handled
Dates parsed
Decimals preserved
Legacy encoding handled
Schema-change detection works
Unknown scheme queued
Unknown customer queued
Reversal processed correctly
AUM mismatch detected
Organization isolation enforced
Reprocessing produces same canonical state
```

Security tests:

```text
Zip-slip
Zip bomb
Nested archives
Unexpected executable
Cross-organization attachment
Secret leakage in logs
Secret leakage in audit
Unauthorized Admin routes
```

---

# 54. Source-of-Truth Rules

Use the following conceptual authority model.

## Raw report

```text
Immutable source evidence
```

Never edit.

## RTA normalized record

```text
Authoritative representation of what that RTA reported
```

## FinPlan canonical record

```text
Business representation after identity mapping and policy
```

## Manual verified override

```text
May override presentation/CRM behavior
but never rewrites raw source evidence
```

Example:

```text
RTA transaction → authoritative economic event for its source
RTA holding snapshot → authoritative position observation for its snapshot date
CRM phone number → may remain manually verified even if another RTA feed differs
```

---

# 55. What Not to Do

Do not:

```text
Store portal passwords in plaintext.
Store security answers in generic settings.
Use the same field for portal password and archive password.
Auto-login to provider sites every morning when subscriptions can deliver files.
Bypass CAPTCHA/MFA.
Execute downloaded EXE/SFX files.
Import attachments directly into live tables.
Identify customers only by name.
Overwrite manually verified CRM values silently.
Delete old transactions when reversals occur.
Deduplicate only by filename.
Hard-code every parser to current column numbers forever.
Put RTA imports inside the normal transaction CRUD endpoint.
Assume CAMS/KFintech cover every financial asset in FinPlan.
```

---

# 56. Immediate Action Plan

## Step 1
Rotate any credential that has been exposed in screenshots/chat during development.

## Step 2 — Completed

Admin Application Configuration now has Common & Empanelment, Pre-Sales & Risk,
and Domain Related sections, with organization-scoped version history and audit.
The client overview reads the current risk parameters for its assigned risk
profile. The Domain Related form covers the PDF's non-secret fields, but most
of those policies are not yet consumed by reports/importers. Secret handling,
provider setup, FIFO lot accounting, and RTA execution remain in their
dedicated workstreams.

## Step 3
Create secure:

```text
Admin → Data Integrations → Mutual Fund RTAs
```

## Step 4
Create `integration` schema + migrations.

## Step 5
Create object-storage raw file vault.

## Step 6
Implement encrypted archive extraction.

## Step 7
Implement DBF reader.

## Step 8
Implement WBR9 detector/parser/staging.

## Step 9
Map WBR9 to investor/folio/position model.

## Step 10
Implement WBR2.

## Step 11
Implement reconciliation.

## Step 12
Implement KFin historical pair.

## Step 13
Implement mailbox automation.

## Step 14
Configure provider-native recurring subscriptions.

## Step 15
Add missing-report/expiry/schema health monitoring.

---

# 57. Final Recommended Architecture

```text
                         FINPLAN
                            │
                  Admin / Data Integrations
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
        CAMS                              KFintech
          │                                   │
  Provider subscription              Provider subscription
  / mailback                         / mailback
          │                                   │
          └──────────────┬────────────────────┘
                         │
                         ▼
                 Connected Mailbox
                  / Manual Upload
                         │
                         ▼
                  Immutable Raw Vault
                         │
                         ▼
                 Safe Decrypt/Extract
                         │
                         ▼
                 Report Type Detector
                         │
                         ▼
                 Versioned Parser
                         │
                         ▼
                      Staging
                         │
                         ▼
                    Validation
                         │
                         ▼
                  Identity Resolver
                         │
                         ▼
                    Normalizer
                         │
                         ▼
          ┌──────────────┼───────────────────┐
          │              │                   │
        Party        MF Accounts        Transactions
        Customer     Holdings           SIP/STP
        KYC          Positions          Exceptions
          │              │                   │
          └──────────────┼───────────────────┘
                         │
                         ▼
                   Reconciliation
                         │
                         ▼
            Portfolio / Goals / Reports
                         │
                         ▼
                 Advisor + Client UI
```

---

# 58. Research Basis

This architecture was built from:

- the uploaded FinPlan/WealthMagic-style Application Configuration references for Common, Pre-Sales and Domain Related settings;
- the uploaded encrypted sample DBF archive;
- CAMS Distributor Mailback Services and CAMS report data-structure documentation;
- CAMS guidance for WBR2/WBR46 reconciliation and WBR9 static details;
- KFintech Distributor Services Manual v2.1 (November 2024);
- KFintech current Distributor Services login/Subscription/Mailback model.

Provider report catalogs and schemas may change. Report definitions and parser versions must therefore remain versioned and independently updatable from organization configuration.

## Implementation handoff (2026-10-02)

The current application now protects its main create paths, including financial
transactions, report snapshots, and advisor documents, with persisted
`Idempotency-Key` reservations. This is a prerequisite for retry-safe RTA upload
and import APIs; RTA-specific deduplication must still use the raw file hash and
source record identity described above.

Start with Milestone 1: create the `integration` schema and organization-scoped
RTA connection/file/job metadata, then build a manual CAMS WBR9 upload that
preserves the encrypted raw ZIP and stages a preview. Use a synthetic DBF/ZIP
fixture for automated tests. The WBR9 sample archive described in this document
is not present in the repository, so the parser should not assume its exact
columns or password until a sanitized sample is available. Keep credentials in
a secret store outside normal configuration and do not begin portal automation.

---

# 59. Implementation Plan and Release Gates

Implement the first data source as **manual CAMS WBR9 ingestion**. Treat the
staged preview as the first release boundary. Do not write staged investors,
folios, or positions into live CRM/portfolio tables until the identity-mapping
rules and a sanitized real WBR9 file have been verified.

| Slice | Work | Exit check |
|---|---|---|
| 1. Foundation | Add the `integration` schema and migrations for organization-scoped connections, secret references, immutable file metadata, jobs, staging rows, and import events. Add RTA permissions and Admin navigation. | Cross-organization reads/writes are denied; migrations upgrade and downgrade in an isolated database. |
| 2. Secure intake | Store encrypted raw ZIPs outside the web root using an organization-scoped storage key and SHA-256 content hash. Add a database-backed job and a manual upload API with a stable request key. Store archive-password references in a secret store, never in normal settings or audit payloads. | A duplicate upload creates no second file/job; unauthorized uploads fail; raw bytes can be retrieved for reprocessing. |
| 3. WBR9 staging | In one worker, try eligible archive secrets, enforce ZIP path/file-count/size limits, extract into temporary storage, detect the report, parse DBF with a versioned layout, and stage rows with raw-file and row provenance. | Synthetic encrypted-ZIP/DBF fixtures cover success, wrong password, malformed layout, traversal, oversized files, and cleanup of decrypted files. |
| 4. Review UI | Show connection, upload status, detected report, parser errors, staged preview, unmatched investors/folios, and a reprocess action. | An operator can understand why a file is blocked without reading server logs; reprocessing does not duplicate staged rows. |
| 5. Canonical import | After real-sample validation, implement explicit investor/folio matching and reviewed mapping, then import approved records with stable source identities and a reconciliation summary. | Unknown investors remain in review; rerunning the same file produces the same canonical state; every imported value links to its source row. |

Use a single database-backed worker initially; add a separate queue technology
only when throughput requires it. Keep the parser and source-identity rules
outside the existing transaction CRUD router. WBR2, KFintech, mailbox delivery,
provider subscriptions, and portal automation follow the WBR9 release gate.

# 60. Pending Work to Keep Visible

## Before the first RTA preview release

- [ ] Decide and configure the secret store and raw-file storage backend; keep
  encryption keys and archive passwords outside source code and normal tables.
- [ ] Build the guarded CAMS/KFintech connection workflow for archive and portal
  credentials and CAMS 360 security answers, including rotation, redacted audit,
  and organization-scoped access. Do not put these in Application Configuration.
- [ ] Connect each Domain Related policy to its report, client view, importer,
  or provider workflow; implement FIFO lot accounting before applying the
  stored FIFO preference to calculations. Preserve report snapshots.
- [ ] Add the integration schema, permissions, Admin entry point, upload API,
  database job worker, versioned WBR9 detector/parser, staging, and review UI.
- [ ] Create synthetic fixtures and security tests for duplicate uploads,
  organization isolation, archive traversal/bombs, secret leakage, and replay.
- [ ] Obtain a sanitized CAMS WBR9 sample to confirm the actual layout and
  password/extraction behavior before enabling canonical import. The sample
  described above is not currently in the working tree.
- [ ] Rotate any real credential previously exposed in development material
  before using that provider account in an integration environment.

## Existing FinPlan work, tracked separately

- [ ] Audit retry-key behavior on specialized create routes, including
  organization onboarding, service-team assignments, permission assignments,
  and client-visible publication. The main advisor create paths already use
  persisted request keys.
- [ ] Finish the Admin governance acceptance checklist: remaining authorization
  integration/security review, audit-retention policy, and documented migration
  rollback evidence. See `ADMIN_ACCESS_ARCHITECTURE.md`, especially A7 and its
  definition of done. Its older baseline checklist contains historical gaps.
- [ ] Complete production-readiness work from `ROADMAP.md`: backups,
  observability, deployment environments, secret and file-storage operations,
  performance tests, and retention policy. These do not block the first local
  WBR9 preview, but must be addressed before production ingestion.
