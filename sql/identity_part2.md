# ============================================================
# 15. Authentication Tables
# ============================================================

The Authentication subsystem manages user identities, login methods,
passwords, OTP verification, sessions, refresh tokens and login history.

---

# Entity Relationship

```
Foundation.Party
        │
        ▼
      Users
        │
        ├──────────────┐
        ▼              ▼
Authentication     User Sessions
Methods               │
        │             ▼
        ▼       Refresh Tokens
 Password History
        │
        ▼
 OTP Requests

Users
   │
   ▼
Login History
```

---

# Business Rules

BR-IDN-001

Every User references one Party.

---

BR-IDN-002

Username must be unique.

---

BR-IDN-003

Email must be unique.

---

BR-IDN-004

One User may have multiple authentication methods.

---

BR-IDN-005

Passwords are stored only as Argon2id hashes.

---

BR-IDN-006

Refresh Tokens are stored hashed.

---

BR-IDN-007

Access Tokens are never stored.

---

BR-IDN-008

OTP expires after configured duration.

---

# 15.1 users

Business Purpose

Stores login account information.

```sql
CREATE TABLE identity.users
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    party_id                BIGINT NOT NULL,

    username                VARCHAR(100) NOT NULL,

    email                   VARCHAR(150) NOT NULL,

    mobile_number           VARCHAR(20),

    display_name            VARCHAR(200),

    preferred_language      VARCHAR(20) DEFAULT 'en',

    timezone                VARCHAR(100) DEFAULT 'Asia/Kolkata',

    email_verified          BOOLEAN DEFAULT FALSE,

    mobile_verified         BOOLEAN DEFAULT FALSE,

    account_status          VARCHAR(20) DEFAULT 'ACTIVE',

    last_login_at           TIMESTAMP,

    last_password_change_at TIMESTAMP,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    deleted_at              TIMESTAMP,

    deleted_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_user_party
        FOREIGN KEY (party_id)
        REFERENCES foundation.parties(id),

    CONSTRAINT uq_username
        UNIQUE(username),

    CONSTRAINT uq_email
        UNIQUE(email)
);
```

Indexes

```sql
CREATE INDEX idx_user_party
ON identity.users(party_id);

CREATE INDEX idx_user_username
ON identity.users(username);

CREATE INDEX idx_user_email
ON identity.users(email);
```

---

# 15.2 authentication_methods

Business Purpose

Stores authentication methods for each user.

Supported Methods

- PASSWORD
- OTP
- GOOGLE
- MICROSOFT
- APPLE
- LDAP
- SAML

```sql
CREATE TABLE identity.authentication_methods
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id                 BIGINT NOT NULL,

    authentication_type     VARCHAR(30) NOT NULL,

    credential_hash         TEXT,

    external_identifier     VARCHAR(255),

    password_algorithm      VARCHAR(30),

    password_expiry_date    DATE,

    is_primary              BOOLEAN DEFAULT TRUE,

    is_enabled              BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by              BIGINT,

    updated_at              TIMESTAMP,

    updated_by              BIGINT,

    version_no              INTEGER DEFAULT 1,

    CONSTRAINT fk_auth_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id)
);
```

Indexes

```sql
CREATE INDEX idx_auth_user
ON identity.authentication_methods(user_id);

CREATE INDEX idx_auth_type
ON identity.authentication_methods(authentication_type);
```

---

# 15.3 password_history

Business Purpose

Stores previous password hashes to prevent password reuse.

```sql
CREATE TABLE identity.password_history
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id             BIGINT NOT NULL,

    password_hash       TEXT NOT NULL,

    changed_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    changed_by          BIGINT,

    CONSTRAINT fk_password_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id)
);
```

Indexes

```sql
CREATE INDEX idx_password_user
ON identity.password_history(user_id);
```

Business Rules

- Store last 5 passwords.
- Prevent reuse.
- Password history cannot be deleted.

---

# 15.4 otp_requests

Business Purpose

Stores OTP requests for authentication and verification.

