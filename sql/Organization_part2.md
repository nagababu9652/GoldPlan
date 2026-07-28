# ============================================================
# 8. Organization Core Tables
# ============================================================

The Organization Core defines the company hierarchy.

Foundation provides the "Person".

Organization provides the "Employment".

Identity provides the "Login".

------------------------------------------------------------

Entity Relationship

Foundation.Party
        │
        ▼
Organizations
        │
        ▼
Branches
        │
        ▼
Departments
        │
        ▼
Designations
        │
        ▼
Employees

------------------------------------------------------------

# Business Rules

BR-ORG-010

One Organization owns multiple Branches.

---

BR-ORG-011

Every Branch belongs to one Organization.

---

BR-ORG-012

Departments belong to a Branch.

---

BR-ORG-013

Employees belong to one Branch.

---

BR-ORG-014

Employees may transfer between branches while preserving history.

---

# 8.1 organizations

Business Purpose

Represents a registered advisory firm/company using Advisor Center.

```sql
CREATE TABLE organization.organizations
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_code           VARCHAR(30) NOT NULL,

    legal_name                  VARCHAR(250) NOT NULL,

    trade_name                  VARCHAR(250),

    registration_number         VARCHAR(100),

    pan_number                  VARCHAR(20),

    gst_number                  VARCHAR(20),

    email                       VARCHAR(150),

    phone                       VARCHAR(30),

    website                     VARCHAR(250),

    logo_url                    TEXT,

    financial_year_id           BIGINT,

    base_currency_id            BIGINT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    deleted_at                  TIMESTAMP,

    deleted_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT uq_org_code
        UNIQUE(organization_code)
);
```

Indexes

```sql
CREATE INDEX idx_org_name
ON organization.organizations(legal_name);

CREATE INDEX idx_org_pan
ON organization.organizations(pan_number);
```

---

# 8.2 branches

Business Purpose

Represents physical or virtual branches.

```sql
CREATE TABLE organization.branches
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    parent_branch_id            BIGINT,

    branch_code                 VARCHAR(30) NOT NULL,

    branch_name                 VARCHAR(200) NOT NULL,

    branch_type                 VARCHAR(50),

    manager_employee_id         BIGINT,

    email                       VARCHAR(150),

    phone                       VARCHAR(30),

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    deleted_at                  TIMESTAMP,

    deleted_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_branch_org
        FOREIGN KEY(organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT fk_parent_branch
        FOREIGN KEY(parent_branch_id)
        REFERENCES organization.branches(id),

    CONSTRAINT uq_branch_code
        UNIQUE(organization_id, branch_code)
);
```

Indexes

```sql
CREATE INDEX idx_branch_org
ON organization.branches(organization_id);

CREATE INDEX idx_branch_parent
ON organization.branches(parent_branch_id);
```

Business Rules

- Supports Head Office → Regional Office → Branch hierarchy.
- Branch codes are unique within an organization.
- Inactive branches cannot receive new customers.

---

# 8.3 departments

Business Purpose

Organizes employees within branches.

Examples

- Operations
- Sales
- Finance
- Compliance
- IT
- HR

```sql
CREATE TABLE organization.departments
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    branch_id                   BIGINT NOT NULL,

    department_code             VARCHAR(30) NOT NULL,

    department_name             VARCHAR(150) NOT NULL,

    description                 TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_department_org
        FOREIGN KEY(organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT fk_department_branch
        FOREIGN KEY(branch_id)
        REFERENCES organization.branches(id),

    CONSTRAINT uq_department
        UNIQUE(branch_id, department_code)
);
```

Indexes

```sql
CREATE INDEX idx_department_branch
ON organization.departments(branch_id);
```

---

# 8.4 designations

Business Purpose

Defines job titles.

Examples

- Managing Director
- Branch Manager
- Financial Advisor
- Relationship Manager
- Operations Executive
- Compliance Officer

```sql
CREATE TABLE organization.designations
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    designation_code            VARCHAR(30) NOT NULL,

    designation_name            VARCHAR(150) NOT NULL,

    hierarchy_level             INTEGER,

    description                 TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_designation_org
        FOREIGN KEY(organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT uq_designation
        UNIQUE(organization_id, designation_code)
);
```

Indexes

```sql
CREATE INDEX idx_designation_org
ON organization.designations(organization_id);

CREATE INDEX idx_designation_level
ON organization.designations(hierarchy_level);
```

---

# 8.5 organization_settings

Business Purpose

Stores configurable settings without altering the schema.

```sql
CREATE TABLE organization.organization_settings
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    setting_key                 VARCHAR(100) NOT NULL,

    setting_value               TEXT,

    data_type                   VARCHAR(30) DEFAULT 'STRING',

    category                    VARCHAR(50),

    description                 TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at                  TIMESTAMP,

    CONSTRAINT fk_setting_org
        FOREIGN KEY(organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT uq_org_setting
        UNIQUE(organization_id, setting_key)
);
```

Example Settings

```text
PASSWORD_EXPIRY_DAYS = 90

DEFAULT_LANGUAGE = en

DEFAULT_CURRENCY = INR

ENABLE_MFA = true

MAX_LOGIN_ATTEMPTS = 5

CUSTOMER_CODE_PREFIX = CUST

GROUP_CODE_PREFIX = GRP

AUTO_ASSIGN_CUSTOMER_CODE = true
```

---

# REST APIs

## Organizations

GET    /api/v1/organizations

POST   /api/v1/organizations

PUT    /api/v1/organizations/{id}

DELETE /api/v1/organizations/{id}

---

## Branches

GET    /api/v1/branches

POST   /api/v1/branches

PUT    /api/v1/branches/{id}

DELETE /api/v1/branches/{id}

---

## Departments

GET    /api/v1/departments

POST   /api/v1/departments

PUT    /api/v1/departments/{id}

DELETE /api/v1/departments/{id}

---

## Designations

GET    /api/v1/designations

POST   /api/v1/designations

PUT    /api/v1/designations/{id}

DELETE /api/v1/designations/{id}

---

# Validation Rules

Organizations

✓ Organization Code Unique

✓ PAN Unique

✓ GST Validation

✓ Legal Name Required

Branches

✓ Branch Code Unique per Organization

✓ Parent Branch Cannot Reference Itself

Departments

✓ Department Code Unique within Branch

✓ Department Name Required

Designations

✓ Designation Code Unique per Organization

✓ Hierarchy Level ≥ 1

Organization Settings

✓ Unique Setting Key per Organization