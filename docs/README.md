# FinPlan Documentation Pack

**Snapshot:** 2026-09-30  
**Basis:** Current uploaded FinPlan backend and frontend source, plus the agreed product/business rules from development.

This documentation separates three things deliberately:

- **Implemented** — supported by the current source/database model.
- **Business rule** — an agreed rule the product must preserve.
- **Planned** — intended architecture or functionality that is not yet fully implemented.

## Core product documentation

- `ARCHITECTURE.md` — system structure, schemas, modules, data flows, authorization boundaries, frontend structure, and implementation status.
- `BUSINESS_RULES.md` — product-level rules that must remain true regardless of UI implementation.
- `HOUSEHOLDS.md` — detailed Household/Group semantics and lifecycle rules.
- `ROADMAP.md` — recommended order of work after the current CRM/Household foundation.

## Operations & setup

- `UBUNTU_SETUP.md` — Ubuntu/Linux local setup steps (Node, Python, running the project)
- `DATABASE.md` — PostgreSQL install/connection details, migrations (Alembic), useful psql commands
- `AUTHENTICATION.md` — register/login/OTP flow, test credentials, and login troubleshooting
- `EMAIL.md` — SMTP/OTP setup, provider options, and email deliverability
- `PERFORMANCE_OPTIMIZATION.md` — optimization backlog with quick wins

## Guides & reports

- `FINPLAN_GUIDE.md` — FinPlan Guide Lite chatbot integration, behavior, and maintenance
- `API_INTEGRATION_AUDIT.md` — backend/frontend integration audit (2026-09-30)
- `LEGACY_CLEANUP.md` — retired legacy models/schemas cleanup record

## Reference material

- [`../README.md`](../README.md) — project overview, quick start, tech stack, and API reference
- [`../design_guidelines.json`](../design_guidelines.json) — design system spec
- [`../sql/`](../sql/) — database design documents (Advisor Center, foundation, identity, organization, CRM) and migration SQL

## Source-of-truth principle

When code and documentation differ, do not silently choose one. First determine whether the code is outdated or the documented product rule has not yet been implemented. Then update both deliberately.

The current primary business anchor is:

> A client may have one active HOUSEHOLD/FAMILY membership while simultaneously participating in multiple BUSINESS, INVESTMENT, TRUST, HUF, and OTHER groups. Membership history must be preserved.
