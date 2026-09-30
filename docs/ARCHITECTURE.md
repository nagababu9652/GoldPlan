# FinPlan Architecture

**Architecture snapshot:** 2026-09-30  
**Primary backend:** FastAPI + SQLAlchemy + PostgreSQL + Alembic  
**Primary frontend:** Next.js + React + TypeScript + Tailwind

## 1. Architectural goals

FinPlan is being structured as a multi-domain financial CRM rather than a single-table CRUD application.

The architecture aims to provide:

- separation of identity/contact data from CRM relationship data
- organization/advisor scoping
- audit/history-friendly records
- household and entity relationship modeling
- modular CRM workflows
- future support for household financial planning, goals, investments and reporting

---

## 2. High-level architecture

```text
                         FINPLAN
                            │
               ┌────────────┴────────────┐
               │                         │
          Next.js Web UI             FastAPI API
               │                         │
               │                  Authentication / RBAC
               │                         │
               └──────────────┬──────────┘
                              │
                        SQLAlchemy ORM
                              │
                         PostgreSQL
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   foundation              identity             organization
        │                     │                     │
        └─────────────────────┴──────────┬──────────┘
                                        │
                                       crm
```

---

## 3. Database schemas

### `foundation`

Purpose: reusable identity/master/reference data.

Key models include:

- `Party`
- `PartyAddress`
- `PartyContact`
- `PartyBankAccount`
- `LookupCategory`
- `LookupValue`
- `Country`, `State`, `City`
- foundation document/master records

`Party` is the core person/entity identity record used by customers and employees/users.

### `identity`

Purpose: authentication, authorization and security.

Key models include:

- `User`
- `AuthenticationMethod`
- `PasswordHistory`
- `OTPRequest`
- `UserSession`
- `RefreshToken`
- `LoginHistory`
- `Permission`
- `Role`
- permission profiles / user roles
- device/security/audit records

### `organization`

Purpose: financial-firm organizational structure and employee relationships.

Key models include:

- `Organization`
- `Branch`
- `Department`
- `Designation`
- `OrganizationSetting`
- `Employee`
- `EmployeeRole`
- `EmployeeReporting`
- employee branch/department history
- `EmployeeAssignment`
- skills/certifications/holidays

### `crm`

Purpose: customer relationship management and advisor workflows.

Key models currently include:

- `Customer`
- `CustomerGroup`
- `GroupMember`
- `CustomerStatusHistory`
- `CustomerRelationship`
- group/customer merge/split history models
- `CustomerKYC`
- `CustomerFATCA`
- `CustomerRiskProfile`
- `CustomerCommunicationPreference`
- `CustomerKYCHistory`
- `Transaction`
- `TransactionHistory`
- `Meeting`
- `Task`
- `Message`
- `CrmDocument`

---

## 4. Audit model

Most major entities inherit `AuditMixin`, which provides:

- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `deleted_at`
- `deleted_by`
- `version_no`
- `is_active`

The preferred design is history/soft-deactivation rather than destructive deletion for financially meaningful relationships.

---

## 5. Party -> Customer pattern

```text
foundation.Party
        │
        └── crm.Customer
```

Party stores personal/entity identity and contact fields. Customer stores CRM-specific attributes.

This allows the same foundation identity architecture to support users, employees and customers without merging their domain concerns.

---

## 6. Advisor authorization path

Conceptual flow:

```text
identity.User
    ↓
foundation.Party
    ↓
organization.Employee
    ↓
organization.EmployeeAssignment
    ↓
crm.Customer / crm.CustomerGroup
```

Advisor-facing routers should resolve the authenticated User to the authorized Employee and scope client/group operations accordingly.

Important helpers currently used in CRM routers include:

- `get_advisor_employee`
- `get_customer_for_advisor`
- `get_group_for_advisor`

---

## 7. Client creation architecture

Current client creation coordinates multiple domains:

```text
Request
  ↓
Party
  ↓
Customer
  ↓
EmployeeAssignment
  ↓
CustomerGroup (HOUSEHOLD)
  ↓
GroupMember (SELF, head, primary)
  ↓
optional profile/address/bank/KYC-related persistence where supported
```

The automatic household is deliberate business behavior, not a UI convenience.

---

## 8. Household / group architecture

```text
crm.Customer
     │
     └── crm.GroupMember
              │
              └── crm.CustomerGroup
```

This is a temporal many-to-many model. `GroupMember` is a membership period, not merely a join row.

Current group types:

- HOUSEHOLD
- FAMILY
- BUSINESS
- INVESTMENT
- TRUST
- HUF
- OTHER

Detailed semantics are documented in `HOUSEHOLDS.md`.

### Database protections

Current `GroupMember` partial unique indexes protect:

1. one active membership for a given customer/group (`left_on IS NULL`)
2. one active primary membership per customer
3. one active head per group

The cross-group rule “only one active HOUSEHOLD/FAMILY per client” remains primarily application-enforced because it depends on `CustomerGroup.group_type` across tables.

---

## 9. CRM operational modules

### Transactions

Implemented with `Transaction` + `TransactionHistory` and advisor routes/UI.

