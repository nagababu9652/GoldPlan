# ============================================================
# 25. Document Management
# ============================================================

The Document Management subsystem provides centralized storage and metadata
management for all uploaded documents across Advisor Center.

Supported Modules

- Parties
- Employees
- Customers
- Advisors
- Associates
- Agencies
- ARN Holders
- Investments
- Insurance
- Reports
- KYC
- Compliance

------------------------------------------------------------

Entity Relationship

```

Document Category
│
▼
Document Type
│
▼
Documents
│
▼
Document Files

```

---

# Business Rules

BR-FND-040

Every Document belongs to one Document Type.

---

BR-FND-041

A Document can have multiple versions.

---

BR-FND-042

Only one version is Current.

---

BR-FND-043

Physical files are stored outside PostgreSQL.

Only metadata is stored.

---

BR-FND-044

Deleting a document performs Soft Delete.

---

# 25.1 document_categories

Business Purpose

Logical grouping of document types.

Examples

- Identity
- Address Proof
- Financial
- KYC
- Tax
- Investment
- Insurance
- Reports

```sql
CREATE TABLE foundation.document_categories
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_code       VARCHAR(30) NOT NULL,

    category_name       VARCHAR(150) NOT NULL,

    description         TEXT,

    display_order       INTEGER DEFAULT 1,

    is_system           BOOLEAN DEFAULT FALSE,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by          BIGINT,

    updated_at          TIMESTAMP,

    updated_by          BIGINT,

    version_no          INTEGER DEFAULT 1,

    is_active           BOOLEAN DEFAULT TRUE,

    CONSTRAINT uq_document_category_code
        UNIQUE(category_code),

    CONSTRAINT uq_document_category_name
        UNIQUE(category_name)
);
```

Indexes

```sql
CREATE INDEX idx_document_category_name
ON foundation.document_categories(category_name);
```

---

# 25.2 document_types

Examples

- PAN Card
- Aadhaar
- Passport
- Driving Licence
- Bank Passbook
- Cancelled Cheque
- Photograph
- Signature
- Income Proof
- KYC Form

```sql
CREATE TABLE foundation.document_types
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_id             BIGINT NOT NULL,

    type_code               VARCHAR(30) NOT NULL,

    type_name               VARCHAR(150) NOT NULL,

    allowed_extensions      VARCHAR(200),

    max_file_size_mb        INTEGER DEFAULT 10,

    requires_expiry         BOOLEAN DEFAULT FALSE,

    remarks                 TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_document_type_category
        FOREIGN KEY(category_id)
        REFERENCES foundation.document_categories(id),

    CONSTRAINT uq_document_type
        UNIQUE(type_code)
);
```

Indexes

```sql
CREATE INDEX idx_document_type_category
ON foundation.document_types(category_id);
```

---

# 25.3 documents

Business Purpose

Stores document metadata independent of any business module.

```sql
CREATE TABLE foundation.documents
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id         BIGINT NOT NULL,

    entity_type             VARCHAR(50) NOT NULL,

    entity_id               BIGINT NOT NULL,

    document_type_id        BIGINT NOT NULL,

    document_number         VARCHAR(100),

    issue_date              DATE,

    expiry_date             DATE,

    issued_by               VARCHAR(200),

    is_verified             BOOLEAN DEFAULT FALSE,

    verified_at             TIMESTAMP,

    verified_by             BIGINT,

    remarks                 TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    deleted_at              TIMESTAMP,

    deleted_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_document_type
        FOREIGN KEY(document_type_id)
        REFERENCES foundation.document_types(id)
);
```

Indexes

```sql
CREATE INDEX idx_document_entity
ON foundation.documents(entity_type, entity_id);

CREATE INDEX idx_document_type
ON foundation.documents(document_type_id);
```

---

# 25.4 document_files

Business Purpose

Stores physical file metadata.

The actual binary file resides in

- AWS S3
- Azure Blob
- Google Cloud Storage
- Local File Storage

```sql
CREATE TABLE foundation.document_files
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    document_id             BIGINT NOT NULL,

    version_no              INTEGER NOT NULL,

    original_file_name      VARCHAR(300),

    stored_file_name        VARCHAR(300),

    file_extension          VARCHAR(20),

    mime_type               VARCHAR(100),

    file_size_bytes         BIGINT,

    storage_provider        VARCHAR(50),

    storage_path            TEXT,

    checksum_sha256         VARCHAR(64),

    uploaded_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    uploaded_by             BIGINT,

    is_current              BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_document_file
        FOREIGN KEY(document_id)
        REFERENCES foundation.documents(id)
);
```

Indexes

```sql
CREATE INDEX idx_document_file_document
ON foundation.document_files(document_id);

CREATE INDEX idx_document_file_current
ON foundation.document_files(is_current);
```

---

# Seed Data

```sql
INSERT INTO foundation.document_categories
(category_code,category_name)
VALUES
('IDENTITY','Identity'),
('ADDRESS','Address Proof'),
('FINANCIAL','Financial'),
('KYC','KYC');

INSERT INTO foundation.document_types
(category_id,type_code,type_name)
VALUES
(1,'PAN','PAN Card'),
(1,'AADHAAR','Aadhaar Card'),
(1,'PASSPORT','Passport'),
(2,'UTILITY','Utility Bill'),
(3,'CHEQUE','Cancelled Cheque');
```

---

# APIs

GET /api/v1/documents

GET /api/v1/documents/{id}

POST /api/v1/documents

PUT /api/v1/documents/{id}

DELETE /api/v1/documents/{id}

POST /api/v1/documents/upload

GET /api/v1/documents/download/{id}

POST /api/v1/documents/{id}/verify

GET /api/v1/documents/entity/{entityType}/{entityId}

---

# Validation

✓ File Extension Allowed

✓ Maximum File Size

✓ Expiry Date ≥ Issue Date

✓ One Current File Version

✓ SHA-256 Checksum Generated

✓ Virus Scan Before Activation

---

# Storage Strategy

Metadata

PostgreSQL

↓

File Storage

AWS S3 / Azure Blob / GCS / Local

↓

Application retrieves metadata

↓

Signed URL generated

↓

User downloads file