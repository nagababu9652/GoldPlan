# ============================================================
# 17. Security & Audit
# ============================================================

The Security subsystem protects user accounts, manages trusted devices,
tracks suspicious activities, and maintains complete audit logs.

This module supports:

- Device Registration
- Trusted Devices
- Account Lockout
- Security Events
- Audit Trail

---

# Entity Relationship

```
Users
   │
   ├──────────────┐
   ▼              ▼
Devices      Account Lockouts
   │
   ▼
User Devices
   │
   ▼
Security Events

Users
   │
   ▼
Audit Logs
```

---

# Business Rules

BR-IDN-040

A user may register multiple devices.

---

BR-IDN-041

A device may be trusted or untrusted.

---

BR-IDN-042

Failed login attempts are tracked.

---

BR-IDN-043

Accounts are automatically locked after the configured number of failed attempts.

---

BR-IDN-044

All security-related activities must be logged.

---

BR-IDN-045

Audit records are immutable and cannot be modified.

---

# 17.1 devices

Business Purpose

Stores unique devices that access the system.

```sql
CREATE TABLE identity.devices
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    device_uuid             UUID NOT NULL,

    device_name             VARCHAR(200),

    device_type             VARCHAR(50),

    operating_system        VARCHAR(100),

    os_version              VARCHAR(100),

    browser                 VARCHAR(100),

    browser_version         VARCHAR(100),

    device_fingerprint      TEXT NOT NULL,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_device_uuid
        UNIQUE(device_uuid),

    CONSTRAINT uq_device_fingerprint
        UNIQUE(device_fingerprint)
);
```

Indexes

```sql
CREATE INDEX idx_device_uuid
ON identity.devices(device_uuid);

CREATE INDEX idx_device_fingerprint
ON identity.devices(device_fingerprint);
```

---

# 17.2 user_devices

Business Purpose

Associates users with their registered devices.

```sql
CREATE TABLE identity.user_devices
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id                 BIGINT NOT NULL,

    device_id               BIGINT NOT NULL,

    first_login_at          TIMESTAMP,

    last_login_at           TIMESTAMP,

    trusted_until           TIMESTAMP,

    is_trusted              BOOLEAN DEFAULT FALSE,

    is_active               BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_device_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id),

    CONSTRAINT fk_user_device_device
        FOREIGN KEY(device_id)
        REFERENCES identity.devices(id),

    CONSTRAINT uq_user_device
        UNIQUE(user_id, device_id)
);
```

Indexes

```sql
CREATE INDEX idx_user_device_user
ON identity.user_devices(user_id);

CREATE INDEX idx_user_device_device
ON identity.user_devices(device_id);
```

Business Rules

- One device can be used by multiple users.
- A user can register multiple devices.
- Trusted devices may bypass OTP (based on policy).

---

# 17.3 account_lockouts

Business Purpose

Tracks temporary or permanent account lockouts.

```sql
CREATE TABLE identity.account_lockouts
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id                 BIGINT NOT NULL,

    failed_attempts         INTEGER DEFAULT 0,

    locked_at               TIMESTAMP,

    unlock_at               TIMESTAMP,

    unlocked_by             BIGINT,

    reason                  VARCHAR(250),

    is_locked               BOOLEAN DEFAULT FALSE,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lockout_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id)
);
```

Indexes

```sql
CREATE INDEX idx_lockout_user
ON identity.account_lockouts(user_id);

CREATE INDEX idx_lockout_status
ON identity.account_lockouts(is_locked);
```

Business Rules

- Lock account after configurable failed attempts.
- Automatic unlock after configured duration.
- Administrators may manually unlock.

---

# 17.4 security_events

Business Purpose

Stores security-related events.

Examples

- Login Success
- Login Failure
- Password Changed
- Password Reset
- OTP Generated
- OTP Verified
- Account Locked
- Device Registered
- MFA Enabled

```sql
CREATE TABLE identity.security_events
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id                 BIGINT,

    event_type              VARCHAR(100) NOT NULL,

    severity                VARCHAR(20),

    event_timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ip_address              INET,

    device_id               BIGINT,

    session_id              BIGINT,

    description             TEXT,

    metadata                JSONB,

    CONSTRAINT fk_security_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id),

    CONSTRAINT fk_security_device
        FOREIGN KEY(device_id)
        REFERENCES identity.devices(id),

    CONSTRAINT fk_security_session
        FOREIGN KEY(session_id)
        REFERENCES identity.user_sessions(id)
);
```

Indexes

```sql
CREATE INDEX idx_security_user
ON identity.security_events(user_id);

CREATE INDEX idx_security_event
ON identity.security_events(event_type);

CREATE INDEX idx_security_timestamp
ON identity.security_events(event_timestamp);
```

---

# 17.5 audit_logs

Business Purpose

Stores immutable audit history for all data changes.

Every CREATE, UPDATE, DELETE operation across all modules should generate an audit record.

```sql
CREATE TABLE identity.audit_logs
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    organization_id         BIGINT,

    user_id                 BIGINT,

    module_name             VARCHAR(100),

    table_name              VARCHAR(100),

    record_id               BIGINT,

    action                  VARCHAR(20),

    old_values              JSONB,

    new_values              JSONB,

    ip_address              INET,

    session_id              BIGINT,

    correlation_id          UUID,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id),

    CONSTRAINT fk_audit_session
        FOREIGN KEY(session_id)
        REFERENCES identity.user_sessions(id)
);
```

Indexes

```sql
CREATE INDEX idx_audit_user
ON identity.audit_logs(user_id);

CREATE INDEX idx_audit_table
ON identity.audit_logs(table_name);

CREATE INDEX idx_audit_record
ON identity.audit_logs(table_name, record_id);

CREATE INDEX idx_audit_created
ON identity.audit_logs(created_at);
```

Business Rules

- Audit records are append-only.
- No UPDATE or DELETE allowed.
- Store before and after values as JSONB.
- Include correlation ID for tracing distributed requests.

---

# Security Workflow

```
User Login
     │
     ▼
Validate Credentials
     │
     ▼
Trusted Device?
     │
 ┌───┴────┐
 │        │
Yes      No
 │        │
 ▼        ▼
Login    Send OTP
 │        │
 └───┬────┘
     ▼
Create Session
     │
     ▼
Record Security Event
     │
     ▼
Write Audit Log
```

---

# REST APIs

## Devices

GET    /api/v1/devices

GET    /api/v1/devices/{id}

DELETE /api/v1/devices/{id}

POST   /api/v1/devices/{id}/trust

POST   /api/v1/devices/{id}/untrust

---

## Account Lockout

GET    /api/v1/account-lockouts

POST   /api/v1/account-lockouts/{userId}/unlock

---

## Security Events

GET    /api/v1/security-events

GET    /api/v1/security-events/{id}

---

## Audit Logs

GET    /api/v1/audit-logs

GET    /api/v1/audit-logs/{id}

GET    /api/v1/audit-logs/module/{module}

GET    /api/v1/audit-logs/user/{userId}

---

# Validation Rules

Devices

✓ Device Fingerprint Required

✓ UUID Unique

✓ One Fingerprint per Physical Device

User Devices

✓ Duplicate device assignments not allowed

✓ Trusted device expiry must be in the future

Account Lockouts

✓ Unlock Time ≥ Lock Time

✓ Failed Attempts ≥ 0

Security Events

✓ Event Type Required

✓ Event Timestamp Required

Audit Logs

✓ Action must be CREATE, UPDATE, DELETE, LOGIN, LOGOUT

✓ Old/New values stored as JSONB

✓ Audit records are immutable