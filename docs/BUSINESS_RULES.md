# FinPlan Business Rules

**Status:** Product rules and current implementation contract  
**Last reviewed:** 2026-09-30

## 1. Product scope

FinPlan is a financial-planning and wealth-advisory platform with two broad experiences:

1. **Advisor/Firm experience** — advisors manage clients, households, transactions, meetings, tasks, messages, documents, reports, and later financial accounts, investments, goals, and household-level planning.
2. **Individual experience** — public financial education, calculators, goals and investment-oriented pages; the complete authenticated individual workflow is still evolving.

The CRM/advisor domain is the current implementation focus.

---

## 2. Core identity rule: Party vs Customer

### Business rule

A **Party** represents the person/entity identity and contact record. A **Customer** represents that party's CRM/client relationship with an organization.

### Current implementation

Personal information such as name, date of birth, gender, marital status, PAN, Aadhaar, email and mobile is stored under `foundation.parties`.

CRM-specific information such as customer code, occupation, annual income, net worth, risk profile, onboarding date and customer status is stored under `crm.customers`.

### Why this matters

Do not duplicate identity/contact data into the Customer model merely for convenience. The Party/Customer separation is part of the domain architecture.

---

## 3. Advisor ownership and authorization

### Business rule

An advisor may only operate on clients/groups they are authorized to manage within their organization.

### Current implementation

Advisor access is resolved through authenticated `identity.User`, `organization.Employee`, and `organization.EmployeeAssignment` records. Existing router helpers such as `get_advisor_employee`, `get_customer_for_advisor`, and `get_group_for_advisor` enforce access boundaries.

### Required behavior

- Do not accept arbitrary customer/group IDs without authorization checks.
- Do not bypass organization scoping for convenience.
- New features must reuse the existing authorization helpers or equivalent organization-safe logic.

---

## 4. Client creation

### Business rule

Creating a client must create the minimum CRM relationship needed for the client to participate in FinPlan.

### Current implementation

A successful client creation creates, in one transaction-oriented flow:

1. `Party`
2. `Customer`
3. advisor `EmployeeAssignment`
4. initial `CustomerGroup`
5. initial `GroupMember`

The automatically created group is a `HOUSEHOLD` and the new client becomes its initial head and primary household member.

### Required behavior

- Partial creation must not be treated as successful.
- The frontend does not choose whether the new client gets a household; the backend does this automatically.
- A new client's initial household should use the household semantics described in `HOUSEHOLDS.md`.

---

## 5. Group types

FinPlan currently recognizes these group types:

- `HOUSEHOLD`
- `FAMILY`
- `BUSINESS`
- `INVESTMENT`
- `TRUST`
- `HUF`
- `OTHER`

### Business rule

`HOUSEHOLD` and `FAMILY` are **household-like** groups. The others represent additional financial/legal/association relationships and may coexist with a household membership.

### Group type immutability

Once a group is created, its `group_type` must not be changed.

Reason: changing type later can bypass household membership rules and corrupt historical meaning.

---

## 6. Active membership rule

### Primary rule

A client may have:

- **one active HOUSEHOLD/FAMILY membership**, and
- **multiple active BUSINESS / INVESTMENT / TRUST / HUF / OTHER memberships**.

Example:

```text
Client: Raj
├── Raj Household        HOUSEHOLD  (active)
├── ABC Pvt Ltd          BUSINESS   (active)
├── Family Trust         TRUST      (active)
├── Raj HUF              HUF        (active)
└── Investment Pool      INVESTMENT (active)
```

Invalid state:

```text
Raj Household  HOUSEHOLD active
Smith Family   FAMILY    active   <- not allowed simultaneously
```

### Current enforcement

- Application logic checks for another active HOUSEHOLD/FAMILY membership before adding a household-like membership.
- Database partial indexes protect against duplicate active membership rows for the same customer/group and against multiple active primary memberships for a customer.

---

## 7. Membership history

### Business rule

Membership is historical data. Leaving and later rejoining the same group must produce separate membership periods.

Correct:

```text
Group A: joined Jan 10, left Mar 20
Group A: joined Jun 01, active
```

Incorrect:

```text
Reuse the Jan row and overwrite joined_on / left_on
```

### Current database protection

`crm.group_members` uses a PostgreSQL partial unique index so the same customer/group may have multiple historical rows, but only one active row where `left_on IS NULL`.

### Required behavior

- Never reactivate a historical row by erasing `left_on`.
- Create a new membership row for each new membership period.
- Normal member lists show active memberships only.
- Membership history shows all periods without deduplicating by customer.

---

## 8. Primary household membership

### Business rule

`is_primary` is backend-controlled state, not an advisor/frontend choice.

- HOUSEHOLD/FAMILY active membership -> `is_primary = true`
- BUSINESS/INVESTMENT/TRUST/HUF/OTHER -> `is_primary = false`

Because a client may have only one active household-like membership, there is no manual “Set Primary Household” workflow.

### Database rule

At most one active `is_primary = true` membership may exist per customer.

### Client response rule

When a client response includes `group_id` / `group_name`, these fields represent the client's active household-like membership, not an arbitrary BUSINESS/TRUST/etc. group.

---

## 9. Group head

### Business rule

Group head and primary household membership are different concepts.

- `is_group_head` identifies the current head of a specific group.
- `is_primary` identifies the client's active household-like membership.

A BUSINESS, TRUST or HUF may have a head without becoming the client's primary household.

### Head integrity

- A group head must be an active member of that group.
- Only one active head is allowed per group.
- Changing head demotes the previous head to a normal active member.
- `CustomerGroup.head_customer_id` is the current-head pointer; membership history remains in `GroupMember`.

