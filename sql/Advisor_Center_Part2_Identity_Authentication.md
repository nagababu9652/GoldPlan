# Advisor Center Database Design

# Part 2 - Identity & Authentication

This module contains the authentication, authorization and security
model.

## Tables

1.  users
2.  user_credentials
3.  roles
4.  permissions
5.  user_roles
6.  role_permissions
7.  user_permissions
8.  otp_requests
9.  user_sessions
10. refresh_tokens
11. login_history
12. user_devices
13. password_history
14. password_reset_tokens
15. email_verifications
16. allowed_ips
17. organization_security_settings

> **Recommended Enhancements**
>
> -   Add `organization_id` and optional `branch_id` to `roles`.
> -   Replace free-text `purpose` and `delivery_method` with PostgreSQL
>     ENUMs or lookup tables.
> -   Add `last_successful_login` to `users`.
> -   Add `revoked_reason` to `refresh_tokens` and `user_sessions`.

``` sql
CREATE TYPE otp_purpose AS ENUM ('LOGIN','PASSWORD_RESET','EMAIL_VERIFICATION','PHONE_VERIFICATION','CLIENT_INVITE','MFA_LOGIN');
CREATE TYPE otp_delivery_method AS ENUM ('EMAIL','SMS','WHATSAPP','AUTHENTICATOR');

CREATE TABLE users(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
 username VARCHAR(100) UNIQUE NOT NULL,
 email VARCHAR(255) UNIQUE,
 phone VARCHAR(20),
 login_allowed BOOLEAN DEFAULT TRUE,
 is_active BOOLEAN DEFAULT TRUE,
 is_verified BOOLEAN DEFAULT FALSE,
 last_successful_login TIMESTAMP,
 default_home_page VARCHAR(100),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 deleted_at TIMESTAMP
);

CREATE TABLE user_credentials(
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 password_hash TEXT NOT NULL,
 password_algorithm VARCHAR(30) DEFAULT 'argon2id',
 password_changed_at TIMESTAMP,
 password_expires_at TIMESTAMP,
 failed_login_attempts INT DEFAULT 0,
 locked_until TIMESTAMP,
 force_password_change BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id UUID REFERENCES organizations(id),
 branch_id UUID REFERENCES branches(id),
 role_code VARCHAR(50) UNIQUE NOT NULL,
 role_name VARCHAR(100) NOT NULL,
 description TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 module_name VARCHAR(100),
 permission_code VARCHAR(100) UNIQUE,
 permission_name VARCHAR(100),
 description TEXT
);

CREATE TABLE user_roles(user_id UUID REFERENCES users(id) ON DELETE CASCADE, role_id UUID REFERENCES roles(id) ON DELETE CASCADE, PRIMARY KEY(user_id,role_id));
CREATE TABLE role_permissions(role_id UUID REFERENCES roles(id) ON DELETE CASCADE, permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY(role_id,permission_id));
CREATE TABLE user_permissions(user_id UUID REFERENCES users(id) ON DELETE CASCADE, permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE, allowed BOOLEAN DEFAULT TRUE, PRIMARY KEY(user_id,permission_id));

CREATE TABLE otp_requests(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 email VARCHAR(255),
 phone VARCHAR(20),
 otp_hash TEXT NOT NULL,
 purpose otp_purpose NOT NULL,
 delivery_method otp_delivery_method NOT NULL,
 attempts INT DEFAULT 0,
 max_attempts INT DEFAULT 5,
 expires_at TIMESTAMP NOT NULL,
 verified_at TIMESTAMP,
 status VARCHAR(20) DEFAULT 'PENDING',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 token_hash TEXT NOT NULL,
 expires_at TIMESTAMP,
 revoked_at TIMESTAMP,
 revoked_reason TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 refresh_token_id UUID REFERENCES refresh_tokens(id),
 login_at TIMESTAMP,
 expires_at TIMESTAMP,
 logout_at TIMESTAMP,
 revoked_reason TEXT,
 ip_address INET,
 user_agent TEXT,
 device_name VARCHAR(200),
 is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE login_history(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 login_time TIMESTAMP,
 logout_time TIMESTAMP,
 ip_address INET,
 browser VARCHAR(100),
 operating_system VARCHAR(100),
 device_name VARCHAR(100),
 success BOOLEAN,
 failure_reason TEXT
);

CREATE TABLE user_devices(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 device_uuid UUID,
 device_name VARCHAR(100),
 device_type VARCHAR(50),
 trusted BOOLEAN DEFAULT FALSE,
 last_used TIMESTAMP,
 registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_history(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 password_hash TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 token_hash TEXT,
 expires_at TIMESTAMP,
 used_at TIMESTAMP,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_verifications(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 email VARCHAR(255),
 verification_token_hash TEXT,
 expires_at TIMESTAMP,
 verified_at TIMESTAMP,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE allowed_ips(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID REFERENCES users(id),
 ip_address INET NOT NULL,
 description VARCHAR(100),
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_security_settings(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id UUID REFERENCES organizations(id),
 login_with_email BOOLEAN DEFAULT TRUE,
 login_with_mobile BOOLEAN DEFAULT FALSE,
 login_with_username BOOLEAN DEFAULT TRUE,
 otp_enabled BOOLEAN DEFAULT TRUE,
 mfa_enabled BOOLEAN DEFAULT FALSE,
 password_min_length INT DEFAULT 8,
 password_expiry_days INT DEFAULT 90,
 max_login_attempts INT DEFAULT 5,
 session_timeout_minutes INT DEFAULT 30,
 allow_multiple_sessions BOOLEAN DEFAULT TRUE,
 remember_me_enabled BOOLEAN DEFAULT TRUE,
 ip_restriction_enabled BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
