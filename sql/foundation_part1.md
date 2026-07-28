# Advisor Center
# Software Design Specification (SDS)

# Foundation Module Design

---

| Property | Value |
|----------|-------|
| Document ID | SDS-FND-001 |
| Module | Foundation |
| Version | 1.0.0 |
| Database | PostgreSQL 16+ |
| Status | Draft |
| Author | Project Team |
| Last Updated | YYYY-MM-DD |

---

# Table of Contents

1. Introduction
2. Module Objectives
3. Scope
4. Out of Scope
5. Architecture
6. Foundation Components
7. Database Schema
8. Entity Relationship Diagram
9. Business Rules
10. Naming Standards
11. Common Columns
12. PostgreSQL Schemas
13. Geography Tables
    - countries
    - states
    - cities
14. Indexes
15. Seed Data
16. APIs
17. Validation Rules
18. Workflow
19. Security
20. Performance

---

# 1. Introduction

The Foundation module provides reusable master data used throughout Advisor Center.

Instead of storing duplicate information across Employees, Advisors, Customers, Agencies and Associates, common information is centralized in this module.

Every business module depends on Foundation.

This module contains:

- Geography
- Lookups
- Party Information
- Contact Information
- Address Information
- Bank Accounts
- Documents
- Common Masters

Foundation contains no business logic related to investments or reports.

---

# 2. Objectives

The Foundation module has the following objectives.

- Eliminate duplicate master data
- Improve maintainability
- Maintain referential integrity
- Provide reusable entities
- Standardize lookup values
- Centralize document management
- Support future scalability

---

# 3. Scope

Included

✓ Countries

✓ States

✓ Cities

✓ Lookup Categories

✓ Lookup Values

✓ Parties

✓ Contacts

✓ Addresses

✓ Bank Accounts

✓ Document Metadata

✓ Financial Years

✓ Currency Masters

Not Included

✗ Authentication

✗ Employees

✗ Customers

✗ Advisors

✗ Investments

✗ Reports

---

# 4. Module Dependencies

```
                Foundation

      ┌────────────┼─────────────┐

      ▼            ▼             ▼

 Identity     Organization      CRM

      ▼            ▼             ▼

 Investments  Reports     Client Portal
```

Every module references Foundation.

Foundation references none.

---

# 5. Module Architecture

```
Foundation

│

├── Geography

│      ├── Countries

│      ├── States

│      └── Cities

│

├── Lookup

│      ├── Categories

│      └── Values

│

├── Party

│      ├── Party

│      ├── Address

│      ├── Contact

│      ├── Bank

│      └── Documents

│

└── Masters

       ├── Currency

       └── Financial Year
```

---

# 6. Database Schema

```
foundation
```

Tables

```
countries

states

cities

lookup_categories

lookup_values

parties

party_addresses

party_contacts

party_bank_accounts

document_categories

document_types

documents

document_files

currencies

financial_years
```

---

# 7. Entity Relationship Diagram

```
                    Foundation

                        │

      ┌─────────────────┼──────────────────┐

      ▼                 ▼                  ▼

 Geography           Lookup             Party

      │                 │                  │

      ▼                 ▼                  ▼

 Countries      Lookup Categories     Addresses

      │                 │                  │

      ▼                 ▼                  ▼

 States         Lookup Values         Contacts

      │                                    │

      ▼                                    ▼

 Cities                            Bank Accounts

                                          │

                                          ▼

                                    Party Documents
```

---

# 8. Business Rules

BR-FND-001

Country names shall be unique.

---

BR-FND-002

Every State shall belong to one Country.

---

BR-FND-003

Every City shall belong to one State.

---

BR-FND-004

Lookup Categories cannot be deleted while values exist.

---

BR-FND-005

Lookup Values cannot be deleted while referenced.

---

BR-FND-006

Every Party may have multiple addresses.

---

BR-FND-007

Only one Primary Address is allowed.

---

BR-FND-008

Every Party may have multiple contacts.

---

BR-FND-009

Only one Primary Contact is allowed.

---

BR-FND-010

Every uploaded document belongs to one Party.

---

BR-FND-011

Soft Delete shall be implemented for all business tables.

---

# 9. Naming Standards

Tables

Plural

```
countries

parties

party_contacts
```

Columns

snake_case

```
created_at

organization_id

party_type_id
```

Primary Keys

```
id
```

Foreign Keys

```
country_id

state_id

party_id
```

Indexes

```
idx_country_name

idx_party_name
```

Constraints

```
pk_countries

fk_states_country

uq_country_name
```

---

# 10. Common Audit Columns

Every business table shall contain

