# Advisor Center
# Software Design Specification (SDS)

# Customer Relationship Management (CRM) Module

---

| Property | Value |
|----------|-------|
| Document ID | SDS-CRM-001 |
| Module | Customer Relationship Management |
| Version | 1.0 |
| Schema | crm |
| Database | PostgreSQL 16+ |

---

# Table of Contents

1. Introduction
2. Objectives
3. Scope
4. CRM Architecture
5. Customer Lifecycle
6. Business Rules
7. Database Tables
8. Entity Relationship
9. APIs
10. Future Enhancements

---

# 1. Introduction

The CRM Module is the central business module of Advisor Center.

Unlike traditional CRMs that treat the Customer as the primary entity,
Advisor Center treats the **Customer Group** as the primary business object.

Every customer always belongs to exactly one Customer Group.

Initially, every new customer is automatically placed into a newly created
Customer Group containing only themselves.

As relationships evolve, customer groups may be:

- merged
- split
- reorganized
- assigned new heads
- assigned advisors
- transferred between branches

This design matches real-world financial advisory firms where investments,
reports and financial planning are managed at the family/group level.

---

# 2. Objectives

✔ Customer Group Management

✔ Customer Management

✔ Family Management

✔ Group Merge

✔ Group Split

✔ Customer Merge

✔ Customer Transfers

✔ Advisor Assignment

✔ Customer Search

✔ Customer Import

✔ Customer Status Management

---

# 3. Scope

Included

Customer Groups

Customers

Family Management

Advisor Assignment

Customer Relationships

Nominees

KYC Status

Communication Preferences

Customer Browser

Import

Merge

Split

Not Included

Investments

Insurance

Accounting

Reports

Workflow

---

# 4. CRM Architecture

```
                    Customer Group
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
     Customers                     Group Relationships
         │
         ├──────────────┐
         ▼              ▼
 Customer KYC     Customer Contacts
         │
         ▼
 Communication Preferences

Customer Group
        │
        ▼
Advisor Assignment

Customer Group
        │
        ▼
Nominees
```

---

# 5. Customer Lifecycle

```
Create Customer

↓

Automatically Create Customer Group

↓

Customer becomes Group Head

↓

Assign Advisor

↓

Complete KYC

↓

Add Family Members

↓

Investments

↓

Reports

↓

Reviews

↓

Archive
```

---

# 6. Business Rules

CRM-001

Customer Group is the primary business entity.

---

CRM-002

Every Customer belongs to exactly one Customer Group.

---

CRM-003

Creating a Customer automatically creates a new Customer Group if one is not specified.

---

CRM-004

Initially, the Customer is the Group Head.

---

CRM-005

A Group always has exactly one active Group Head.

---

CRM-006

Groups may be merged.

---

CRM-007

Groups may be split.

---

CRM-008

Customers may be merged if they represent duplicate records.

---

CRM-009

Customer history is never deleted.

---

CRM-010

Inactive customers remain available for historical reports.

---

# 7. Database Tables

## Core

customer_groups

customers

group_members

---

## Relationships

customer_relationships

group_merge_history

group_split_history

customer_merge_history

---

## Customer Information

customer_kyc

customer_contacts

communication_preferences

nominees

---

## Operations

customer_advisors

customer_import_batches

customer_import_errors

customer_browser_settings

customer_status_history

---

Total Tables

15

---

# Entity Relationship

```
Customer Groups
        │
        ▼
Group Members
        │
        ▼
Customers
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
KYC   Contacts    Communication
 │
 ▼
Nominees

Customer Groups
      │
      ▼
Customer Advisors

Customer Groups
      │
      ▼
Merge History

Customer Groups
      │
      ▼
Split History
```

---

# APIs

Customer Groups

GET /api/v1/customer-groups

POST /api/v1/customer-groups

PUT /api/v1/customer-groups/{id}

POST /api/v1/customer-groups/{id}/merge

POST /api/v1/customer-groups/{id}/split

POST /api/v1/customer-groups/{id}/change-head

---

Customers

GET /api/v1/customers

POST /api/v1/customers

PUT /api/v1/customers/{id}

DELETE /api/v1/customers/{id}

POST /api/v1/customers/{id}/merge

---

Advisor Assignment

POST /api/v1/customer-groups/{id}/assign-advisor

POST /api/v1/customer-groups/{id}/remove-advisor

---

Import

POST /api/v1/customers/import

GET /api/v1/customers/import/status

---

Browser

GET /api/v1/customer-browser

POST /api/v1/customer-browser/settings

---

# Future Enhancements

- Duplicate Detection Engine
- AI Customer Matching
- WhatsApp Integration
- Email Campaigns
- Customer Timeline
- Customer Activities
- CRM Notes
- Document Sharing
- Digital KYC
- e-Sign Integration