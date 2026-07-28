# Advisor Center
# Software Design Specification (SDS)

# CRM Module – Part 3
# Customer KYC & Compliance

---

| Property | Value |
|----------|-------|
| Document ID | SDS-CRM-103 |
| Module | CRM |
| Part | 3 |
| Version | 1.0 |
| Schema | crm |
| Database | PostgreSQL 16+ |

---

# Table of Contents

1. Introduction
2. Architecture
3. Business Rules
4. Entity Relationship
5. Database Tables
6. CREATE TABLE Statements
7. Workflow
8. APIs
9. Validation Rules

---

# 1. Introduction

The Customer KYC & Compliance module stores customer-specific
financial, regulatory, and advisory information.

The Foundation Module already manages:

- Parties
- Addresses
- Phone Numbers
- Email Addresses
- Identity Documents
- Uploaded Files

Therefore, this module stores only business-specific compliance data.

---

# 2. Architecture

```
Foundation

Party
│
├── Addresses
├── Contacts
├── Documents
└── Identity

        │

        ▼

CRM

Customer
│
├── Customer KYC
├── FATCA / CRS
├── Risk Assessment
└── Communication Preferences
```

---

# 3. Business Rules

CRM-301

Every Customer has one active KYC profile.

---

CRM-302

PAN is mandatory for investment customers.

---

CRM-303

Risk Profile must be periodically reviewed.

---

CRM-304

FATCA declaration is mandatory where applicable.

---

CRM-305

KYC verification history must be preserved.

---

CRM-306

Communication preferences determine how notifications are sent.

---

CRM-307

Customer documents are stored in Foundation.

CRM only references their verification status.

---

# 4. Entity Relationship

```
Customers

│

├──────────────┐

▼              ▼

Customer KYC   FATCA

│

▼

Risk Profile

│

▼

Communication Preferences

│

▼

KYC Review History
```

---

# 5. Database Tables

Core

- customer_kyc
- customer_fatca
- customer_risk_profiles
- customer_communication_preferences
- customer_kyc_history

---

# 6. CREATE TABLE Statements

## customer_kyc

Business Purpose

Stores regulatory KYC information.

```sql
CREATE TABLE crm.customer_kyc
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id                 BIGINT NOT NULL,

    pan_number                  VARCHAR(20),

    aadhaar_masked              VARCHAR(20),

    kyc_status                  VARCHAR(30) NOT NULL,

    kyc_verified_date           DATE,

    kyc_expiry_date             DATE,

    verification_method         VARCHAR(50),

    verification_reference      VARCHAR(100),

    politically_exposed_person  BOOLEAN DEFAULT FALSE,

    minor_customer              BOOLEAN DEFAULT FALSE,

    guardian_customer_id        BIGINT,

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at                  TIMESTAMP,

    CONSTRAINT fk_customer_kyc
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_guardian
        FOREIGN KEY(guardian_customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT uq_customer_kyc
        UNIQUE(customer_id)
);
```

Indexes

```sql
CREATE INDEX idx_customer_kyc_status
ON crm.customer_kyc(kyc_status);

CREATE INDEX idx_customer_pan
ON crm.customer_kyc(pan_number);
```

---

## customer_fatca

Business Purpose

Stores FATCA / CRS declarations.

```sql
CREATE TABLE crm.customer_fatca
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id                 BIGINT NOT NULL,

    tax_residency_country       VARCHAR(100),

    tax_identification_number   VARCHAR(100),

    us_person                   BOOLEAN DEFAULT FALSE,

    fatca_status                VARCHAR(30),

    declaration_date            DATE,

    review_date                 DATE,

    remarks                     TEXT,

    CONSTRAINT fk_fatca_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT uq_customer_fatca
        UNIQUE(customer_id)
);
```

---

## customer_risk_profiles

Business Purpose

Stores investment suitability assessments.

```sql
CREATE TABLE crm.customer_risk_profiles
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id                 BIGINT NOT NULL,

    risk_profile                VARCHAR(30) NOT NULL,

    assessed_on                 DATE,

    next_review_date            DATE,

    assessment_method           VARCHAR(100),

    assessed_by_employee_id     BIGINT,

    remarks                     TEXT,

    CONSTRAINT fk_risk_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_risk_employee
        FOREIGN KEY(assessed_by_employee_id)
        REFERENCES organization.employees(id)
);
```

Indexes

```sql
CREATE INDEX idx_customer_risk
ON crm.customer_risk_profiles(risk_profile);
```

---

## customer_communication_preferences

Business Purpose

Stores customer communication preferences.

```sql
CREATE TABLE crm.customer_communication_preferences
(
    customer_id                 BIGINT PRIMARY KEY,

    preferred_language          VARCHAR(30),

    preferred_channel           VARCHAR(30),

    email_enabled               BOOLEAN DEFAULT TRUE,

    sms_enabled                 BOOLEAN DEFAULT TRUE,

    whatsapp_enabled            BOOLEAN DEFAULT TRUE,

    postal_enabled              BOOLEAN DEFAULT FALSE,

    marketing_consent           BOOLEAN DEFAULT FALSE,

    do_not_disturb              BOOLEAN DEFAULT FALSE,

    updated_at                  TIMESTAMP,

    CONSTRAINT fk_pref_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id)
);
```

---

## customer_kyc_history

Business Purpose

Maintains KYC review history.

```sql
CREATE TABLE crm.customer_kyc_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id                 BIGINT NOT NULL,

    previous_status             VARCHAR(30),

    new_status                  VARCHAR(30),

    reviewed_on                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    reviewed_by                 BIGINT,

    review_reason               TEXT,

    CONSTRAINT fk_history_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_history_employee
        FOREIGN KEY(reviewed_by)
        REFERENCES organization.employees(id)
);
```

---

# 7. KYC Workflow

```
Create Customer

↓

Collect Documents

↓

Verify PAN

↓

Verify Aadhaar

↓

Complete FATCA

↓

Assess Risk Profile

↓

Activate Customer

↓

Periodic Review

↓

Update History
```

---

# 8. REST APIs

Customer KYC

GET    /api/v1/customers/{id}/kyc

POST   /api/v1/customers/{id}/kyc

PUT    /api/v1/customers/{id}/kyc

---

Risk Profile

GET    /api/v1/customers/{id}/risk-profile

POST   /api/v1/customers/{id}/risk-profile

---

FATCA

GET    /api/v1/customers/{id}/fatca

POST   /api/v1/customers/{id}/fatca

---

Communication Preferences

GET    /api/v1/customers/{id}/preferences

PUT    /api/v1/customers/{id}/preferences

---

# 9. Validation Rules

Customer KYC

✓ One active KYC record per Customer

✓ PAN format validation

✓ Aadhaar stored only in masked form

✓ Guardian mandatory for minors

---

Risk Profile

✓ Risk Profile Required

✓ Review Date ≥ Assessment Date

---

FATCA

✓ Declaration Date Required

✓ TIN mandatory where applicable

---

Communication Preferences

✓ Preferred Language Required

✓ At least one communication channel enabled

---

KYC History

✓ Every KYC status change recorded

✓ History records are immutable