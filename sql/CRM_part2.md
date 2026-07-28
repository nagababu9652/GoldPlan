# Advisor Center
# Software Design Specification (SDS)

# CRM Module – Part 2
# Group Management & Customer Relationships

---

| Property | Value |
|----------|-------|
| Document ID | SDS-CRM-102 |
| Module | CRM |
| Part | 2 |
| Version | 1.0 |
| Schema | crm |

---

# Table of Contents

1. Introduction
2. Business Rules
3. Relationship Model
4. Database Tables
5. CREATE TABLE Statements
6. Merge Workflow
7. Split Workflow
8. APIs
9. Validation Rules

---

# 1. Introduction

This module manages family relationships and customer group operations.

Unlike traditional CRMs, Advisor Center allows:

- Group Merge
- Bulk Group Merge
- Customer Merge
- Bulk Customer Merge
- Group Split
- Change Group Head
- Member Reordering
- Group Renumbering

All operations are fully auditable.

No customer or group is physically deleted.

---

# 2. Business Rules

CRM-201

Groups may be merged.

---

CRM-202

Groups may be split.

---

CRM-203

Customers may be merged if they are duplicates.

---

CRM-204

Merge operations are permanent business events.

---

CRM-205

Every merge operation is recorded.

---

CRM-206

Every split operation is recorded.

---

CRM-207

Customer relationship history is retained.

---

CRM-208

One customer belongs to only one active group.

---

# 3. Relationship Model

```
Customer Group

│

├── Head

├── Spouse

├── Son

├── Daughter

├── Father

├── Mother

└── Others
```

---

# 4. Database Tables

Relationship

- customer_relationships

Operations

- group_merge_history
- group_split_history
- customer_merge_history

Administration

- group_member_order

---

# 5. CREATE TABLE Statements

## customer_relationships

Business Purpose

Stores relationships between members inside a group.

```sql
CREATE TABLE crm.customer_relationships
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_group_id           BIGINT NOT NULL,

    customer_id                 BIGINT NOT NULL,

    related_customer_id         BIGINT NOT NULL,

    relationship_type           VARCHAR(50) NOT NULL,

    remarks                     TEXT,

    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rel_group
        FOREIGN KEY(customer_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_rel_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_rel_related
        FOREIGN KEY(related_customer_id)
        REFERENCES crm.customers(id)
);
```

Indexes

```sql
CREATE INDEX idx_customer_relationship_group
ON crm.customer_relationships(customer_group_id);

CREATE INDEX idx_customer_relationship_customer
ON crm.customer_relationships(customer_id);
```

---

## group_merge_history

Business Purpose

Stores all customer group merge operations.

```sql
CREATE TABLE crm.group_merge_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    source_group_id             BIGINT NOT NULL,

    target_group_id             BIGINT NOT NULL,

    merged_by                   BIGINT,

    merged_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    merge_reason                TEXT,

    remarks                     TEXT,

    CONSTRAINT fk_merge_source
        FOREIGN KEY(source_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_merge_target
        FOREIGN KEY(target_group_id)
        REFERENCES crm.customer_groups(id)
);
```

---

## group_split_history

Business Purpose

Stores all group split operations.

```sql
CREATE TABLE crm.group_split_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    original_group_id           BIGINT NOT NULL,

    new_group_id                BIGINT NOT NULL,

    split_by                    BIGINT,

    split_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    split_reason                TEXT,

    remarks                     TEXT,

    CONSTRAINT fk_split_original
        FOREIGN KEY(original_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_split_new
        FOREIGN KEY(new_group_id)
        REFERENCES crm.customer_groups(id)
);
```

---

## customer_merge_history

Business Purpose

Stores duplicate customer merge history.

```sql
CREATE TABLE crm.customer_merge_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    source_customer_id          BIGINT NOT NULL,

    target_customer_id          BIGINT NOT NULL,

    merged_by                   BIGINT,

    merged_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    merge_reason                TEXT,

    remarks                     TEXT,

    CONSTRAINT fk_customer_merge_source
        FOREIGN KEY(source_customer_id)
        REFERENCES crm.customers(id),

    CONSTRAINT fk_customer_merge_target
        FOREIGN KEY(target_customer_id)
        REFERENCES crm.customers(id)
);
```

---

## group_member_order

Business Purpose

Stores the display/order sequence of members within a customer group.

```sql
CREATE TABLE crm.group_member_order
(
    customer_group_id       BIGINT NOT NULL,

    customer_id             BIGINT NOT NULL,

    display_order           INTEGER NOT NULL,

    PRIMARY KEY(customer_group_id, customer_id),

    CONSTRAINT fk_order_group
        FOREIGN KEY(customer_group_id)
        REFERENCES crm.customer_groups(id),

    CONSTRAINT fk_order_customer
        FOREIGN KEY(customer_id)
        REFERENCES crm.customers(id)
);
```

---

# 6. Group Merge Workflow

```
Select Source Groups

↓

Validate Groups

↓

Select Target Group

↓

Move Members

↓

Update Relationships

↓

Record Merge History

↓

Deactivate Source Group
```

---

# 7. Group Split Workflow

```
Select Existing Group

↓

Choose Members

↓

Create New Group

↓

Move Members

↓

Assign Group Head

↓

Update Relationships

↓

Record Split History
```

---

# 8. REST APIs

## Relationships

GET    /api/v1/customer-relationships

POST   /api/v1/customer-relationships

PUT    /api/v1/customer-relationships/{id}

DELETE /api/v1/customer-relationships/{id}

---

## Group Merge

POST   /api/v1/customer-groups/merge

POST   /api/v1/customer-groups/merge/bulk

---

## Group Split

POST   /api/v1/customer-groups/split

---

## Customer Merge

POST   /api/v1/customers/merge

POST   /api/v1/customers/merge/bulk

---

## Member Order

PUT    /api/v1/customer-groups/{id}/member-order

---

# 9. Validation Rules

Relationships

✓ Relationship Type Required

✓ Related Customer must belong to same Group

Group Merge

✓ Source and Target Groups cannot be the same

✓ Source Group must be Active

✓ Target Group must be Active

Group Split

✓ At least one member must remain in original Group

✓ New Group must have exactly one Group Head

Customer Merge

✓ Source and Target Customers cannot be the same

✓ Source Customer becomes inactive after merge

Member Order

✓ Display Order must be unique within a Group

✓ Display Order starts from 1