# ============================================================
# 16. Authorization & Access Control
# ============================================================

The Authorization subsystem controls what authenticated users are
allowed to do inside Advisor Center.

The system implements Role-Based Access Control (RBAC) with
Permission Profiles for organization-level customization.

---

# Entity Relationship

```
Organizations
      │
      ▼
Roles
      │
      ▼
Permission Profiles
      │
      ▼
Role Permissions
      │
      ▼
Permissions

Users
      │
      ▼
User Roles
      │
      ▼
Roles
```

---

# Business Rules

BR-IDN-020

Every Role belongs to one Organization.

(System Roles belong to System Organization.)

---

BR-IDN-021

Users may have multiple Roles.

---

BR-IDN-022

Roles inherit permissions through Permission Profiles.

---

BR-IDN-023

Permissions are additive.

---

BR-IDN-024

Inactive Roles cannot be assigned.

---

BR-IDN-025

System Roles cannot be deleted.

---

# 16.1 permissions

Business Purpose

Stores every available permission in the application.

Examples

Customer

- customer.view
- customer.create
- customer.edit
- customer.delete

Reports

- reports.generate
- reports.export

Investments

- investment.create
- investment.approve

---

```sql
CREATE TABLE identity.permissions
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    permission_code         VARCHAR(100) NOT NULL,

    permission_name         VARCHAR(200) NOT NULL,

    module_name             VARCHAR(100) NOT NULL,

    description             TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_system               BOOLEAN DEFAULT TRUE,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT uq_permission_code
        UNIQUE(permission_code)
);
```

Indexes

```sql
CREATE INDEX idx_permission_module
ON identity.permissions(module_name);

CREATE INDEX idx_permission_code
ON identity.permissions(permission_code);
```

---

# 16.2 roles

Business Purpose

Stores security roles.

Examples

System

- Super Administrator

Organization

- Admin
- Branch Manager
- Advisor
- Employee
- Receptionist

---

```sql
CREATE TABLE identity.roles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id         BIGINT NOT NULL,

    role_code               VARCHAR(50) NOT NULL,

    role_name               VARCHAR(150) NOT NULL,

    description             TEXT,

    is_system               BOOLEAN DEFAULT FALSE,

    is_default              BOOLEAN DEFAULT FALSE,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT uq_role
        UNIQUE(organization_id,role_code)
);
```

Indexes

```sql
CREATE INDEX idx_role_org
ON identity.roles(organization_id);

CREATE INDEX idx_role_name
ON identity.roles(role_name);
```

---

# 16.3 permission_profiles

Business Purpose

Groups permissions into reusable permission sets.

Examples

Advisor Profile

Branch Manager Profile

Customer Service Profile

Compliance Officer Profile

---

```sql
CREATE TABLE identity.permission_profiles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id         BIGINT NOT NULL,

    profile_code            VARCHAR(50) NOT NULL,

    profile_name            VARCHAR(150) NOT NULL,

    description             TEXT,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT uq_permission_profile
        UNIQUE(organization_id,profile_code)
);
```

Indexes

```sql
CREATE INDEX idx_permission_profile_org
ON identity.permission_profiles(organization_id);
```

---

# 16.4 profile_permissions

Business Purpose

Maps Permission Profiles to Permissions.

```sql
CREATE TABLE identity.profile_permissions
(
    profile_id          BIGINT NOT NULL,

    permission_id       BIGINT NOT NULL,

    allow_access        BOOLEAN DEFAULT TRUE,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(profile_id,permission_id),

    CONSTRAINT fk_profile_permission
        FOREIGN KEY(profile_id)
        REFERENCES identity.permission_profiles(id),

    CONSTRAINT fk_permission
        FOREIGN KEY(permission_id)
        REFERENCES identity.permissions(id)
);
```

Indexes

```sql
CREATE INDEX idx_profile_permission
ON identity.profile_permissions(permission_id);
```

---

# 16.5 role_permission_profiles

Business Purpose

Assigns one or more Permission Profiles to a Role.

```sql
CREATE TABLE identity.role_permission_profiles
(
    role_id             BIGINT NOT NULL,

    profile_id          BIGINT NOT NULL,

    assigned_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    assigned_by         BIGINT,

    PRIMARY KEY(role_id,profile_id),

    CONSTRAINT fk_role_profile
        FOREIGN KEY(role_id)
        REFERENCES identity.roles(id),

    CONSTRAINT fk_profile
        FOREIGN KEY(profile_id)
        REFERENCES identity.permission_profiles(id)
);
```

---

# 16.6 user_roles

Business Purpose

Assigns Roles to Users.

```sql
CREATE TABLE identity.user_roles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id                 BIGINT NOT NULL,

    role_id                 BIGINT NOT NULL,

    effective_from          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    effective_to            TIMESTAMP,

    assigned_by             BIGINT,

    assigned_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    is_primary              BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_user_role_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id),

    CONSTRAINT fk_user_role_role
        FOREIGN KEY(role_id)
        REFERENCES identity.roles(id),

    CONSTRAINT uq_user_role
        UNIQUE(user_id,role_id)
);
```

Indexes

```sql
CREATE INDEX idx_user_roles_user
ON identity.user_roles(user_id);

CREATE INDEX idx_user_roles_role
ON identity.user_roles(role_id);
```

---

# Authorization Flow

```
User

↓

User Roles

↓

Roles

↓

Permission Profiles

↓

Permissions

↓

API Authorization

↓

Grant / Deny
```

---

# Recommended Seed Roles

```sql
INSERT INTO identity.roles
(role_code, role_name, organization_id, is_system)
VALUES
('SUPER_ADMIN','Super Administrator',1,TRUE),
('ORG_ADMIN','Organization Administrator',1,FALSE),
('BRANCH_MANAGER','Branch Manager',1,FALSE),
('ADVISOR','Advisor',1,FALSE),
('EMPLOYEE','Employee',1,FALSE),
('RECEPTION','Receptionist',1,FALSE);
```

---

# Example Permissions

```text
customer.view
customer.create
customer.edit
customer.delete

customer_group.merge
customer_group.split

investment.create
investment.edit
investment.approve

report.view
report.export

employee.view
employee.create

settings.manage

audit.view
```

---

# REST APIs

## Roles

GET    /api/v1/roles

GET    /api/v1/roles/{id}

POST   /api/v1/roles

PUT    /api/v1/roles/{id}

DELETE /api/v1/roles/{id}

---

## Permission Profiles

GET    /api/v1/permission-profiles

POST   /api/v1/permission-profiles

PUT    /api/v1/permission-profiles/{id}

DELETE /api/v1/permission-profiles/{id}

---

## Permissions

GET    /api/v1/permissions

GET    /api/v1/permissions/module/{module}

---

## User Roles

POST   /api/v1/users/{id}/roles

DELETE /api/v1/users/{id}/roles/{roleId}

GET    /api/v1/users/{id}/roles

---

# Validation Rules

Roles

✓ Role Code Unique per Organization

✓ Role Name Required

✓ Inactive Roles cannot be assigned

Permission Profiles

✓ Profile Code Unique

✓ At least one Permission required before activation

Permissions

✓ Permission Code Unique

✓ Module Name Required

User Roles

✓ Effective To ≥ Effective From

✓ One Primary Role per User (optional business rule)

✓ Duplicate Role assignments not allowed