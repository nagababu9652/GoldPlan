# Advisor Center
# Software Design Specification (SDS)

# Identity & Access Management Module

---

| Property | Value |
|----------|-------|
| Document ID | SDS-IDM-001 |
| Module | Identity & Access Management |
| Version | 1.0.0 |
| Database | PostgreSQL 16+ |
| Schema | identity |
| Status | Draft |

---

# Table of Contents

1. Introduction
2. Objectives
3. Scope
4. Out of Scope
5. Architecture
6. Module Components
7. Entity Relationship Diagram
8. Business Rules
9. Database Tables
10. Authentication Flow
11. Authorization Model
12. Security Standards
13. APIs
14. Future Enhancements

---

# 1. Introduction

The Identity Module provides centralized authentication, authorization, session management, and security services for Advisor Center.

Every user who accesses the application must authenticate through this module.

The module is independent of business entities like Employees, Customers, Advisors, Associates, or Agencies.

Business entities are linked through `foundation.parties`.

---

# 2. Objectives

- Secure authentication
- Centralized authorization
- Role-Based Access Control (RBAC)
- Multi-session support
- OTP Authentication
- Password Management
- Session Management
- Device Management
- Audit Logging

---

# 3. Scope

Included

- Users
- Login
- Password Management
- OTP
- Sessions
- Refresh Tokens
- Roles
- Permissions
- User Roles
- Login History
- Security Events

Not Included

- Employee Details
- Customer Details
- Advisor Details
- CRM
- Investments
- Reports

---

# 4. Module Architecture

```
                    Identity

                         │

      ┌──────────────────┼────────────────────┐

      ▼                  ▼                    ▼

 Authentication     Authorization        Security

      │                  │                    │

      ▼                  ▼                    ▼

 Users             Roles              Sessions

 Credentials       Permissions        OTP

 Passwords         User Roles         Devices

 Login History     Role Permissions   Refresh Tokens

                                      Audit Logs
```

---

# 5. Database Schema

```sql
CREATE SCHEMA IF NOT EXISTS identity;
```

---

# 6. Module Components

Authentication

- users
- authentication_methods
- otp_requests
- user_sessions
- refresh_tokens
- password_history
- login_history

Authorization

- roles
- permissions
- role_permission_profiles
- user_roles

Security

- devices
- user_devices
- account_lockouts

Audit

- audit_logs
- security_events

---

# 7. Entity Relationship Diagram

```
Foundation.Party
        │
        ▼
     Users
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
Credentials       User Roles      Sessions
                     │               │
                     ▼               ▼
                   Roles        Refresh Tokens
                     │
                     ▼
               Role Permissions
                     │
                     ▼
                Permissions

Users
   │
   ├───────────────┐
   ▼               ▼
OTP Requests   Login History
   │
   ▼
Password History

Users
   │
   ▼
Security Events
```

---

# 8. Business Rules

## Authentication

- Every User belongs to one Party.
- One Party may have multiple User accounts (configurable).
- Passwords are stored only as Argon2id hashes.
- Passwords are never reversible.
- Password history prevents reuse.
- OTP expires after configurable duration.
- Refresh tokens are stored hashed.
- Access tokens are never stored.

---

## Authorization

- User can have multiple Roles.
- Role can have multiple Permissions.
- Permissions are additive.
- Super Administrator bypasses permission checks.

---

## Session

- Multiple active sessions supported.
- Session timeout configurable.
- Sessions can be revoked individually.
- Logout revokes refresh token.

---

## Security

- Maximum failed login attempts configurable.
- Account lock duration configurable.
- Device trust supported.
- MFA optional.

---

# 9. Tables

Authentication

| Table |
|--------|
| users |
| user_credentials |
| otp_requests |
| user_sessions |
| refresh_tokens |
| password_history |
| login_history |

Authorization

| Table |
|--------|
| roles |
| permissions |
| role_permissions |
| user_roles |

Security

| Table |
|--------|
| devices |
| user_devices |
| account_lockouts |

Audit

| Table |
|--------|
| audit_logs |
| security_events |

---

# 10. Authentication Flow

```
Login

↓

Validate Username

↓

Verify Password

↓

OTP Required?

↓

Yes --------→ Verify OTP

↓

Generate JWT

↓

Create Session

↓

Store Refresh Token

↓

Login Success
```

---

# 11. Authorization Flow

```
User

↓

Roles

↓

Permissions

↓

API Authorization

↓

Grant / Deny
```

---

# 12. Security Standards

Password Hash

Argon2id

Transport

HTTPS TLS 1.3

Access Token

JWT

Refresh Token

JWT (Hashed)

OTP

6 Digits

Default Expiry

5 Minutes

Session Timeout

30 Minutes (Configurable)

Maximum Login Attempts

5

Password History

Last 5 Passwords

---

# 13. REST APIs

Authentication

POST /api/v1/auth/login

POST /api/v1/auth/logout

POST /api/v1/auth/refresh

POST /api/v1/auth/forgot-password

POST /api/v1/auth/reset-password

POST /api/v1/auth/change-password

POST /api/v1/auth/send-otp

POST /api/v1/auth/verify-otp

Authorization

GET /api/v1/roles

POST /api/v1/roles

GET /api/v1/permissions

POST /api/v1/permissions

POST /api/v1/users/{id}/roles

DELETE /api/v1/users/{id}/roles/{roleId}

Sessions

GET /api/v1/sessions

DELETE /api/v1/sessions/{id}

---

# 14. Future Enhancements

- Multi-Factor Authentication (MFA)
- Biometric Login
- OAuth2
- Google Login
- Microsoft Login
- Apple Login
- SAML Authentication
- LDAP Integration
- Active Directory Integration
- Single Sign-On (SSO)
- Risk-Based Authentication
- Adaptive MFA

---

# Next Sections

Part 2 will contain complete PostgreSQL CREATE TABLE statements for:

- users
- user_credentials
- password_history
- otp_requests
- refresh_tokens
- user_sessions
- login_history

Followed by Part 3 (Roles & Permissions), Part 4 (Security & Audit), and the final implementation details.