```sql
created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

created_by      BIGINT,

updated_at      TIMESTAMP,

updated_by      BIGINT,

deleted_at      TIMESTAMP,

deleted_by      BIGINT,

version_no      INTEGER NOT NULL DEFAULT 1,

is_active       BOOLEAN NOT NULL DEFAULT TRUE
```

---

# 11. PostgreSQL Schema

```sql
CREATE SCHEMA IF NOT EXISTS foundation;
```

---

# 12. Geography Tables

## countries

Business Purpose

Stores supported countries.

---

```sql
CREATE TABLE foundation.countries
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    country_code        VARCHAR(5) NOT NULL,

    iso2                CHAR(2) NOT NULL,

    iso3                CHAR(3),

    country_name        VARCHAR(100) NOT NULL,

    nationality         VARCHAR(100),

    phone_code          VARCHAR(10),

    currency_code       VARCHAR(10),

    is_default          BOOLEAN DEFAULT FALSE,

    display_order       INTEGER DEFAULT 1,

    remarks             TEXT,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    deleted_at          TIMESTAMP,

    deleted_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_country_code
        UNIQUE(country_code),

    CONSTRAINT uq_country_name
        UNIQUE(country_name)
);
```

Indexes

```sql
CREATE INDEX idx_country_name
ON foundation.countries(country_name);
```

---

## states

Business Purpose

Stores states belonging to countries.

---

```sql
CREATE TABLE foundation.states
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    country_id          BIGINT NOT NULL,

    state_code          VARCHAR(10),

    state_name          VARCHAR(100) NOT NULL,

    gst_state_code      VARCHAR(5),

    display_order       INTEGER DEFAULT 1,

    remarks             TEXT,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    deleted_at          TIMESTAMP,

    deleted_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_state_country
        FOREIGN KEY(country_id)
        REFERENCES foundation.countries(id),

    CONSTRAINT uq_state
        UNIQUE(country_id,state_name)
);
```

Indexes

```sql
CREATE INDEX idx_state_country

ON foundation.states(country_id);

CREATE INDEX idx_state_name

ON foundation.states(state_name);
```

---

## cities

Business Purpose

Stores cities under each state.

---

```sql
CREATE TABLE foundation.cities
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    state_id            BIGINT NOT NULL,

    city_name           VARCHAR(100) NOT NULL,

    district_name       VARCHAR(100),

    pin_code            VARCHAR(10),

    latitude            NUMERIC(10,6),

    longitude           NUMERIC(10,6),

    display_order       INTEGER DEFAULT 1,

    remarks             TEXT,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    deleted_at          TIMESTAMP,

    deleted_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_city_state
        FOREIGN KEY(state_id)
        REFERENCES foundation.states(id),

    CONSTRAINT uq_city
        UNIQUE(state_id,city_name)
);
```

Indexes

```sql
CREATE INDEX idx_city_state

ON foundation.cities(state_id);

CREATE INDEX idx_city_name

ON foundation.cities(city_name);
```

---

# 13. Seed Data

```sql
INSERT INTO foundation.countries
(country_code,iso2,country_name,currency_code,is_default)

VALUES

('IND','IN','India','INR',TRUE);

INSERT INTO foundation.states
(country_id,state_name)

VALUES

(1,'Andhra Pradesh'),

(1,'Telangana'),

(1,'Karnataka'),

(1,'Tamil Nadu');
```

---

# 14. REST APIs

Countries

GET    /api/v1/foundation/countries

POST   /api/v1/foundation/countries

PUT    /api/v1/foundation/countries/{id}

DELETE /api/v1/foundation/countries/{id}

States

GET    /api/v1/foundation/states

POST   /api/v1/foundation/states

Cities

GET    /api/v1/foundation/cities

POST   /api/v1/foundation/cities

---

# 15. Validation Rules

Country

• Country Name Required

• Country Code Required

• ISO2 must be 2 characters

• ISO3 must be 3 characters

State

• Country Required

• State Name Required

City

• State Required

• City Name Required

---

# 16. Workflow

```
Administrator

↓

Create Country

↓

Create State

↓

Create City

↓

Activate

↓

Available Across System
```

---

# 17. Security

Only System Administrators can modify Geography Masters.

Organization users have read-only access.

All changes are audit logged.

---

# 18. Performance

Expected Rows

Countries < 300

States < 5,000

Cities < 100,000

Recommended Indexes

Country Name

State Name

City Name

Foreign Keys

---

**End of Part 1**

**Next Part (Part 2):**
- Lookup Categories
- Lookup Values
- Currencies
- Financial Years
- Seed Data
- APIs
- Validation Rules