# Advisor Center — Software Design Specification (SDS)

> **Volume 0 — Project Foundation & Architecture**
>
> Master reference document for the entire Advisor Center platform.

---

## Document Control

| Property | Value |
|----------|-------|
| **Document ID** | SDS-001 |
| **Document Name** | Project Foundation & Architecture |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Last Updated** | YYYY-MM-DD |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Module Roadmap](#3-module-roadmap)
4. [Database Philosophy](#4-database-philosophy)
5. [Target Users](#5-target-users)
6. [Guiding Principles](#6-guiding-principles)
7. [Future Vision](#7-future-vision)
8. [Recommended Directory Structure](#8-recommended-directory-structure)
9. [Appendix: Architecture Decision Records](#9-appendix-architecture-decision-records)

---

## 1. Project Overview

### Vision

Advisor Center is a unified wealth management platform where Advisors, Employees and Clients work from a single system.

### Business Problem

Financial advisory firms rely on disconnected tools — spreadsheets, separate CRMs, manual reporting, and ad-hoc communication. This causes:

- Duplicate and inconsistent customer data
- Manual report preparation
- No centralized audit trail
- Limited client self-service
- Difficulty scaling operations

Advisor Center solves this with a single, modular, secure platform.

### Core Modules

| # | Module | Purpose |
|---|--------|---------|
| 1 | Foundation | Shared master data (organizations, branches, parties, addresses) |
| 2 | Identity & Security | Authentication, RBAC, OTP, sessions, audit |
| 3 | Organization Management | Employees, advisors, associates, agencies, departments |
| 4 | CRM | Customer groups, customers, relationships, merge/split |
| 5 | Financial Products | Mutual funds, insurance, FD, bonds, stocks, gold, loans |
| 6 | Reports | Portfolio, performance, capital gains, asset allocation |
| 7 | Document Management | Upload, versioning, secure sharing |
| 8 | Communication | Email, SMS, in-app notifications |
| 9 | Administration | System settings, lookups, audit logs, configuration |
| 10 | Client Portal | Self-service access to reports, documents, statements |

---

## 2. System Architecture

### Technology Stack

```
┌─────────────────────────────────────┐
│        React / Next.js (TS)         │  ← Frontend
├─────────────────────────────────────┤
│            FastAPI (Python)          │  ← Backend API
├─────────────────────────────────────┤
│          Business Services           │  ← Business Logic
├─────────────────────────────────────┤
│          Repository Layer            │  ← Data Access
├─────────────────────────────────────┤
│            PostgreSQL                │  ← Database
├─────────────────────────────────────┤
│       Object Storage (Docs)         │  ← File Storage
└─────────────────────────────────────┘
```

### API Design

- RESTful APIs with JSON payloads
- JWT-based authentication (access + refresh tokens)
- Role-Based Access Control (RBAC) at endpoint level
- Standardized error responses
- Pagination, filtering, sorting on list endpoints

### Security

- Password hashing (bcrypt)
- OTP verification for registration and password reset
- Account locking after failed attempts
- Login history and audit trail
- Allowed IPs per organization (future)

---

## 3. Module Roadmap

### Delivery Sequence

```
Volume 1 — Foundation
      ↓
Volume 2 — Identity & Security
      ↓
Volume 3 — Organization Management
      ↓
Volume 4 — CRM (Customer Groups & Customers)
      ↓
Volume 5 — Financial Products
      ↓
Volume 6 — Reports & Analytics
      ↓
Volume 7 — Document Management
      ↓
Volume 8 — Communication
      ↓
Volume 9 — Administration
      ↓
Volume 10 — Client Portal
```

### Current Status

| Volume | Description | Status |
|--------|-------------|--------|
| 00 | Project Foundation & Architecture | ✅ Complete |
| 01 | Foundation | 🔄 In Progress |
| 02 | Identity & Security | 🔄 In Progress |
| 03 | Organization Management | 📋 Planned |
| 04 | CRM | 📋 Planned |
| 05 | Financial Products | 📋 Planned |
| 06 | Reports | 📋 Planned |
| 07 | Document Management | 📋 Planned |
| 08 | Communication | 📋 Planned |
| 09 | Administration | 📋 Planned |
| 10 | Client Portal | 📋 Planned |

---

## 4. Database Philosophy

### Party Model

All persons and entities derive from a single **Party** concept to eliminate data duplication.

```
                    ┌─────────┐
                    │  Party   │
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
     │ Employee │   │ Advisor │   │ Customer │
     └─────────┘   └─────────┘   └──────────┘
          │              │              │
     ┌────▼────┐   ┌────▼────┐         │
     │Associate│   │ Agency  │         │
     └─────────┘   └─────────┘         │
                               ┌───────▼────────┐
                               │ Customer Group  │
                               │  ┌───────────┐  │
                               │  │Head Client│  │
                               │  └───────────┘  │
                               │  ┌───────────┐  │
                               │  │Other Client│ │
                               │  └───────────┘  │
                               └────────────────┘
```

### Customer Group Model

The Customer Group is the primary CRM entity — a major improvement over traditional flat customer tables.

**Business Rules:**
- Every customer belongs to exactly one group
- A customer cannot exist independently
- Creating a customer automatically creates a group (if not provided)
- The first customer in a group becomes the **Head**
- Merge Groups, Split Groups, and Change Head are business operations with full history

### Lookup Strategy

Single generic `lookups` table for all dropdown data (gender, occupation, risk profile, marital status, etc.) instead of separate tables per type.

### Audit Strategy

Every table includes:
- `created_at` — timestamp of creation
- `updated_at` — timestamp of last update
- `created_by` — user who created the record
- `updated_by` — user who last modified the record

### UUID Strategy

Every table uses `UUID` as the primary key for distributed compatibility and security (no sequential ID guessing).

### Soft Delete Strategy

No physical deletes. Every table includes:
- `is_active` — boolean flag for active/inactive status
- `deleted_at` — timestamp when record was soft-deleted

---

## 5. Target Users

| User Type | Description | Access Level |
|-----------|-------------|--------------|
| Super Admin | Platform-level administrator | Full system access |
| Organization Admin | Manages a financial organization | Org-wide administration |
| Branch Manager | Manages branch operations | Branch-level management |
| Financial Advisor | Manages customer relationships | Client-facing operations |
| Employee | Internal operational staff | Limited operational access |
| Associate | Supports financial advisors | Restricted client view |
| Agency | External agency representative | Product-specific access |
| ARN Holder | Registered mutual fund distributor | Investment-specific access |
| Client | Accesses reports and documents via portal | Self-service only |

---

## 6. Guiding Principles

### Party-First Architecture
Every person or entity is stored as a Party. Common data (name, contact, address) is stored once and reused.

### Customer Group First
Customer Groups are the primary organizational unit in CRM. Individual customers cannot exist outside a group.

### Operations Over Entities
Business actions like Merge, Split, and Change Head are tracked as operations with full history, not as direct data modifications.

### Modular by Design
Each business domain is an independent module with its own models, APIs, services, and UI. Modules communicate through well-defined interfaces.

### Security by Design
Authentication, authorization, auditing, and data protection are built into every layer from the start.

### No Physical Deletes
All data uses soft deletes. History is never lost.

### Consistency
Common naming conventions, database standards, API patterns, and UI components are used throughout.

---

## 7. Future Vision

| Feature | Description |
|---------|-------------|
| Native Mobile Apps | Android & iOS applications |
| AI Reports | Automated investment insights and recommendations |
| WhatsApp Integration | Client communication via WhatsApp Business API |
| OCR Processing | Automated document scanning and data extraction |
| Digital Signatures | E-signature integration for agreements |
| Workflow Automation | Configurable approval and task workflows |
| API Marketplace | Third-party integrations via public API |
| Multi-language | UI support for regional languages |

---

## 8. Recommended Directory Structure

```
advisor-center/
│
├── docs/
│   ├── SDS/                          # Software Design Specifications
│   │   ├── 00_Project_Foundation.md
│   │   ├── 01_Foundation.md
│   │   ├── 02_Identity_Security.md
│   │   ├── 03_Organization_Management.md
│   │   ├── 04_CRM.md
│   │   ├── 05_Financial_Products.md
│   │   ├── 06_Reports.md
│   │   ├── 07_Document_Management.md
│   │   ├── 08_Communication.md
│   │   ├── 09_Administration.md
│   │   ├── 10_API_Specification.md
│   │   └── 11_UI_UX_Guidelines.md
│   │
│   ├── ERD/                          # Entity Relationship Diagrams
│   ├── Database/
│   │   ├── migrations/
│   │   ├── seed/
│   │   └── diagrams/
│   │
│   └── Decisions/                    # Architecture Decision Records
│       └── ADR-001-party-model.md
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routers/
│   │   └── core/
│   ├── migrations/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── infrastructure/
    ├── docker/
    ├── nginx/
    └── scripts/
```

---

## 9. Appendix: Architecture Decision Records

### ADR-001: Party Model

**Status:** Accepted

**Context:** Multiple user types (employees, advisors, customers, associates, agencies) share common fields like name, email, phone, and address. Without a shared model, this data would be duplicated across tables.

**Decision:** Use a Party-first architecture where a single `parties` table stores all common person/entity data, and specialized tables (employees, advisors, customers) reference the party record.

**Consequences:**
- No duplicate name/contact/address data
- Single source of truth for all person/entity records
- Easier to add new user types in the future
- Slightly more complex queries (JOINs required)

---

### ADR-002: Customer Group First

**Status:** Accepted

**Context:** Customers in wealth management typically belong to families, HUFs, trusts, or corporates. Treating customers as independent entities loses this relationship context.

**Decision:** Customer Groups are the primary CRM entity. Every customer must belong to a group. The first customer in a group becomes the Head.

**Consequences:**
- Natural representation of family/HUF/trust relationships
- Merge and split operations with full history
- Group-level reporting (family portfolio, consolidated statements)
- Additional complexity in customer creation flow

---

### ADR-003: UUID Primary Keys

**Status:** Accepted

**Context:** Sequential integer IDs expose record counts and create issues with distributed systems and data migration.

**Decision:** All tables use UUID v4 as primary keys.

**Consequences:**
- No sequential ID guessing
- Distributed-friendly (no central sequence needed)
- Slightly larger index size
- More complex debugging (non-human-readable IDs)

---

### ADR-004: Soft Deletes

**Status:** Accepted

**Context:** Regulatory requirements in financial services require data retention. Physical deletes make audit and recovery impossible.

**Decision:** No physical deletes. Every table has `is_active` and `deleted_at` columns. Deletes set `is_active = false` and `deleted_at = now()`.

**Consequences:**
- Complete audit trail
- Data recovery possible
- All queries must filter by `is_active = true`
- Slightly more storage required

---

*End of Document*