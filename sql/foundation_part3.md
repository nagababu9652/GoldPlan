# ============================================================
# 24. Party Management
# ============================================================

The Party entity is the master record for every person or organization in Advisor Center.

Business modules do NOT duplicate personal information.

Instead they reference a Party.

Examples

• Customer

• Employee

• Advisor

• Associate

• Agency

• ARN Holder

• Vendor

• Nominee

• Guardian

------------------------------------------------------------

Entity Relationship

```
                 Parties
                    │
      ┌─────────────┼───────────────┐
      ▼             ▼               ▼
Addresses      Contacts      Bank Accounts
      │
      ▼
Documents

Organization Module
        │
        ▼
 Employees
 Advisors

CRM Module
      │
      ▼
 Customers
 Customer Groups
```

---

# Business Rules

BR-FND-020

Every Party belongs to one Organization.

---

BR-FND-021

Every Party has one Party Type.

---

BR-FND-022

A Party can represent either

• Individual

OR

• Organization

Never both.

---

BR-FND-023

PAN Number shall be unique within an Organization.

---

BR-FND-024

GST Number applies only to Organization parties.

---

BR-FND-025

Date of Birth applies only to Individual parties.

---

BR-FND-026

Date of Incorporation applies only to Organization parties.

---

BR-FND-027

Party records are Soft Deleted only.

---

# 24.1 parties

Business Purpose

Stores reusable master information shared across all modules.

---

```sql
CREATE TABLE foundation.parties
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id             BIGINT NOT NULL,

    party_code                  VARCHAR(30) NOT NULL,

    party_type_id               BIGINT NOT NULL,

    title                       VARCHAR(20),

    first_name                  VARCHAR(100),

    middle_name                 VARCHAR(100),

    last_name                   VARCHAR(100),

    display_name                VARCHAR(250) NOT NULL,

    legal_name                  VARCHAR(250),

    date_of_birth               DATE,

    date_of_incorporation       DATE,

    gender_id                   BIGINT,

    marital_status_id           BIGINT,

    pan_number                  VARCHAR(20),

    aadhaar_number              VARCHAR(20),

    gst_number                  VARCHAR(20),

    cin_number                  VARCHAR(30),

    email                       VARCHAR(150),

    mobile_number               VARCHAR(20),

    alternate_mobile            VARCHAR(20),

    website                     VARCHAR(250),

    photo_url                   TEXT,

    remarks                     TEXT,

    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by                  BIGINT,

    updated_at                  TIMESTAMP,

    updated_by                  BIGINT,

    deleted_at                  TIMESTAMP,

    deleted_by                  BIGINT,

    version_no                  INTEGER NOT NULL DEFAULT 1,

    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_party_code
        UNIQUE(organization_id,party_code),

    CONSTRAINT uq_party_pan
        UNIQUE(organization_id,pan_number),

    CONSTRAINT fk_party_type
        FOREIGN KEY(party_type_id)
        REFERENCES foundation.lookup_values(id),

    CONSTRAINT fk_party_gender
        FOREIGN KEY(gender_id)
        REFERENCES foundation.lookup_values(id),

    CONSTRAINT fk_party_marital
        FOREIGN KEY(marital_status_id)
        REFERENCES foundation.lookup_values(id)
);
```

---

Indexes

```sql
CREATE INDEX idx_party_name
ON foundation.parties(display_name);

CREATE INDEX idx_party_mobile
ON foundation.parties(mobile_number);

CREATE INDEX idx_party_email
ON foundation.parties(email);

CREATE INDEX idx_party_pan
ON foundation.parties(pan_number);

CREATE INDEX idx_party_org
ON foundation.parties(organization_id);
```

---

# 24.2 party_addresses

Business Purpose

Stores multiple addresses for a Party.

Examples

Residential

Office

Communication

Registered Office

Billing

Shipping

---

```sql
CREATE TABLE foundation.party_addresses
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    party_id                BIGINT NOT NULL,

    address_type_id         BIGINT NOT NULL,

    address_line1           VARCHAR(250) NOT NULL,

    address_line2           VARCHAR(250),

    landmark                VARCHAR(150),

    city_id                 BIGINT NOT NULL,

    state_id                BIGINT NOT NULL,

    country_id              BIGINT NOT NULL,

    postal_code             VARCHAR(15),

    latitude                NUMERIC(10,6),

    longitude               NUMERIC(10,6),

    is_primary              BOOLEAN DEFAULT FALSE,

    remarks                 TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    deleted_at              TIMESTAMP,

    deleted_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_address_party
        FOREIGN KEY(party_id)
        REFERENCES foundation.parties(id),

    CONSTRAINT fk_address_type
        FOREIGN KEY(address_type_id)
        REFERENCES foundation.lookup_values(id),

    CONSTRAINT fk_address_city
        FOREIGN KEY(city_id)
        REFERENCES foundation.cities(id),

    CONSTRAINT fk_address_state
        FOREIGN KEY(state_id)
        REFERENCES foundation.states(id),

    CONSTRAINT fk_address_country
        FOREIGN KEY(country_id)
        REFERENCES foundation.countries(id)
);
```

