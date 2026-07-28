# Advisor Center
# Software Design Specification (SDS)

# CRM Module – Part 1
# Customer Groups & Customers

---

| Property | Value |
|----------|-------|
| Document ID | SDS-CRM-101 |
| Module | CRM |
| Part | 1 |
| Version | 1.0 |
| Schema | crm |
| Database | PostgreSQL 16+ |

---

# Table of Contents

1. Introduction
2. Business Overview
3. Customer Lifecycle
4. Business Rules
5. Entity Relationship
6. Database Tables
7. CREATE TABLE Statements
8. Seed Data
9. APIs
10. Validation Rules

---

# 1. Introduction

The Customer Group is the primary business entity within Advisor Center.

Every customer belongs to exactly one Customer Group.

When a new customer is created:

1. A new Customer Group is automatically created.
2. The customer becomes the Group Head.
3. Group contains only one member.
4. Advisors may later assign additional family members.

This approach enables:

- Family Financial Planning
- Group Investments
- Family Reports
- Group Risk Analysis
- Estate Planning

---

# 2. Business Overview

```
Customer Group

↓

Group Head

↓

Members

↓

Investments

↓

Financial Planning

↓

Reports
```

---

# 3. Customer Lifecycle

```
Create Customer

↓

Create Customer Group

↓

Assign Group Code

↓

Customer becomes Group Head

↓

Complete KYC

↓

Assign Advisor

↓

Add Family Members

↓

Investments

↓

Reports

↓

Archive
```

---

# 4. Business Rules

CRM-100

Customer Group is mandatory.

---

CRM-101

Every Customer belongs to exactly one active Customer Group.

---

CRM-102

Each Customer Group has one and only one Group Head.

---

CRM-103

Creating a Customer automatically creates a Customer Group if no existing group is selected.

---

CRM-104

Group Codes are unique within an Organization.

---

CRM-105

Customer Codes are unique within an Organization.

---

CRM-106

Group Head must always be an active member of the group.

---

CRM-107

Deleting a Customer is not allowed.

Customers are marked Inactive.

---

CRM-108

Customer history must be retained permanently.

---

# 5. Entity Relationship

```
Organizations
        │
        ▼
Customer Groups
        │
        ▼
Group Members
        │
        ▼
Customers
```

---

# 6. Database Tables

Core Tables

- customer_groups
- customers
- group_members

---

Supporting Tables

- customer_status_history

---

# 7. CREATE TABLE Statements

## customer_groups

Business Purpose

Represents a family or financial planning group.

```sql
CREATE TABLE crm.customer_groups
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    group_code                  VARCHAR(30) NOT NULL,

    group_name                  VARCHAR(250) NOT NULL,

    group_type                  VARCHAR(30) DEFAULT 'INDIVIDUAL',

    head_customer_id            BIGINT,

    primary_branch_id           BIGINT,

    primary_advisor_employee_id BIGINT,

    risk_profile                VARCHAR(30),

    investment_objective        VARCHAR(100),

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_group_org
        FOREIGN KEY (organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT fk_group_branch
        FOREIGN KEY (primary_branch_id)
        REFERENCES organization.branches(id),

    CONSTRAINT fk_group_advisor
        FOREIGN KEY (primary_advisor_employee_id)
        REFERENCES organization.employees(id),

    CONSTRAINT uq_group_code
        UNIQUE (organization_id, group_code)
);
```

Indexes

```sql
CREATE INDEX idx_group_org
ON crm.customer_groups(organization_id);

CREATE INDEX idx_group_branch
ON crm.customer_groups(primary_branch_id);

CREATE INDEX idx_group_advisor
ON crm.customer_groups(primary_advisor_employee_id);
```

---

## customers

Business Purpose

Stores customer-specific information.

```sql
CREATE TABLE crm.customers
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    party_id                    BIGINT NOT NULL,

    customer_code               VARCHAR(30) NOT NULL,

    occupation                  VARCHAR(150),

    annual_income               NUMERIC(18,2),

    net_worth                   NUMERIC(18,2),

    risk_profile                VARCHAR(30),

    tax_category                VARCHAR(50),

    resident_status             VARCHAR(30),

    onboarding_date             DATE,

    customer_status             VARCHAR(30) DEFAULT 'ACTIVE',

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_customer_org
        FOREIGN KEY (organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT fk_customer_party
        FOREIGN KEY (party_id)
        REFERENCES foundation.parties(id),

    CONSTRAINT uq_customer_code
        UNIQUE (organization_id, customer_code),

    CONSTRAINT uq_customer_party
        UNIQUE (organization_id, party_id)
);
```

Indexes

```sql
CREATE INDEX idx_customer_party
ON crm.customers(party_id);

CREATE INDEX idx_customer_status
ON crm.customers(customer_status);

CREATE INDEX idx_customer_risk
ON crm.customers(risk_profile);
```

---

## group_members

Business Purpose

Maps customers to customer groups.

```sql
CREATE TABLE crm.group_members
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_group_id           BIGINT NOT NULL,

    customer_id                 BIGINT NOT NULL,

    relationship_type           VARCHAR(50),

    is_group_head               BOOLEAN DEFAULT FALSE,

    joined_on                   DATE DEFAULT CURRENT_DATE,

    left_on                     DATE,

    remarks                     TEXT,

    CONSTRAINT fk_member_group
        FOREIGN KEY(customer_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_member_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT uq_group_member
        UNIQUE(customer_group_id, customer_id)
);
```

Indexes

```sql
CREATE INDEX idx_group_member_group
ON crm.group_members(customer_group_id);

CREATE INDEX idx_group_member_customer
ON crm.group_members(customer_id);
```

---

## customer_status_history

Business Purpose

Maintains complete history of customer status changes.

```sql
CREATE TABLE crm.customer_status_history
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id             BIGINT NOT NULL,

    old_status              VARCHAR(30),

    new_status              VARCHAR(30) NOT NULL,

    changed_on              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    changed_by              BIGINT,

    reason                  TEXT,

    CONSTRAINT fk_status_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id)
);
```

---

# 8. Sample Seed Data

```sql
INSERT INTO crm.customer_groups
(group_code, group_name, organization_id)
VALUES
('GRP000001', 'Ramesh Family', 1);

INSERT INTO crm.customers
(customer_code, organization_id, party_id, onboarding_date)
VALUES
('CUS000001', 1, 1001, CURRENT_DATE);

INSERT INTO crm.group_members
(customer_group_id, customer_id, is_group_head)
VALUES
(1, 1, TRUE);
```

---

# 9. REST APIs

## Customer Groups

GET    /api/v1/customer-groups

GET    /api/v1/customer-groups/{id}

POST   /api/v1/customer-groups

PUT    /api/v1/customer-groups/{id}

DELETE /api/v1/customer-groups/{id}

POST   /api/v1/customer-groups/{id}/change-head

---

## Customers

GET    /api/v1/customers

GET    /api/v1/customers/{id}

POST   /api/v1/customers

PUT    /api/v1/customers/{id}

DELETE /api/v1/customers/{id}

---

# 10. Validation Rules

Customer Groups

✓ Group Code Unique

✓ Group Name Required

✓ One Active Group Head

✓ Organization Required

Customers

✓ Customer Code Unique

✓ One Customer per Party per Organization

✓ Status Required

Group Members

✓ Customer cannot belong to multiple active groups

✓ Group Head must be a member

✓ Only one Group Head per group

Customer Status History

✓ Every status change must be logged

✓ Status history cannot be deleted