```sql
CREATE TABLE identity.otp_requests
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id             BIGINT,

    destination         VARCHAR(255) NOT NULL,

    otp_code_hash       TEXT NOT NULL,

    purpose             VARCHAR(50) NOT NULL,

    expires_at          TIMESTAMP NOT NULL,

    verified_at         TIMESTAMP,

    failed_attempts     SMALLINT DEFAULT 0,

    is_used             BOOLEAN DEFAULT FALSE,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_otp_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id)
);
```

Indexes

```sql
CREATE INDEX idx_otp_destination
ON identity.otp_requests(destination);

CREATE INDEX idx_otp_expiry
ON identity.otp_requests(expires_at);
```

Business Rules

- OTP stored hashed.
- OTP expires after 5 minutes.
- Maximum 5 verification attempts.
- OTP cannot be reused.

---

# 15.5 user_sessions

Business Purpose

Tracks active user sessions.

```sql
CREATE TABLE identity.user_sessions
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id                 BIGINT NOT NULL,

    session_uuid            UUID NOT NULL,

    login_time              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_activity_at        TIMESTAMP,

    logout_time             TIMESTAMP,

    ip_address              INET,

    user_agent              TEXT,

    device_name             VARCHAR(200),

    operating_system        VARCHAR(100),

    browser                 VARCHAR(100),

    is_active               BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_session_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id)
);
```

Indexes

```sql
CREATE INDEX idx_session_user
ON identity.user_sessions(user_id);

CREATE INDEX idx_session_uuid
ON identity.user_sessions(session_uuid);

CREATE INDEX idx_session_active
ON identity.user_sessions(is_active);
```

---

# 15.6 refresh_tokens

Business Purpose

Stores hashed refresh tokens.

```sql
CREATE TABLE identity.refresh_tokens
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    session_id              BIGINT NOT NULL,

    token_hash              TEXT NOT NULL,

    expires_at              TIMESTAMP NOT NULL,

    revoked_at              TIMESTAMP,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_session
        FOREIGN KEY(session_id)
        REFERENCES identity.user_sessions(id)
);
```

Indexes

```sql
CREATE INDEX idx_refresh_session
ON identity.refresh_tokens(session_id);

CREATE INDEX idx_refresh_expiry
ON identity.refresh_tokens(expires_at);
```

---

# 15.7 login_history

Business Purpose

Maintains login audit history.

```sql
CREATE TABLE identity.login_history
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id             BIGINT,

    login_timestamp     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    login_result        VARCHAR(20),

    failure_reason      VARCHAR(200),

    ip_address          INET,

    user_agent          TEXT,

    device_name         VARCHAR(200),

    browser             VARCHAR(100),

    operating_system    VARCHAR(100),

    CONSTRAINT fk_login_user
        FOREIGN KEY(user_id)
        REFERENCES identity.users(id)
);
```

Indexes

```sql
CREATE INDEX idx_login_user
ON identity.login_history(user_id);

CREATE INDEX idx_login_time
ON identity.login_history(login_timestamp);
```

---

# Authentication APIs

```
POST   /api/v1/auth/login

POST   /api/v1/auth/logout

POST   /api/v1/auth/refresh

POST   /api/v1/auth/send-otp

POST   /api/v1/auth/verify-otp

POST   /api/v1/auth/change-password

POST   /api/v1/auth/forgot-password

POST   /api/v1/auth/reset-password

GET    /api/v1/auth/me

GET    /api/v1/auth/sessions

DELETE /api/v1/auth/sessions/{id}
```

---

# Validation Rules

Users

✓ Username Unique

✓ Email Unique

✓ Party Required

✓ Email Format Validation

✓ Mobile Format Validation

Authentication

✓ Password Minimum Length

✓ Password Complexity

✓ Password Expiry

✓ Argon2id Hash

OTP

✓ Hash Stored

✓ Maximum Attempts

✓ Expiry Validation

Sessions

✓ One Refresh Token per Session

✓ Session Timeout

✓ Idle Timeout