Indexes

```sql
CREATE INDEX idx_address_party
ON foundation.party_addresses(party_id);

CREATE INDEX idx_address_city
ON foundation.party_addresses(city_id);

CREATE INDEX idx_address_primary
ON foundation.party_addresses(is_primary);
```

Business Rules

• One Primary Address per Party.

• Historical addresses shall never be deleted.

---

# 24.3 party_contacts

Business Purpose

Stores communication methods.

Examples

Mobile

Email

WhatsApp

Office Phone

Fax

Emergency Contact

---

```sql
CREATE TABLE foundation.party_contacts
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    party_id                BIGINT NOT NULL,

    contact_type_id         BIGINT NOT NULL,

    contact_value           VARCHAR(200) NOT NULL,

    is_primary              BOOLEAN DEFAULT FALSE,

    is_verified             BOOLEAN DEFAULT FALSE,

    verified_at             TIMESTAMP,

    remarks                 TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    deleted_at              TIMESTAMP,

    deleted_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_contact_party
        FOREIGN KEY(party_id)
        REFERENCES foundation.parties(id),

    CONSTRAINT fk_contact_type
        FOREIGN KEY(contact_type_id)
        REFERENCES foundation.lookup_values(id)
);
```

Indexes

```sql
CREATE INDEX idx_contact_party
ON foundation.party_contacts(party_id);

CREATE INDEX idx_contact_value
ON foundation.party_contacts(contact_value);

CREATE INDEX idx_contact_primary
ON foundation.party_contacts(is_primary);
```

Business Rules

• One Primary Mobile.

• One Primary Email.

• Contact Verification supported.

---

# 24.4 party_bank_accounts

Business Purpose

Stores banking details.

Supported

Savings

Current

NRE

NRO

OD

Loan

---

```sql
CREATE TABLE foundation.party_bank_accounts
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    party_id                BIGINT NOT NULL,

    bank_name               VARCHAR(200) NOT NULL,

    branch_name             VARCHAR(200),

    account_holder_name     VARCHAR(200),

    account_number          VARCHAR(50) NOT NULL,

    ifsc_code               VARCHAR(20),

    micr_code               VARCHAR(20),

    account_type_id         BIGINT,

    upi_id                  VARCHAR(100),

    is_primary              BOOLEAN DEFAULT FALSE,

    remarks                 TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    deleted_at              TIMESTAMP,

    deleted_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_bank_party
        FOREIGN KEY(party_id)
        REFERENCES foundation.parties(id),

    CONSTRAINT fk_account_type
        FOREIGN KEY(account_type_id)
        REFERENCES foundation.lookup_values(id)
);
```

Indexes

```sql
CREATE INDEX idx_bank_party
ON foundation.party_bank_accounts(party_id);

CREATE INDEX idx_bank_ifsc
ON foundation.party_bank_accounts(ifsc_code);

CREATE INDEX idx_bank_account
ON foundation.party_bank_accounts(account_number);
```

Business Rules

• Multiple Bank Accounts allowed.

• Only one Primary Bank Account.

• IFSC validation performed in application layer.

---

# REST APIs

## Parties

GET /api/v1/foundation/parties

GET /api/v1/foundation/parties/{id}

POST /api/v1/foundation/parties

PUT /api/v1/foundation/parties/{id}

DELETE /api/v1/foundation/parties/{id}

---

## Addresses

GET /api/v1/foundation/party-addresses

POST /api/v1/foundation/party-addresses

PUT /api/v1/foundation/party-addresses/{id}

DELETE /api/v1/foundation/party-addresses/{id}

---

## Contacts

GET /api/v1/foundation/party-contacts

POST /api/v1/foundation/party-contacts

PUT /api/v1/foundation/party-contacts/{id}

DELETE /api/v1/foundation/party-contacts/{id}

---

## Bank Accounts

GET /api/v1/foundation/party-bank-accounts

POST /api/v1/foundation/party-bank-accounts

PUT /api/v1/foundation/party-bank-accounts/{id}

DELETE /api/v1/foundation/party-bank-accounts/{id}

---

# Validation Rules

### Party

✓ Party Type Required

✓ Display Name Required

✓ PAN Format Validation

✓ Aadhaar Format Validation

✓ GST Validation

✓ Mobile Validation

✓ Email Validation

---

### Address

✓ Address Type Required

✓ City Required

✓ State Required

✓ Country Required

✓ Postal Code Validation

---

### Contact

✓ Contact Type Required

✓ Contact Value Required

✓ Email Format Validation

✓ Mobile Number Validation

---

### Bank

✓ Bank Name Required

✓ Account Number Required

✓ IFSC Format Validation

✓ One Primary Bank Account