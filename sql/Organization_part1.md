# Advisor Center
# Software Design Specification (SDS)

# Organization Management Module

------------------------------------------------------------

| Property | Value |
|----------|-------|
| Document ID | SDS-ORG-001 |
| Module | Organization Management |
| Version | 1.0 |
| Schema | organization |
| Database | PostgreSQL 16 |

------------------------------------------------------------

# Table of Contents

1. Introduction
2. Objectives
3. Scope
4. Module Architecture
5. Organization Hierarchy
6. Business Rules
7. Database Tables
8. APIs
9. Future Enhancements

------------------------------------------------------------

# 1. Introduction

The Organization Module manages the entire organizational hierarchy of Advisor Center.

It defines

• Organizations

• Branches

• Departments

• Designations

• Employees

• Advisors

• Associates

• Reporting Structure

This module references

Foundation Module

Identity Module

CRM Module

------------------------------------------------------------

# 2. Objectives

✔ Multi Organization Support

✔ Multi Branch Support

✔ Employee Management

✔ Advisor Management

✔ Reporting Hierarchy

✔ Branch Level Security

✔ Department Management

✔ Organization Settings

------------------------------------------------------------

# 3. Scope

Included

Organization

Branch

Department

Designation

Employee

Advisor

Associate

Reporting Hierarchy

Organization Settings

Not Included

Customer Management

Investment

Insurance

Accounting

Reports

------------------------------------------------------------

# 4. Module Architecture

```
                    Organization

                          │

        ┌─────────────────┼──────────────────┐

        ▼                 ▼                  ▼

 Organization         Branches          Departments

        │                 │                  │

        └─────────────────┼──────────────────┘

                          ▼

                     Employees

                          │

                ┌─────────┴─────────┐

                ▼                   ▼

            Advisors          Associates

                          │

                          ▼

                 Reporting Hierarchy
```

------------------------------------------------------------

# 5. Organization Hierarchy

```
Company

│

├── Branch

│     ├── Department

│     │      ├── Employees

│     │      ├── Advisors

│     │      └── Associates

│

├── Branch

│

└── Branch
```

------------------------------------------------------------

# 6. Business Rules

BR-ORG-001

One Organization can have multiple Branches.

---

BR-ORG-002

One Branch belongs to only one Organization.

---

BR-ORG-003

Employees belong to one Branch.

---

BR-ORG-004

Employees belong to one Department.

---

BR-ORG-005

One Employee may supervise multiple Employees.

---

BR-ORG-006

Advisors are Employees with advisor-specific information.

---

BR-ORG-007

Associates may optionally report to Advisors.

---

BR-ORG-008

Inactive Branches cannot receive new Customers.

---

BR-ORG-009

Organization Settings override system defaults where permitted.

------------------------------------------------------------

# 7. Database Tables

## Core

organizations

branches

organization_settings

------------------------------------------------------------

## Structure

departments

designations

employee_reporting

------------------------------------------------------------

## Human Resources

employees

employee_contacts

employee_documents

------------------------------------------------------------

## Advisor Network

advisors

associates

advisor_associates

------------------------------------------------------------

Total

11 Tables

------------------------------------------------------------

# Entity Relationship

```
Foundation.Parties
        │
        ▼
Employees
        │
        ▼
Advisors
        │
        ▼
Associates

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

Employees
      │
      ▼
Employee Reporting
```

------------------------------------------------------------

# APIs

Organizations

GET /api/v1/organizations

POST /api/v1/organizations

PUT /api/v1/organizations/{id}

DELETE /api/v1/organizations/{id}

Branches

GET /api/v1/branches

POST /api/v1/branches

Departments

GET /api/v1/departments

POST /api/v1/departments

Employees

GET /api/v1/employees

POST /api/v1/employees

PUT /api/v1/employees/{id}

Advisors

GET /api/v1/advisors

POST /api/v1/advisors

Associates

GET /api/v1/associates

POST /api/v1/associates

------------------------------------------------------------

# Future Enhancements

• Branch Targets

• Employee Attendance

• Leave Management

• Payroll Integration

• Advisor Commission Engine

• Branch KPI Dashboard

• HRMS Integration

• Recruitment Module

• Employee Performance Reviews

• Organization Analytics
