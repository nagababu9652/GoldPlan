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

## Phase 2 — First-class Goals (core implemented)

Create proper goal records instead of relying on free text.

Implemented: customer/household ownership, goal type, target/current amount,
target date, priority, inflation/return assumptions, status, advisor-scoped CRUD,
and the client Goals UI. Current funding is manually maintained until the
financial-account and holdings phases can calculate it from real assets.

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

## Phase 3 — Financial Accounts (core implemented)

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

Implemented: customer or household ownership, asset/liability classification,
account balances and valuation dates, lifecycle status, advisor-scoped CRUD, and
the client Accounts UI. Detailed investment holdings and transaction allocation
remain in Phase 4.

## Phase 4 — Holdings / Investments / Transactions integration (core complete)

Connect transactions to actual accounts/holdings so portfolio value is data-driven.

Implemented: security-level holdings, data-driven client portfolios, transaction
allocation to accounts/holdings, and reversible BUY/SELL position updates.

## Phase 5 — Household aggregation (core complete)

Aggregate across household members/accounts for:

- net worth
- asset allocation
- liabilities
- goal funding
- risk exposure
- cash flow

Implemented: active-member and household-owned account, holding, goal, asset,
liability, net-worth, and portfolio aggregation with dedicated household screens.
Advisor-level transaction cash flow is implemented in the reporting phase.

## Phase 6 — Reports (core complete)

Build reports from real underlying data, with clear report dates and assumptions.

Implemented: a live advisor-scoped financial snapshot with report date, client
breakdown, assets, liabilities, net worth, portfolio value, unrealized gain, goal
funding, and a twelve-month completed-transaction cash-flow report. Downloadable
CSV report artifacts include the dated snapshot, client breakdown, and cash-flow
period. Historical versions persist their full payload and calculation assumptions
and can be reopened or downloaded without recalculating current financial data.

## Phase 7 — Advisor workflow maturity (core complete)

Strengthen:

- meetings
- tasks/follow-ups
- documents
- messages
- KYC/compliance workflows
- service-team assignments

Implemented for meetings: advisor-assignment authorization, validated meeting
types/statuses/time ranges, customer/group ownership checks, and explicit complete
and cancel workflow transitions.

Implemented for the remaining workflows: validated and advisor-scoped tasks,
meeting-to-follow-up creation, overdue/upcoming task indicators, client and group
task views, advisor-scoped document/message targets and lifecycle values, KYC review
editing with status history, and effective-dated client service-team assignments.

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
