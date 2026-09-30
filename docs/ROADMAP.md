# FinPlan Recommended Roadmap

This roadmap prioritizes foundations that later financial-planning features depend on.

## Phase 1 — Stabilize CRM/Household foundation

1. Verify active-members vs membership-history behavior end-to-end.
2. Add/finish Household Membership History UI.
3. Audit all member counts to count active memberships where intended.
4. Verify every group head is always an active member.
5. Add backend tests for household invariants.
6. Add frontend integration tests for move/head/member workflows.
7. Audit visible client fields against actual persistence/retrieval support.

## Phase 2 — First-class Goals

Create proper goal records instead of relying on free text.

Suggested concepts:

- goal owner: customer or household
- goal type
- target amount
- target date
- current funding
- priority
- inflation/return assumptions
- status/progress

Initial goal types:

- Retirement
- Education
- Home Purchase
- Wealth Creation
- Other

## Phase 3 — Financial Accounts

Build a real ownership layer before portfolio analytics.

Examples:

- bank/cash account
- mutual fund account/folio
- brokerage/demat
- fixed deposit
- PPF/EPF/NPS
- insurance cash-value products where relevant
- loans/liabilities

Ownership should support individual, joint and entity/group contexts where appropriate.

## Phase 4 — Holdings / Investments / Transactions integration

Connect transactions to actual accounts/holdings so portfolio value is data-driven.

## Phase 5 — Household aggregation

Aggregate across household members/accounts for:

- net worth
- asset allocation
- liabilities
- goal funding
- risk exposure
- cash flow

## Phase 6 — Reports

Build reports from real underlying data, with clear report dates and assumptions.

## Phase 7 — Advisor workflow maturity

Strengthen:

- meetings
- tasks/follow-ups
- documents
- messages
- KYC/compliance workflows
- service-team assignments

## Phase 8 — Production readiness

- automated backups
- observability/logging
- deployment environments
- secrets management
- file-storage strategy
- security review
- authorization tests
- performance/load tests
- audit/reporting retention policy

## Parallel non-coding track

Maintain:

- `BUSINESS_RULES.md`
- `ARCHITECTURE.md`
- `HOUSEHOLDS.md`
- product/help knowledge for FinPlan Guide
- test scenarios / acceptance criteria

Every major architecture decision should update documentation in the same change set.
