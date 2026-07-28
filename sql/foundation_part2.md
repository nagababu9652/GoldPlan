# ============================================================
# 19. Lookup & Master Tables
# ============================================================

Lookup tables provide configurable values used throughout Advisor Center.

Examples:

- Gender
- Marital Status
- Customer Status
- Occupation
- Address Type
- Contact Type
- Party Type
- Relationship
- Investment Status
- Report Type

No application code should hardcode these values.

---

# Entity Relationship

```
Lookup Category

      │

      ▼

Lookup Values

      │

      ▼

Referenced By

Employees

Customers

Advisors

CRM

Reports

Documents

Investments
```

---

# 19.1 lookup_categories

Business Purpose

Stores categories of lookup values.

Examples

- Gender

- Address Type

- Contact Type

- Customer Status

- Occupation

- Marital Status

- Religion

- Blood Group

- Relationship

---

```sql
CREATE TABLE foundation.lookup_categories
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_code       VARCHAR(50) NOT NULL,

    category_name       VARCHAR(150) NOT NULL,

    description         TEXT,

    display_order       INTEGER DEFAULT 1,

    is_system           BOOLEAN NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    deleted_at          TIMESTAMP,

    deleted_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_lookup_category_code
        UNIQUE(category_code),

    CONSTRAINT uq_lookup_category_name
        UNIQUE(category_name)
);
```

Indexes

```sql
CREATE INDEX idx_lookup_category_name
ON foundation.lookup_categories(category_name);

CREATE INDEX idx_lookup_category_code
ON foundation.lookup_categories(category_code);
```

Business Rules

- Category Code must be unique.
- Category Name must be unique.
- System Categories cannot be deleted.
- Only Administrators may create categories.

---

# 19.2 lookup_values

Business Purpose

Stores configurable values under each lookup category.

Example

Gender

- Male
- Female
- Other

Marital Status

- Single
- Married
- Divorced
- Widowed

Address Type

- Residential
- Office
- Communication
- Registered Office

---

```sql
CREATE TABLE foundation.lookup_values
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_id         BIGINT NOT NULL,

    value_code          VARCHAR(50) NOT NULL,

    value_name          VARCHAR(150) NOT NULL,

    short_name          VARCHAR(50),

    description         TEXT,

    display_order       INTEGER DEFAULT 1,

    color_code          VARCHAR(20),

    icon_name           VARCHAR(100),

    is_default          BOOLEAN DEFAULT FALSE,

    is_system           BOOLEAN DEFAULT FALSE,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    deleted_at          TIMESTAMP,

    deleted_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_lookup_category
        FOREIGN KEY(category_id)
        REFERENCES foundation.lookup_categories(id),

    CONSTRAINT uq_lookup_value
        UNIQUE(category_id,value_code),

    CONSTRAINT uq_lookup_name
        UNIQUE(category_id,value_name)
);
```

Indexes

```sql
CREATE INDEX idx_lookup_category
ON foundation.lookup_values(category_id);

CREATE INDEX idx_lookup_name
ON foundation.lookup_values(value_name);

CREATE INDEX idx_lookup_code
ON foundation.lookup_values(value_code);
```

Business Rules

- Every value belongs to one category.
- Display Order controls dropdown ordering.
- Only one default value per category.
- Values referenced by business tables cannot be deleted.

---

# 19.3 currencies

Business Purpose

Stores supported currencies.

Currently the application primarily uses INR but supports future international expansion.

---

```sql
CREATE TABLE foundation.currencies
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    currency_code       CHAR(3) NOT NULL,

    currency_name       VARCHAR(100) NOT NULL,

    currency_symbol     VARCHAR(10),

    decimal_places      SMALLINT DEFAULT 2,

    is_base_currency    BOOLEAN DEFAULT FALSE,

    exchange_rate       NUMERIC(18,8),

    effective_date      DATE,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_currency_code
        UNIQUE(currency_code)
);
```

Indexes

```sql
CREATE INDEX idx_currency_code
ON foundation.currencies(currency_code);
```

---

# 19.4 financial_years

Business Purpose

Stores financial years used in reporting and taxation.

---

```sql
CREATE TABLE foundation.financial_years
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    financial_year      VARCHAR(20) NOT NULL,

    start_date          DATE NOT NULL,

    end_date            DATE NOT NULL,

    assessment_year     VARCHAR(20),

    is_current          BOOLEAN DEFAULT FALSE,

    is_closed           BOOLEAN DEFAULT FALSE,

    remarks             TEXT,

    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    version_no          INTEGER NOT NULL DEFAULT 1,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_financial_year
        UNIQUE(financial_year),

    CONSTRAINT chk_financial_year_dates
        CHECK(start_date < end_date)
);
```

Indexes

```sql
CREATE INDEX idx_financial_year
ON foundation.financial_years(financial_year);

CREATE INDEX idx_financial_year_current
ON foundation.financial_years(is_current);
```

---

# 20. Recommended Seed Data

```sql
INSERT INTO foundation.lookup_categories
(category_code, category_name)
VALUES
('GENDER','Gender'),
('MARITAL_STATUS','Marital Status'),
('ADDRESS_TYPE','Address Type'),
('CONTACT_TYPE','Contact Type'),
('PARTY_TYPE','Party Type'),
('RELATIONSHIP','Relationship'),
('CUSTOMER_STATUS','Customer Status'),
('OCCUPATION','Occupation');

INSERT INTO foundation.lookup_values
(category_id,value_code,value_name)
VALUES
(1,'M','Male'),
(1,'F','Female'),
(1,'O','Other'),

(2,'SINGLE','Single'),
(2,'MARRIED','Married'),

(3,'HOME','Residential'),
(3,'OFFICE','Office'),

(4,'MOBILE','Mobile'),
(4,'EMAIL','Email'),

(5,'INDIVIDUAL','Individual'),
(5,'COMPANY','Company');
```

---

# 21. REST APIs

Lookup Categories

GET /api/v1/foundation/lookup-categories

POST /api/v1/foundation/lookup-categories

PUT /api/v1/foundation/lookup-categories/{id}

DELETE /api/v1/foundation/lookup-categories/{id}

Lookup Values

GET /api/v1/foundation/lookup-values

GET /api/v1/foundation/lookup-values?category=GENDER

POST /api/v1/foundation/lookup-values

PUT /api/v1/foundation/lookup-values/{id}

Currencies

GET /api/v1/foundation/currencies

Financial Years

GET /api/v1/foundation/financial-years

---

# 22. Validation Rules

Lookup Category

✓ Category Code Required

✓ Category Name Required

✓ Category Code Unique

Lookup Value

✓ Category Required

✓ Value Code Required

✓ Value Name Required

✓ Display Order ≥ 1

Financial Year

✓ Start Date Required

✓ End Date Required

✓ Start Date < End Date

Currency

✓ Currency Code must be ISO-4217 compliant

✓ Decimal Places ≥ 0

---

# 23. Performance Considerations

Expected Record Count

| Table | Estimated Rows |
|---------|---------------:|
| lookup_categories | <100 |
| lookup_values | <5,000 |
| currencies | <250 |
| financial_years | <100 |

Recommendations

- Cache lookup values in Redis.
- Load lookup values once during application startup where appropriate.
- Frequently accessed dropdowns should be served from cache.
- Use category-based filtering instead of retrieving all lookup values.

---

End of Part 2

Next Part (Part 3)

- Parties
- Party Addresses
- Party Contacts
- Party Bank Accounts
- Constraints
- Indexes
- Seed Data
- APIs
- Business Rules