### Meetings

Current CRM meeting model exists under `crm`; a migration explicitly retires the old `advisor.meetings` table, indicating consolidation toward CRM meetings.

### Tasks

CRM task model and advisor task router are present.

### Messages

CRM message model/router exist.

### Documents

CRM document model/router and uploaded-file serving are present. Backend mounts `/uploads` from its upload directory.

### KYC/Risk

CRM contains KYC, FATCA, risk-profile, communication-preference and KYC-history models.

---

## 10. FastAPI application composition

The current FastAPI app:

- registers the four-schema model architecture
- serves `/uploads`
- applies process-time response headers
- applies gzip compression for larger responses
- configures CORS
- includes routers for market, auth, advisors, tasks, clients, groups and onboarding
- exposes `/health`

Some CRM subrouters may be mounted indirectly through the advisor router structure rather than listed directly in `app/main.py`; verify router composition before adding duplicate routes.

---

## 11. Frontend architecture

The uploaded Next.js application contains both public and advisor-facing route trees.

### Advisor navigation currently exposes

```text
Dashboard
CRM
  ├── Clients
  ├── Households
  ├── Meetings
  ├── Tasks
  └── Messages
Portfolio
Reports
Documents
Transactions
Admin
  ├── Profile
  └── Notifications
```

### Client-specific routes include

- client overview
- edit
- goals
- documents
- timeline
- settings
- notes
- portfolio

### Public-site areas include

- financial tools/calculators
- goals content
- investments content
- protection content
- resources/blog/tax/SIP content
- company pages
- pricing/contact/auth pages

---

## 12. Frontend authentication behavior

Advisor dashboard layout checks local authentication state and redirects unauthenticated users to `/login`. It also applies advisor-role routing logic.

The shared API layer should remain the standard place for authenticated request behavior, including refresh handling, rather than implementing token behavior independently in every page.

---

## 13. API/domain boundary principle

The frontend should express user intent. The backend owns financial/CRM invariants.

Examples of backend-owned rules:

- only one active household-like membership
- group type immutability
- primary membership calculation
- relationship-type validation
- replacement-head requirement
- advisor authorization

Do not rely on UI visibility alone to enforce these rules.

---

## 14. Migration strategy

Schema evolution should use Alembic.

Recent architecture-relevant migrations include:

- transaction creation/history
- CRM meetings/tasks/messages/documents
- group audit-column alignment
- group-member history support
- active primary/head protection
- retirement of the legacy `advisor.meetings` table

### Required discipline

Before schema changes:

```text
alembic current
alembic heads
```

After reviewing a migration:

```text
alembic upgrade head
```

Do not use `Base.metadata.create_all()` as the normal production migration strategy.

---

## 15. Legacy-code policy

Historical/legacy models or scripts may still exist in the repository.

Do not import retired models simply because a similarly named file exists. Confirm that the current router/model architecture uses the `crm`, `organization`, `identity` and `foundation` domains.

The retired advisor meetings migration is an example of deliberate cleanup.

---

## 16. Current maturity by area

### Strong/current foundation

- authentication/session architecture
- organization/employee structure
- client/party model
- household/group model
- membership history
- transaction + transaction history
- CRM meeting/task/message/document models

### In progress / requires continued verification

- complete end-to-end persistence of all client form fields
- household membership-history UI
- broad automated tests for all household invariants
- complete module integration consistency across frontend/backend

### Planned / not yet mature enough to treat as final financial truth

- financial account ownership model
- holdings/investment ledger
- household portfolio aggregation
- first-class financial goals
- production-grade report engine
- comprehensive notifications
- advanced advisor service-team model

---

## 17. Future target architecture

```text
Household
   │
   ├── Members / Relationships
   ├── Financial Accounts
   │      ├── Bank / Cash
   │      ├── Investments
   │      ├── Loans / Liabilities
   │      └── Joint / Entity ownership
   │
   ├── Goals
   ├── Risk / Planning profile
   ├── Transactions
   ├── Documents
   ├── Meetings / Tasks / Messages
   └── Reports
```

The future portfolio/reporting layer should be built from real financial-account/holding data, not from static placeholder UI data.

---

## 18. Lightweight FinPlan Guide

The Product Guide is intentionally separate from core financial logic.

Recommended/current design:

```text
Next.js chat-style drawer
    ↓
local curated knowledge
    ↓
fuzzy / intent matching
    ↓
known navigation actions
```

No LLM is required for the lightweight version. This avoids extra runtime cost and prevents product-help answers from inventing routes or features.

---

## 19. Architecture decision checklist

Before adding a new feature, answer:

1. Which domain owns the data: foundation, identity, organization or CRM?
2. Is the record current-state only, or must history be preserved?
3. What organization/advisor authorization applies?
4. Is the relationship client-level or household-level?
5. Does this belong in CustomerGroup, or should it be a separate first-class model?
6. Does the backend enforce the invariant, or only the UI?
7. Is an Alembic migration needed?
8. How will the frontend retrieve/update the state through the shared API layer?
9. What tests prove the rule cannot be bypassed?