---

## 10. Relationship types

Relationship types are group-type specific.

Current allowed examples include:

- HOUSEHOLD/FAMILY: `SELF`, `SPOUSE`, `SON`, `DAUGHTER`, `FATHER`, `MOTHER`, `BROTHER`, `SISTER`, `GRANDFATHER`, `GRANDMOTHER`, `DEPENDENT`, `MEMBER`, `OTHER`
- BUSINESS: `DIRECTOR`, `OWNER`, `PARTNER`, `SHAREHOLDER`, `EMPLOYEE`, `MEMBER`, `OTHER`
- INVESTMENT: `INVESTOR`, `BENEFICIAL_OWNER`, `MEMBER`, `OTHER`
- TRUST: `TRUSTEE`, `SETTLOR`, `BENEFICIARY`, `MEMBER`, `OTHER`
- HUF: `KARTA`, `MEMBER`, `OTHER`
- OTHER: `MEMBER`, `OTHER`

### Required behavior

The backend validates relationship values against the target group type. The UI may offer friendly labels, but it must not invent unsupported relationship codes.

---

## 11. Moving a client between households

### Business rule

Moving a client is a dedicated operation. It is not equivalent to editing a `group_id` field.

Move flow:

1. Validate target group is active HOUSEHOLD/FAMILY.
2. Validate client authorization/status.
3. Close the client's current active HOUSEHOLD/FAMILY membership(s) by setting `left_on` and clearing primary/head flags.
4. Preserve all non-household memberships.
5. Create a **new** active membership row in the target household.
6. Set the new household membership to primary.

### If the moving client is the old household head

- If nobody remains in the old household: clear the head and deactivate the now-empty household.
- If members remain: require an explicit replacement head.
- Never guess the replacement head automatically.

---

## 12. Removing a member

### Business rule

Removing a member closes the membership period; it does not delete the membership record.

Required state change:

- `left_on = current date`
- `is_primary = false`
- `is_group_head = false`

### Household/FAMILY behavior

If the last active household-like member leaves:

- `head_customer_id = null`
- group becomes inactive
- membership history remains

### Non-household groups

Removing one member does not automatically deactivate BUSINESS / INVESTMENT / TRUST / HUF / OTHER groups.

---

## 13. Deactivating a group

### HOUSEHOLD/FAMILY

An occupied HOUSEHOLD/FAMILY cannot be deactivated directly. Members must first be moved or removed.

### Other group types

BUSINESS / INVESTMENT / TRUST / HUF / OTHER may be deactivated while active members exist. Deactivation closes their active memberships and clears head state.

### General rule

Deactivation preserves history. It is not a hard delete.

---

## 14. Client status

### Current rule

Inactive clients cannot be added to groups, moved between households, or made group head.

Future modules should respect the same status discipline unless a specific historical/read-only workflow requires otherwise.

---

## 15. Soft-delete / history philosophy

FinPlan is a financial CRM. Historical state matters.

Prefer:

- `is_active = false`
- `left_on = date`
- audit/history records

instead of destructive deletes for important CRM relationships.

Examples where history should be preserved:

- group membership
- group lifecycle
- customer status
- transaction changes
- KYC changes
- future advisor/service-team changes

---

## 16. Transactions

### Current implementation

Transactions and transaction history exist as real CRM models.

### Business rule

Changes to financial transaction records should remain auditable. Do not replace history-aware transaction behavior with destructive overwrite-only behavior.

---

## 17. Meetings, tasks, messages and documents

Current CRM models support customer/group context for operational records such as meetings, tasks, messages and documents.

### Business rule

Where a record can belong to either a client or household/group, the target must be explicit and authorized. Do not infer another advisor's client/group from free-form IDs.

---

## 18. Client financial/profile fields

The frontend/client schemas contain more fields than are fully persisted across specialized domain tables.

Examples that need careful treatment include:

- bank-account details
- nominees
- KYC state/documents
- investment experience
- financial goals

### Rule

A visible field is not automatically considered “implemented” merely because it exists in a frontend form or Pydantic schema. It is complete only when persistence, retrieval, validation and editing are all wired end-to-end.

---

## 19. Reports, portfolio and goals

These areas are not yet the same maturity as the client/household foundation.

### Planned business direction

Household should eventually aggregate:

- members
- financial accounts
- investments
- goals
- documents
- meetings
- tasks
- reports

Goals should become first-class records rather than only free-text descriptions.

---

## 20. AI / FinPlan Guide rule

The lightweight FinPlan Guide is a product-help/navigation assistant, not an autonomous financial advisor.

Current intended scope:

- explain FinPlan features
- answer common product questions
- navigate to known routes
- provide workflow guidance

It should not:

- modify financial records
- bypass authorization
- invent routes/features
- provide personalized investment recommendations as if it were a regulated advisor

---

## 21. Rules developers must not break

Do not:

1. Add a new `customer.group_id` as the household source of truth.
2. Allow multiple active HOUSEHOLD/FAMILY memberships for one client.
3. Let BUSINESS/TRUST/HUF/etc. become `is_primary = true`.
4. Let the frontend choose primary household state.
5. Reuse historical `GroupMember` rows by clearing `left_on`.
6. Hard-delete household membership history.
7. Allow `group_type` mutation after creation.
8. Allow a non-member/inactive customer to become group head.
9. Deactivate an occupied HOUSEHOLD/FAMILY directly.
10. Bypass advisor/organization authorization checks.
11. Treat placeholder portfolio/report UI as production financial truth.
