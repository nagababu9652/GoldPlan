# Advisor Center
# Software Design Specification (SDS)

# CRM Module – Part 4
# Customer Advisors, Nominees & Customer Services

---

| Property | Value |
|----------|-------|
| Document ID | SDS-CRM-104 |
| Module | CRM |
| Part | 4 |
| Version | 1.0 |
| Schema | crm |
| Database | PostgreSQL 16+ |

---

# Table of Contents

1. Introduction
2. Business Rules
3. Architecture
4. Database Tables
5. CREATE TABLE Statements
6. Business Workflow
7. REST APIs
8. Validation Rules

---

# 1. Introduction

This module manages the operational ownership of customers.

It defines

- Primary Advisor
- Secondary Advisor
- Relationship Manager
- Customer Nominees
- Referral Sources
- Customer Service Assignment

Unlike the Organization module, this module links employees
to customer groups and customers.

---

# 2. Business Rules

CRM-401

Every Customer Group must have one Primary Advisor.

---

CRM-402

A Customer Group may have multiple Secondary Advisors.

---

CRM-403

A Relationship Manager may manage multiple Customer Groups.

---

CRM-404

Customers may have multiple Nominees.

---

CRM-405

Nominee allocation percentages must total 100%.

---

CRM-406

Referral information is retained permanently.

---

CRM-407

Assignment history must never be deleted.

---

# 3. Architecture

```
Employees

│

▼

Customer Advisors

│

▼

Customer Groups

│

├──────────────┐

▼              ▼

Customers    Nominees

│

▼

Referral Sources
```

---

# 4. Database Tables

Core

- customer_group_advisors
- customer_nominees
- customer_referrals
- customer_service_assignments

---

# 5. CREATE TABLE Statements

## customer_group_advisors

Business Purpose

Assigns advisors to customer groups.

```sql
CREATE TABLE crm.customer_group_advisors
(
    id                              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_group_id               BIGINT NOT NULL,

    employee_id                     BIGINT NOT NULL,

    advisor_role                    VARCHAR(30) NOT NULL,

    effective_from                  DATE NOT NULL,

    effective_to                    DATE,

    is_primary                      BOOLEAN DEFAULT FALSE,

    remarks                         TEXT,

    created_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                      BIGINT,

    CONSTRAINT fk_group_advisor_group
        FOREIGN KEY(customer_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_group_advisor_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id)
);
```

Indexes

```sql
CREATE INDEX idx_group_advisor_group
ON crm.customer_group_advisors(customer_group_id);

CREATE INDEX idx_group_advisor_employee
ON crm.customer_group_advisors(employee_id);
```

---

## customer_nominees

Business Purpose

Stores nominees for customer investments.

```sql
CREATE TABLE crm.customer_nominees
(
    id                              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id                     BIGINT NOT NULL,

    nominee_name                    VARCHAR(200) NOT NULL,

    relationship                    VARCHAR(50),

    allocation_percentage           NUMERIC(5,2),

    date_of_birth                   DATE,

    guardian_name                   VARCHAR(200),

    contact_number                  VARCHAR(30),

    remarks                         TEXT,

    created_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_nominee_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id)
);
```

Indexes

```sql
CREATE INDEX idx_nominee_customer
ON crm.customer_nominees(customer_id);
```

---

## customer_referrals

Business Purpose

Stores referral source information.

```sql
CREATE TABLE crm.customer_referrals
(
    id                              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id                     BIGINT NOT NULL,

    referral_type                   VARCHAR(50),

    referred_by_customer_id         BIGINT,

    referred_by_employee_id         BIGINT,

    external_referral_name          VARCHAR(200),

    referral_date                   DATE,

    remarks                         TEXT,

    created_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_referral_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_referral_customer_ref
        FOREIGN KEY(referred_by_customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_referral_employee
        FOREIGN KEY(referred_by_employee_id)
        REFERENCES organization.employees(id)
);
```

---

## customer_service_assignments

Business Purpose

Assigns operational responsibility for servicing customers.

Examples

- Documentation
- KYC Follow-up
- Portfolio Review
- Insurance Renewal
- Financial Planning
- Service Requests

```sql
CREATE TABLE crm.customer_service_assignments
(
    id                              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_group_id               BIGINT NOT NULL,

    employee_id                     BIGINT NOT NULL,

    service_type                    VARCHAR(50) NOT NULL,

    assigned_on                     DATE,

    completed_on                    DATE,

    assignment_status               VARCHAR(30),

    remarks                         TEXT,

    created_at                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_group
        FOREIGN KEY(customer_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_service_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id)
);
```

Indexes

```sql
CREATE INDEX idx_service_group
ON crm.customer_service_assignments(customer_group_id);

CREATE INDEX idx_service_employee
ON crm.customer_service_assignments(employee_id);
```

---

# 6. Business Workflow

```
Customer Created

↓

Customer Group Created

↓

Primary Advisor Assigned

↓

Relationship Manager Assigned

↓

Nominees Added

↓

Referral Recorded

↓

Customer Services Assigned

↓

Periodic Reviews
```

---

# 7. REST APIs

## Customer Group Advisors

GET    /api/v1/customer-groups/{id}/advisors

POST   /api/v1/customer-groups/{id}/advisors

PUT    /api/v1/customer-groups/{id}/advisors/{advisorId}

DELETE /api/v1/customer-groups/{id}/advisors/{advisorId}

---

## Customer Nominees

GET    /api/v1/customers/{id}/nominees

POST   /api/v1/customers/{id}/nominees

PUT    /api/v1/customers/{id}/nominees/{nomineeId}

DELETE /api/v1/customers/{id}/nominees/{nomineeId}

---

## Referrals

GET    /api/v1/customers/{id}/referrals

POST   /api/v1/customers/{id}/referrals

---

## Customer Services

GET    /api/v1/customer-services

POST   /api/v1/customer-services

PUT    /api/v1/customer-services/{id}

DELETE /api/v1/customer-services/{id}

---

# 8. Validation Rules

Customer Group Advisors

✓ Only one active Primary Advisor per Customer Group

✓ Effective To ≥ Effective From

✓ Advisor must be an Active Employee

---

Customer Nominees

✓ Allocation Percentage > 0

✓ Total Allocation = 100%

✓ Guardian required for Minor Nominee

---

Customer Referrals

✓ Referral Type Required

✓ Internal Referral must reference an Employee or Customer

---

Customer Service Assignments

✓ Service Type Required

✓ One active assignment per Employee/Service Type/Customer Group

✓ Completed Date ≥ Assigned Date