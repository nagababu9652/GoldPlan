# ============================================================
# 9. Employee & Workforce Management
# ============================================================

The Employee subsystem manages all personnel employed by an organization.

Identity Module manages authentication.

Foundation Module manages personal information.

Organization Module manages employment.

------------------------------------------------------------

Entity Relationship

```
Foundation.Parties
        │
        ▼
Employees
        │
        ├──────────────┐
        ▼              ▼
Employee Roles   Employee Reporting
        │
        ▼
Employee Branch History
        │
        ▼
Employee Department History
```

------------------------------------------------------------

# Business Rules

BR-ORG-020

Every Employee references one Party.

---

BR-ORG-021

Every Employee belongs to one Organization.

---

BR-ORG-022

Every Employee belongs to one Branch.

---

BR-ORG-023

Every Employee belongs to one Department.

---

BR-ORG-024

Employees may have multiple Roles.

---

BR-ORG-025

Employees may change Branches.

History must be preserved.

---

BR-ORG-026

Employees may change Departments.

History must be preserved.

---

BR-ORG-027

One Employee may supervise many Employees.

------------------------------------------------------------

# 9.1 employees

Business Purpose

Stores employment information.

```sql
CREATE TABLE organization.employees
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    party_id                    BIGINT NOT NULL,

    employee_code               VARCHAR(30) NOT NULL,

    branch_id                   BIGINT NOT NULL,

    department_id               BIGINT NOT NULL,

    designation_id              BIGINT NOT NULL,

    joining_date                DATE NOT NULL,

    confirmation_date           DATE,

    relieving_date              DATE,

    employment_status           VARCHAR(30) DEFAULT 'ACTIVE',

    official_email              VARCHAR(150),

    official_mobile             VARCHAR(30),

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    deleted_at                  TIMESTAMP,

    deleted_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_employee_org
        FOREIGN KEY(organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT fk_employee_party
        FOREIGN KEY(party_id)
        REFERENCES foundation.parties(id),

    CONSTRAINT fk_employee_branch
        FOREIGN KEY(branch_id)
        REFERENCES organization.branches(id),

    CONSTRAINT fk_employee_department
        FOREIGN KEY(department_id)
        REFERENCES organization.departments(id),

    CONSTRAINT fk_employee_designation
        FOREIGN KEY(designation_id)
        REFERENCES organization.designations(id),

    CONSTRAINT uq_employee_code
        UNIQUE(organization_id, employee_code),

    CONSTRAINT uq_employee_party
        UNIQUE(organization_id, party_id)
);
```

Indexes

```sql
CREATE INDEX idx_employee_branch
ON organization.employees(branch_id);

CREATE INDEX idx_employee_department
ON organization.employees(department_id);

CREATE INDEX idx_employee_party
ON organization.employees(party_id);
```

---

# 9.2 employee_roles

Business Purpose

Assigns business roles to employees.

Examples

- Financial Advisor
- Associate
- Branch Manager
- Regional Manager
- Compliance Officer
- Operations Executive

```sql
CREATE TABLE organization.employee_roles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id             BIGINT NOT NULL,

    role_id                 BIGINT NOT NULL,

    effective_from          DATE NOT NULL,

    effective_to            DATE,

    is_primary              BOOLEAN DEFAULT FALSE,

    assigned_by             BIGINT,

    assigned_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_role_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id),

    CONSTRAINT fk_emp_role_identity
        FOREIGN KEY(role_id)
        REFERENCES identity.roles(id)
);
```

Indexes

```sql
CREATE INDEX idx_emp_role_employee
ON organization.employee_roles(employee_id);

CREATE INDEX idx_emp_role_role
ON organization.employee_roles(role_id);
```

---

# 9.3 employee_reporting

Business Purpose

Stores reporting hierarchy.

```sql
CREATE TABLE organization.employee_reporting
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id             BIGINT NOT NULL,

    manager_employee_id     BIGINT NOT NULL,

    effective_from          DATE,

    effective_to            DATE,

    CONSTRAINT fk_reporting_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id),

    CONSTRAINT fk_reporting_manager
        FOREIGN KEY(manager_employee_id)
        REFERENCES organization.employees(id)
);
```

Business Rules

- One employee has one reporting manager at a time.
- CEO/Owner may have no manager.
- Historical reporting changes are retained.

---

# 9.4 employee_branch_history

Business Purpose

Tracks transfers between branches.

```sql
CREATE TABLE organization.employee_branch_history
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id             BIGINT NOT NULL,

    branch_id               BIGINT NOT NULL,

    effective_from          DATE,

    effective_to            DATE,

    remarks                 TEXT,

    CONSTRAINT fk_branch_history_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id),

    CONSTRAINT fk_branch_history_branch
        FOREIGN KEY(branch_id)
        REFERENCES organization.branches(id)
);
```

---

# 9.5 employee_department_history

Business Purpose

Tracks department changes.

```sql
CREATE TABLE organization.employee_department_history
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id             BIGINT NOT NULL,

    department_id           BIGINT NOT NULL,

    effective_from          DATE,

    effective_to            DATE,

    remarks                 TEXT,

    CONSTRAINT fk_department_history_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id),

    CONSTRAINT fk_department_history_department
        FOREIGN KEY(department_id)
        REFERENCES organization.departments(id)
);
```

---

# Workflow

```
Foundation Party
        │
        ▼
Create Employee
        │
        ▼
Assign Branch
        │
        ▼
Assign Department
        │
        ▼
Assign Designation
        │
        ▼
Assign Roles
        │
        ▼
Assign Reporting Manager
        │
        ▼
Employee Active
```

---

# REST APIs

Employees

GET    /api/v1/employees

GET    /api/v1/employees/{id}

POST   /api/v1/employees

PUT    /api/v1/employees/{id}

DELETE /api/v1/employees/{id}

Employee Roles

POST   /api/v1/employees/{id}/roles

DELETE /api/v1/employees/{id}/roles/{roleId}

Employee Reporting

POST   /api/v1/employees/{id}/manager

PUT    /api/v1/employees/{id}/manager

Employee Transfers

POST   /api/v1/employees/{id}/branch-transfer

POST   /api/v1/employees/{id}/department-transfer

---

# Validation Rules

Employees

✓ Employee Code Unique

✓ One Active Employment per Organization

✓ Joining Date Required

✓ Relieving Date ≥ Joining Date

Employee Roles

✓ No overlapping effective periods for the same role

✓ Only one Primary Role

Reporting

✓ Employee cannot report to themselves

✓ Circular reporting hierarchy not allowed

History

✓ Branch history must not overlap

✓ Department history must not overlap