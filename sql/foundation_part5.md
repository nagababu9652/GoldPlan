# ============================================================
# 26. Database Views
# ============================================================

Views simplify reporting and eliminate repetitive joins.

---

## 26.1 vw_party_summary

Business Purpose

Provides a consolidated view of Party information with primary contact and address.

```sql
CREATE OR REPLACE VIEW foundation.vw_party_summary AS
SELECT
    p.id,
    p.party_code,
    p.display_name,
    p.party_type_id,
    pc.contact_value AS primary_contact,
    pa.address_line1,
    c.city_name,
    s.state_name,
    co.country_name
FROM foundation.parties p
LEFT JOIN foundation.party_contacts pc
       ON p.id = pc.party_id
      AND pc.is_primary = TRUE
LEFT JOIN foundation.party_addresses pa
       ON p.id = pa.party_id
      AND pa.is_primary = TRUE
LEFT JOIN foundation.cities c
       ON pa.city_id = c.id
LEFT JOIN foundation.states s
       ON pa.state_id = s.id
LEFT JOIN foundation.countries co
       ON pa.country_id = co.id;
```

---

## 26.2 vw_document_summary

```sql
CREATE OR REPLACE VIEW foundation.vw_document_summary AS
SELECT
    d.id,
    d.entity_type,
    d.entity_id,
    dt.type_name,
    df.original_file_name,
    df.file_size_bytes,
    d.is_verified
FROM foundation.documents d
JOIN foundation.document_types dt
    ON dt.id = d.document_type_id
LEFT JOIN foundation.document_files df
    ON df.document_id = d.id
   AND df.is_current = TRUE;
```

---

# ============================================================
# 27. Utility Functions
# ============================================================

## Generate Party Code

```sql
CREATE OR REPLACE FUNCTION foundation.generate_party_code()
RETURNS TEXT
LANGUAGE plpgsql
AS
$$
DECLARE
    next_id BIGINT;
BEGIN
    SELECT nextval('foundation.party_code_seq')
    INTO next_id;

    RETURN 'PTY-' || LPAD(next_id::TEXT,8,'0');
END;
$$;
```

Example

```
PTY-00000001
PTY-00000002
PTY-00000003
```

---

## Update Timestamp

```sql
CREATE OR REPLACE FUNCTION foundation.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
```

---

# ============================================================
# 28. Triggers
# ============================================================

```sql
CREATE TRIGGER trg_party_updated
BEFORE UPDATE
ON foundation.parties
FOR EACH ROW
EXECUTE FUNCTION foundation.set_updated_at();
```

Similarly create triggers for

- party_addresses
- party_contacts
- party_bank_accounts
- documents
- document_files
- lookup_categories
- lookup_values
- countries
- states
- cities

---

# ============================================================
# 29. Soft Delete Strategy
# ============================================================

Physical delete is prohibited.

Instead

```sql
UPDATE foundation.parties

SET

deleted_at = CURRENT_TIMESTAMP,

deleted_by = :user,

is_active = FALSE

WHERE id = :id;
```

Advantages

- Recoverable
- Complete Audit Trail
- Regulatory Compliance
- Historical Reporting

---

# ============================================================
# 30. Index Strategy
# ============================================================

Primary Keys

Automatically Indexed

Foreign Keys

Create indexes explicitly.

Search Columns

Index

Examples

```
party_code

display_name

pan_number

mobile_number

email

document_number

country_name

state_name

city_name
```

Composite Indexes

```sql
CREATE INDEX idx_document_entity

ON foundation.documents

(entity_type,entity_id);

CREATE INDEX idx_party_org_name

ON foundation.parties

(organization_id,display_name);
```

---

# ============================================================
# 31. PostgreSQL Extensions
# ============================================================

Recommended

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE EXTENSION IF NOT EXISTS uuid-ossp;
```

Purpose

pgcrypto

Encrypted data

pg_trgm

Fast Search

unaccent

Accent-insensitive search

uuid-ossp

UUID generation

---

# ============================================================
# 32. Performance Recommendations
# ============================================================

Use Pagination

```
LIMIT

OFFSET
```

Avoid

```
SELECT *
```

Always select required columns.

Use Prepared Statements.

Cache

- Countries
- States
- Cities
- Lookups
- Document Types

Use Connection Pooling

PgBouncer

Use EXPLAIN ANALYZE for tuning.

---

# ============================================================
# 33. Security Guidelines
# ============================================================

Sensitive Fields

PAN

Aadhaar

GST

Account Number

Recommendations

✔ Encrypt sensitive data at rest.

✔ Mask PAN and Aadhaar in list screens.

✔ Restrict document download permissions.

✔ Store files outside PostgreSQL.

✔ Record audit information for all updates.

✔ Never expose internal IDs through public APIs if external identifiers can be used.

---

# ============================================================
# 34. Backup Strategy
# ============================================================

Daily

Full Backup

Hourly

WAL Archive

Weekly

Integrity Check

Monthly

Restore Testing

Store backups in geographically separate locations.

---

# ============================================================
# 35. Naming Standards
# ============================================================

Schemas

```
foundation

identity

organization

crm

investment

reports

system
```

Tables

Plural

```
parties

customers

employees
```

Columns

snake_case

```
created_at

updated_at

party_id
```

Indexes

```
idx_

```

Foreign Keys

```
fk_

```

Unique Keys

```
uq_

```

Check Constraints

```
chk_

```

Triggers

```
trg_

```

Functions

```
fn_

```

Views

```
vw_

```

---

# ============================================================
# 36. Complete Foundation ER Diagram
# ============================================================

```
                        Foundation
                             │
      ┌──────────────────────┼──────────────────────┐
      ▼                      ▼                      ▼
 Geography               Lookups                 Parties
      │                      │                      │
      ▼                      ▼                      ▼
 Countries         Lookup Categories        Party Addresses
      │                      │                      │
      ▼                      ▼                      ▼
 States             Lookup Values          Party Contacts
      │                                             │
      ▼                                             ▼
 Cities                                  Party Bank Accounts
                                                 │
                                                 ▼
                                           Documents
                                                 │
                                                 ▼
                                           Document Files
```

---

# ============================================================
# 37. Foundation Module Dependencies
# ============================================================

The Foundation module is referenced by:

```
Identity

↓

Organization

↓

CRM

↓

Investment

↓

Insurance

↓

Reports

↓

Client Portal
```

All modules must reference Foundation tables instead of storing duplicate master information.

---

# ============================================================
# 38. Future Enhancements
# ============================================================

- Address Versioning
- Contact Verification History
- Document OCR Integration
- PAN Verification API
- Aadhaar Verification Workflow
- Bank Account Verification
- Digital Signature Support
- Multi-language Lookup Values
- Geofencing for Addresses
- GIS Integration
- Barcode/QR Code Generation
- Duplicate Party Detection
- AI-assisted Party Matching

---

# ============================================================
# 39. Summary
# ============================================================

Foundation Module contains the following core entities:

| Area | Tables |
|------|--------|
| Geography | countries, states, cities |
| Lookups | lookup_categories, lookup_values |
| Party | parties, party_addresses, party_contacts, party_bank_accounts |
| Documents | document_categories, document_types, documents, document_files |
| Masters | currencies, financial_years |

Total Core Tables: **15**

The Foundation module provides reusable master data and services for all other modules in Advisor Center. It enforces consistent naming, centralized document handling, reusable lookup values, standardized party management, and scalable geographic and master data structures.

---

# End of Foundation Module Design