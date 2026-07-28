# ============================================================
# 10. Employee Assignments & Organization Administration
# ============================================================

This section defines how employees are assigned responsibilities
within the organization.

Instead of creating separate tables for Advisors, Associates,
Relationship Managers, Branch Managers, etc., Advisor Center uses
a generic assignment model.

This allows an employee to perform multiple responsibilities
simultaneously while maintaining complete assignment history.

------------------------------------------------------------

# Entity Relationship

```
Employees
      │
      ▼
Employee Roles
      │
      ▼
Employee Assignments
      │
      ├──────────────┐
      ▼              ▼
Branches        Customer Groups
      │              │
      ▼              ▼
Departments     Customers

Employees
      │
      ▼
Employee Skills

Employees
      │
      ▼
Employee Certifications
```

------------------------------------------------------------

# Business Rules

BR-ORG-040

One employee may have multiple assignments.

---

BR-ORG-041

Assignments have validity periods.

---

BR-ORG-042

Assignments cannot overlap for the same assignment type.

---

BR-ORG-043

An employee may be responsible for multiple branches.

---

BR-ORG-044

A customer group can have only one Primary Advisor at a time.

---

BR-ORG-045

Assignment history must never be deleted.

------------------------------------------------------------

# 10.1 employee_assignments

Business Purpose

Stores all operational assignments.

Supported Assignment Types

- PRIMARY_ADVISOR
- SECONDARY_ADVISOR
- RELATIONSHIP_MANAGER
- BRANCH_MANAGER
- DEPARTMENT_HEAD
- COMPLIANCE_OFFICER
- REPORT_APPROVER
- REVIEWER
- TEAM_LEADER

```sql
CREATE TABLE organization.employee_assignments
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id                 BIGINT NOT NULL,

    assignment_type             VARCHAR(50) NOT NULL,

    entity_type                 VARCHAR(50) NOT NULL,

    entity_id                   BIGINT NOT NULL,

    effective_from              DATE NOT NULL,

    effective_to                DATE,

    is_primary                  BOOLEAN DEFAULT FALSE,

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    version_no                  INTEGER DEFAULT 1,

    is_active                   BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_assignment_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id)
);
```

Indexes

```sql
CREATE INDEX idx_assignment_employee
ON organization.employee_assignments(employee_id);

CREATE INDEX idx_assignment_entity
ON organization.employee_assignments(entity_type, entity_id);

CREATE INDEX idx_assignment_type
ON organization.employee_assignments(assignment_type);
```

------------------------------------------------------------

# 10.2 employee_skills

Business Purpose

Stores employee skills and competencies.

Examples

- Mutual Funds
- Insurance
- Tax Planning
- Retirement Planning
- Wealth Management
- Financial Planning
- CRM
- Compliance

```sql
CREATE TABLE organization.employee_skills
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id                 BIGINT NOT NULL,

    skill_name                  VARCHAR(150) NOT NULL,

    proficiency_level           SMALLINT,

    certified                   BOOLEAN DEFAULT FALSE,

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_skill_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id)
);
```

------------------------------------------------------------

# 10.3 employee_certifications

Business Purpose

Stores licenses and professional certifications.

Examples

- NISM
- AMFI
- IRDA
- CFP
- CFA
- CA
- SEBI Registration

```sql
CREATE TABLE organization.employee_certifications
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    employee_id                 BIGINT NOT NULL,

    certification_name          VARCHAR(200) NOT NULL,

    certificate_number          VARCHAR(100),

    issuing_authority           VARCHAR(200),

    issue_date                  DATE,

    expiry_date                 DATE,

    verification_status         VARCHAR(30) DEFAULT 'PENDING',

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_certificate_employee
        FOREIGN KEY(employee_id)
        REFERENCES organization.employees(id)
);
```

------------------------------------------------------------

# 10.4 organization_holidays

Business Purpose

Maintains organization-specific holiday calendar.

```sql
CREATE TABLE organization.organization_holidays
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    branch_id                   BIGINT,

    holiday_date                DATE NOT NULL,

    holiday_name                VARCHAR(200) NOT NULL,

    holiday_type                VARCHAR(30),

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_holiday_org
        FOREIGN KEY(organization_id)
        REFERENCES organization.organizations(id),

    CONSTRAINT fk_holiday_branch
        FOREIGN KEY(branch_id)
        REFERENCES organization.branches(id)
);
```

------------------------------------------------------------

# Assignment Workflow

```
Employee Created
        │
        ▼
Assign Role
        │
        ▼
Assign Branch
        │
        ▼
Assign Department
        │
        ▼
Assign Responsibilities
        │
        ▼
Employee Starts Working
```

------------------------------------------------------------

# Example Assignments

| Employee | Assignment | Entity |
|-----------|------------|--------|
| Ravi | Branch Manager | Hyderabad Branch |
| Ravi | Primary Advisor | Customer Group 105 |
| Ravi | Report Reviewer | Investment Reports |
| Priya | Compliance Officer | Organization |
| Kumar | Relationship Manager | Customer Group 220 |

------------------------------------------------------------

# REST APIs

Employee Assignments

GET    /api/v1/employee-assignments

POST   /api/v1/employee-assignments

PUT    /api/v1/employee-assignments/{id}

DELETE /api/v1/employee-assignments/{id}

Employee Skills

GET    /api/v1/employees/{id}/skills

POST   /api/v1/employees/{id}/skills

Employee Certifications

GET    /api/v1/employees/{id}/certifications

POST   /api/v1/employees/{id}/certifications

Organization Holidays

GET    /api/v1/holidays

POST   /api/v1/holidays

PUT    /api/v1/holidays/{id}

DELETE /api/v1/holidays/{id}

------------------------------------------------------------

# Validation Rules

Employee Assignments

✓ Effective From is mandatory

✓ Effective To ≥ Effective From

✓ Only one Primary Assignment for the same Entity

✓ No overlapping assignment periods

Employee Skills

✓ Proficiency Level between 1 and 5

✓ Skill Name Required

Employee Certifications

✓ Expiry Date ≥ Issue Date

✓ Certificate Number optional

Organization Holidays

✓ Holiday Date required

✓ Duplicate holidays for the same branch not allowed

------------------------------------------------------------

# Seed Assignment Types

```text
PRIMARY_ADVISOR

SECONDARY_ADVISOR

RELATIONSHIP_MANAGER

BRANCH_MANAGER

DEPARTMENT_HEAD

COMPLIANCE_OFFICER

OPERATIONS_MANAGER

TEAM_LEADER

QUALITY_REVIEWER

REPORT_APPROVER

SYSTEM_ADMIN
```

------------------------------------------------------------

# Organization Module Summary

## Core Structure

- organizations
- branches
- departments
- designations
- organization_settings

## Workforce

- employees
- employee_roles
- employee_reporting
- employee_branch_history
- employee_department_history

## Administration

- employee_assignments
- employee_skills
- employee_certifications
- organization_holidays

**Total Tables:** 14

------------------------------------------------------------

# Ready for CRM Module

The Organization module now provides:

- Multi-organization support
- Multi-branch hierarchy
- Department structure
- Employee lifecycle
- Flexible role assignments
- Reporting hierarchy
- Skills and certifications
- Assignment engine

These capabilities form the foundation for the CRM module, where employees will be assigned to customer groups, individual customers, investment portfolios, and workflows.