-- ============================================================================
-- Advisor Center - Complete Database Migration Script
-- ============================================================================
-- This script drops existing tables and recreates the entire database schema
-- as defined in the SDS documents.
--
-- Schemas:
--   foundation    - Shared master data (geography, lookups, parties, docs)
--   identity      - Authentication, authorization, security, audit
--   organization  - Organizational hierarchy and workforce management
--   crm           - Customer relationship management
--
-- Order: DROP (reverse dependency) -> CREATE SCHEMAS -> CREATE TABLES -> SEED
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: DROP EXISTING TABLES (Reverse Dependency Order)
-- ============================================================================

-- CRM Schema (depends on organization, foundation, identity)
DROP TABLE IF EXISTS crm.customer_kyc_history CASCADE;
DROP TABLE IF EXISTS crm.customer_communication_preferences CASCADE;
DROP TABLE IF EXISTS crm.customer_risk_profiles CASCADE;
DROP TABLE IF EXISTS crm.customer_fatca CASCADE;
DROP TABLE IF EXISTS crm.customer_kyc CASCADE;
DROP TABLE IF EXISTS crm.group_member_order CASCADE;
DROP TABLE IF EXISTS crm.customer_merge_history CASCADE;
DROP TABLE IF EXISTS crm.group_split_history CASCADE;
DROP TABLE IF EXISTS crm.group_merge_history CASCADE;
DROP TABLE IF EXISTS crm.customer_relationships CASCADE;
DROP TABLE IF EXISTS crm.customer_status_history CASCADE;
DROP TABLE IF EXISTS crm.group_members CASCADE;
DROP TABLE IF EXISTS crm.customers CASCADE;
DROP TABLE IF EXISTS crm.customer_groups CASCADE;

-- Organization Schema (depends on foundation, identity)
DROP TABLE IF EXISTS organization.organization_holidays CASCADE;
DROP TABLE IF EXISTS organization.employee_certifications CASCADE;
DROP TABLE IF EXISTS organization.employee_skills CASCADE;
DROP TABLE IF EXISTS organization.employee_assignments CASCADE;
DROP TABLE IF EXISTS organization.employee_department_history CASCADE;
DROP TABLE IF EXISTS organization.employee_branch_history CASCADE;
DROP TABLE IF EXISTS organization.employee_reporting CASCADE;
DROP TABLE IF EXISTS organization.employee_roles CASCADE;
DROP TABLE IF EXISTS organization.employees CASCADE;
DROP TABLE IF EXISTS organization.designations CASCADE;
DROP TABLE IF EXISTS organization.departments CASCADE;
DROP TABLE IF EXISTS organization.organization_settings CASCADE;
DROP TABLE IF EXISTS organization.branches CASCADE;
DROP TABLE IF EXISTS organization.organizations CASCADE;

-- Identity Schema (depends on foundation)
DROP TABLE IF EXISTS identity.audit_logs CASCADE;
DROP TABLE IF EXISTS identity.security_events CASCADE;
DROP TABLE IF EXISTS identity.account_lockouts CASCADE;
DROP TABLE IF EXISTS identity.user_devices CASCADE;
DROP TABLE IF EXISTS identity.devices CASCADE;
DROP TABLE IF EXISTS identity.user_roles CASCADE;
DROP TABLE IF EXISTS identity.role_permission_profiles CASCADE;
DROP TABLE IF EXISTS identity.profile_permissions CASCADE;
DROP TABLE IF EXISTS identity.permission_profiles CASCADE;
DROP TABLE IF EXISTS identity.roles CASCADE;
DROP TABLE IF EXISTS identity.permissions CASCADE;
DROP TABLE IF EXISTS identity.login_history CASCADE;
DROP TABLE IF EXISTS identity.refresh_tokens CASCADE;
DROP TABLE IF EXISTS identity.user_sessions CASCADE;
DROP TABLE IF EXISTS identity.otp_requests CASCADE;
DROP TABLE IF EXISTS identity.password_history CASCADE;
DROP TABLE IF EXISTS identity.authentication_methods CASCADE;
DROP TABLE IF EXISTS identity.users CASCADE;

-- Foundation Schema (no external dependencies)
DROP TABLE IF EXISTS foundation.document_files CASCADE;
DROP TABLE IF EXISTS foundation.documents CASCADE;
DROP TABLE IF EXISTS foundation.document_types CASCADE;
DROP TABLE IF EXISTS foundation.document_categories CASCADE;
DROP TABLE IF EXISTS foundation.party_bank_accounts CASCADE;
DROP TABLE IF EXISTS foundation.party_contacts CASCADE;
DROP TABLE IF EXISTS foundation.party_addresses CASCADE;
DROP TABLE IF EXISTS foundation.parties CASCADE;
DROP TABLE IF EXISTS foundation.financial_years CASCADE;
DROP TABLE IF EXISTS foundation.currencies CASCADE;
DROP TABLE IF EXISTS foundation.lookup_values CASCADE;
DROP TABLE IF EXISTS foundation.lookup_categories CASCADE;
DROP TABLE IF EXISTS foundation.cities CASCADE;
DROP TABLE IF EXISTS foundation.states CASCADE;
DROP TABLE IF EXISTS foundation.countries CASCADE;

-- Drop views
DROP VIEW IF EXISTS foundation.vw_document_summary CASCADE;
DROP VIEW IF EXISTS foundation.vw_party_summary CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS foundation.generate_party_code CASCADE;
DROP FUNCTION IF EXISTS foundation.set_updated_at CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS foundation.party_code_seq CASCADE;

-- Drop schemas
DROP SCHEMA IF EXISTS crm CASCADE;
DROP SCHEMA IF EXISTS organization CASCADE;
DROP SCHEMA IF EXISTS identity CASCADE;
DROP SCHEMA IF EXISTS foundation CASCADE;

-- ============================================================================
-- SECTION 2: CREATE SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS foundation;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS organization;
CREATE SCHEMA IF NOT EXISTS crm;

-- ============================================================================
-- SECTION 3: FOUNDATION MODULE
-- ============================================================================
-- 3.1 Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 3.2 Geography Tables
-- ============================================================================

CREATE TABLE foundation.countries
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_code        VARCHAR(5) NOT NULL,
    iso2                CHAR(2) NOT NULL,
    iso3                CHAR(3),
    country_name        VARCHAR(100) NOT NULL,
    nationality         VARCHAR(100),
    phone_code          VARCHAR(10),
    currency_code       VARCHAR(10),
    is_default          BOOLEAN DEFAULT FALSE,
    display_order       INTEGER DEFAULT 1,
    remarks             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          BIGINT,
    updated_at          TIMESTAMP,
    updated_by          BIGINT,
    deleted_at          TIMESTAMP,
    deleted_by          BIGINT,
    version_no          INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_country_code UNIQUE(country_code),
    CONSTRAINT uq_country_name UNIQUE(country_name)
);

CREATE INDEX idx_country_name ON foundation.countries(country_name);

CREATE TABLE foundation.states
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id          BIGINT NOT NULL,
    state_code          VARCHAR(10),
    state_name          VARCHAR(100) NOT NULL,
    gst_state_code      VARCHAR(5),
    display_order       INTEGER DEFAULT 1,
    remarks             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          BIGINT,
    updated_at          TIMESTAMP,
    updated_by          BIGINT,
    deleted_at          TIMESTAMP,
    deleted_by          BIGINT,
    version_no          INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_state_country FOREIGN KEY(country_id) REFERENCES foundation.countries(id),
    CONSTRAINT uq_state UNIQUE(country_id, state_name)
);

CREATE INDEX idx_state_country ON foundation.states(country_id);
CREATE INDEX idx_state_name ON foundation.states(state_name);

CREATE TABLE foundation.cities
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    state_id            BIGINT NOT NULL,
    city_name           VARCHAR(100) NOT NULL,
    district_name       VARCHAR(100),
    pin_code            VARCHAR(10),
    latitude            NUMERIC(10,6),
    longitude           NUMERIC(10,6),
    display_order       INTEGER DEFAULT 1,
    remarks             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          BIGINT,
    updated_at          TIMESTAMP,
    updated_by          BIGINT,
    deleted_at          TIMESTAMP,
    deleted_by          BIGINT,
    version_no          INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_city_state FOREIGN KEY(state_id) REFERENCES foundation.states(id),
    CONSTRAINT uq_city UNIQUE(state_id, city_name)
);

CREATE INDEX idx_city_state ON foundation.cities(state_id);
CREATE INDEX idx_city_name ON foundation.cities(city_name);

-- ============================================================================
-- 3.3 Lookup Tables
-- ============================================================================

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
    CONSTRAINT uq_lookup_category_code UNIQUE(category_code),
    CONSTRAINT uq_lookup_category_name UNIQUE(category_name)
);

CREATE INDEX idx_lookup_category_name ON foundation.lookup_categories(category_name);
CREATE INDEX idx_lookup_category_code ON foundation.lookup_categories(category_code);

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
    CONSTRAINT fk_lookup_category FOREIGN KEY(category_id) REFERENCES foundation.lookup_categories(id),
    CONSTRAINT uq_lookup_value UNIQUE(category_id, value_code),
    CONSTRAINT uq_lookup_name UNIQUE(category_id, value_name)
);

CREATE INDEX idx_lookup_category ON foundation.lookup_values(category_id);
CREATE INDEX idx_lookup_name ON foundation.lookup_values(value_name);
CREATE INDEX idx_lookup_code ON foundation.lookup_values(value_code);

-- ============================================================================
-- 3.4 Party Tables
-- ============================================================================

CREATE TABLE foundation.parties
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT,
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
    CONSTRAINT uq_party_code UNIQUE(organization_id, party_code),
    CONSTRAINT uq_party_pan UNIQUE(organization_id, pan_number),
    CONSTRAINT fk_party_type FOREIGN KEY(party_type_id) REFERENCES foundation.lookup_values(id),
    CONSTRAINT fk_party_gender FOREIGN KEY(gender_id) REFERENCES foundation.lookup_values(id),
    CONSTRAINT fk_party_marital FOREIGN KEY(marital_status_id) REFERENCES foundation.lookup_values(id)
);

CREATE INDEX idx_party_name ON foundation.parties(display_name);
CREATE INDEX idx_party_mobile ON foundation.parties(mobile_number);
CREATE INDEX idx_party_email ON foundation.parties(email);
CREATE INDEX idx_party_pan ON foundation.parties(pan_number);
CREATE INDEX idx_party_org ON foundation.parties(organization_id);

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
    CONSTRAINT fk_address_party FOREIGN KEY(party_id) REFERENCES foundation.parties(id),
    CONSTRAINT fk_address_type FOREIGN KEY(address_type_id) REFERENCES foundation.lookup_values(id),
    CONSTRAINT fk_address_city FOREIGN KEY(city_id) REFERENCES foundation.cities(id),
    CONSTRAINT fk_address_state FOREIGN KEY(state_id) REFERENCES foundation.states(id),
    CONSTRAINT fk_address_country FOREIGN KEY(country_id) REFERENCES foundation.countries(id)
);

CREATE INDEX idx_address_party ON foundation.party_addresses(party_id);
CREATE INDEX idx_address_city ON foundation.party_addresses(city_id);
CREATE INDEX idx_address_primary ON foundation.party_addresses(is_primary);

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
    CONSTRAINT fk_contact_party FOREIGN KEY(party_id) REFERENCES foundation.parties(id),
    CONSTRAINT fk_contact_type FOREIGN KEY(contact_type_id) REFERENCES foundation.lookup_values(id)
);

CREATE INDEX idx_contact_party ON foundation.party_contacts(party_id);
CREATE INDEX idx_contact_value ON foundation.party_contacts(contact_value);
CREATE INDEX idx_contact_primary ON foundation.party_contacts(is_primary);

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
    CONSTRAINT fk_bank_party FOREIGN KEY(party_id) REFERENCES foundation.parties(id),
    CONSTRAINT fk_account_type FOREIGN KEY(account_type_id) REFERENCES foundation.lookup_values(id)
);

CREATE INDEX idx_bank_party ON foundation.party_bank_accounts(party_id);
CREATE INDEX idx_bank_ifsc ON foundation.party_bank_accounts(ifsc_code);
CREATE INDEX idx_bank_account ON foundation.party_bank_accounts(account_number);

-- ============================================================================
-- 3.5 Document Tables
-- ============================================================================

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
    CONSTRAINT uq_document_category_code UNIQUE(category_code),
    CONSTRAINT uq_document_category_name UNIQUE(category_name)
);

CREATE INDEX idx_document_category_name ON foundation.document_categories(category_name);

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
    CONSTRAINT fk_document_type_category FOREIGN KEY(category_id) REFERENCES foundation.document_categories(id),
    CONSTRAINT uq_document_type UNIQUE(type_code)
);

CREATE INDEX idx_document_type_category ON foundation.document_types(category_id);

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
    CONSTRAINT fk_document_type FOREIGN KEY(document_type_id) REFERENCES foundation.document_types(id)
);

CREATE INDEX idx_document_entity ON foundation.documents(entity_type, entity_id);
CREATE INDEX idx_document_type ON foundation.documents(document_type_id);

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
    CONSTRAINT fk_document_file FOREIGN KEY(document_id) REFERENCES foundation.documents(id)
);

CREATE INDEX idx_document_file_document ON foundation.document_files(document_id);
CREATE INDEX idx_document_file_current ON foundation.document_files(is_current);

-- ============================================================================
-- 3.6 Master Tables
-- ============================================================================

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
    CONSTRAINT uq_currency_code UNIQUE(currency_code)
);

CREATE INDEX idx_currency_code ON foundation.currencies(currency_code);

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
    CONSTRAINT uq_financial_year UNIQUE(financial_year),
    CONSTRAINT chk_financial_year_dates CHECK(start_date < end_date)
);

CREATE INDEX idx_financial_year ON foundation.financial_years(financial_year);
CREATE INDEX idx_financial_year_current ON foundation.financial_years(is_current);

-- ============================================================================
-- 3.7 Foundation Views
-- ============================================================================

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
LEFT JOIN foundation.party_contacts pc ON p.id = pc.party_id AND pc.is_primary = TRUE
LEFT JOIN foundation.party_addresses pa ON p.id = pa.party_id AND pa.is_primary = TRUE
LEFT JOIN foundation.cities c ON pa.city_id = c.id
LEFT JOIN foundation.states s ON pa.state_id = s.id
LEFT JOIN foundation.countries co ON pa.country_id = co.id;

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
JOIN foundation.document_types dt ON dt.id = d.document_type_id
LEFT JOIN foundation.document_files df ON df.document_id = d.id AND df.is_current = TRUE;

-- ============================================================================
-- 3.8 Foundation Functions & Triggers
-- ============================================================================

CREATE SEQUENCE foundation.party_code_seq START 1;

CREATE OR REPLACE FUNCTION foundation.generate_party_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_id BIGINT;
BEGIN
    SELECT nextval('foundation.party_code_seq') INTO next_id;
    RETURN 'PTY-' || LPAD(next_id::TEXT, 8, '0');
END;
$$;

CREATE OR REPLACE FUNCTION foundation.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_party_updated BEFORE UPDATE ON foundation.parties FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_party_address_updated BEFORE UPDATE ON foundation.party_addresses FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_party_contact_updated BEFORE UPDATE ON foundation.party_contacts FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_party_bank_updated BEFORE UPDATE ON foundation.party_bank_accounts FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_document_updated BEFORE UPDATE ON foundation.documents FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_lookup_category_updated BEFORE UPDATE ON foundation.lookup_categories FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_lookup_value_updated BEFORE UPDATE ON foundation.lookup_values FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_country_updated BEFORE UPDATE ON foundation.countries FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_state_updated BEFORE UPDATE ON foundation.states FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();
CREATE TRIGGER trg_city_updated BEFORE UPDATE ON foundation.cities FOR EACH ROW EXECUTE FUNCTION foundation.set_updated_at();

-- ============================================================================
-- SECTION 4: IDENTITY MODULE
-- ============================================================================

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
    CONSTRAINT fk_user_party FOREIGN KEY(party_id) REFERENCES foundation.parties(id),
    CONSTRAINT uq_username UNIQUE(username),
    CONSTRAINT uq_email UNIQUE(email)
);

CREATE INDEX idx_user_party ON identity.users(party_id);
CREATE INDEX idx_user_username ON identity.users(username);
CREATE INDEX idx_user_email ON identity.users(email);

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
    CONSTRAINT fk_auth_user FOREIGN KEY(user_id) REFERENCES identity.users(id)
);

CREATE INDEX idx_auth_user ON identity.authentication_methods(user_id);
CREATE INDEX idx_auth_type ON identity.authentication_methods(authentication_type);

CREATE TABLE identity.password_history
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    password_hash       TEXT NOT NULL,
    changed_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by          BIGINT,
    CONSTRAINT fk_password_user FOREIGN KEY(user_id) REFERENCES identity.users(id)
);

CREATE INDEX idx_password_user ON identity.password_history(user_id);

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
    CONSTRAINT fk_otp_user FOREIGN KEY(user_id) REFERENCES identity.users(id)
);

CREATE INDEX idx_otp_destination ON identity.otp_requests(destination);
CREATE INDEX idx_otp_expiry ON identity.otp_requests(expires_at);

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
    CONSTRAINT fk_session_user FOREIGN KEY(user_id) REFERENCES identity.users(id)
);

CREATE INDEX idx_session_user ON identity.user_sessions(user_id);
CREATE INDEX idx_session_uuid ON identity.user_sessions(session_uuid);
CREATE INDEX idx_session_active ON identity.user_sessions(is_active);

CREATE TABLE identity.refresh_tokens
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id              BIGINT NOT NULL,
    token_hash              TEXT NOT NULL,
    expires_at              TIMESTAMP NOT NULL,
    revoked_at              TIMESTAMP,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_session FOREIGN KEY(session_id) REFERENCES identity.user_sessions(id)
);

CREATE INDEX idx_refresh_session ON identity.refresh_tokens(session_id);
CREATE INDEX idx_refresh_expiry ON identity.refresh_tokens(expires_at);

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
    CONSTRAINT fk_login_user FOREIGN KEY(user_id) REFERENCES identity.users(id)
);

CREATE INDEX idx_login_user ON identity.login_history(user_id);
CREATE INDEX idx_login_time ON identity.login_history(login_timestamp);

-- ============================================================================
-- 4.1 Authorization Tables
-- ============================================================================

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
    CONSTRAINT uq_permission_code UNIQUE(permission_code)
);

CREATE INDEX idx_permission_module ON identity.permissions(module_name);
CREATE INDEX idx_permission_code ON identity.permissions(permission_code);

CREATE TABLE identity.roles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id         BIGINT,
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
    CONSTRAINT uq_role UNIQUE(organization_id, role_code)
);

CREATE INDEX idx_role_org ON identity.roles(organization_id);
CREATE INDEX idx_role_name ON identity.roles(role_name);

CREATE TABLE identity.permission_profiles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id         BIGINT,
    profile_code            VARCHAR(50) NOT NULL,
    profile_name            VARCHAR(150) NOT NULL,
    description             TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by              BIGINT,
    updated_at              TIMESTAMP,
    updated_by              BIGINT,
    version_no              INTEGER DEFAULT 1,
    is_active               BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_permission_profile UNIQUE(organization_id, profile_code)
);

CREATE INDEX idx_permission_profile_org ON identity.permission_profiles(organization_id);

CREATE TABLE identity.profile_permissions
(
    profile_id          BIGINT NOT NULL,
    permission_id       BIGINT NOT NULL,
    allow_access        BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(profile_id, permission_id),
    CONSTRAINT fk_profile_permission FOREIGN KEY(profile_id) REFERENCES identity.permission_profiles(id),
    CONSTRAINT fk_permission FOREIGN KEY(permission_id) REFERENCES identity.permissions(id)
);

CREATE INDEX idx_profile_permission ON identity.profile_permissions(permission_id);

CREATE TABLE identity.role_permission_profiles
(
    role_id             BIGINT NOT NULL,
    profile_id          BIGINT NOT NULL,
    assigned_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by         BIGINT,
    PRIMARY KEY(role_id, profile_id),
    CONSTRAINT fk_role_profile FOREIGN KEY(role_id) REFERENCES identity.roles(id),
    CONSTRAINT fk_profile FOREIGN KEY(profile_id) REFERENCES identity.permission_profiles(id)
);

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
    CONSTRAINT fk_user_role_user FOREIGN KEY(user_id) REFERENCES identity.users(id),
    CONSTRAINT fk_user_role_role FOREIGN KEY(role_id) REFERENCES identity.roles(id),
    CONSTRAINT uq_user_role UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON identity.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON identity.user_roles(role_id);

-- ============================================================================
-- 4.2 Security & Audit Tables
-- ============================================================================

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
    CONSTRAINT uq_device_uuid UNIQUE(device_uuid),
    CONSTRAINT uq_device_fingerprint UNIQUE(device_fingerprint)
);

CREATE INDEX idx_device_uuid ON identity.devices(device_uuid);
CREATE INDEX idx_device_fingerprint ON identity.devices(device_fingerprint);

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
    CONSTRAINT fk_user_device_user FOREIGN KEY(user_id) REFERENCES identity.users(id),
    CONSTRAINT fk_user_device_device FOREIGN KEY(device_id) REFERENCES identity.devices(id),
    CONSTRAINT uq_user_device UNIQUE(user_id, device_id)
);

CREATE INDEX idx_user_device_user ON identity.user_devices(user_id);
CREATE INDEX idx_user_device_device ON identity.user_devices(device_id);

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
    CONSTRAINT fk_lockout_user FOREIGN KEY(user_id) REFERENCES identity.users(id)
);

CREATE INDEX idx_lockout_user ON identity.account_lockouts(user_id);
CREATE INDEX idx_lockout_status ON identity.account_lockouts(is_locked);

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
    CONSTRAINT fk_security_user FOREIGN KEY(user_id) REFERENCES identity.users(id),
    CONSTRAINT fk_security_device FOREIGN KEY(device_id) REFERENCES identity.devices(id),
    CONSTRAINT fk_security_session FOREIGN KEY(session_id) REFERENCES identity.user_sessions(id)
);

CREATE INDEX idx_security_user ON identity.security_events(user_id);
CREATE INDEX idx_security_event ON identity.security_events(event_type);
CREATE INDEX idx_security_timestamp ON identity.security_events(event_timestamp);

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
    CONSTRAINT fk_audit_user FOREIGN KEY(user_id) REFERENCES identity.users(id),
    CONSTRAINT fk_audit_session FOREIGN KEY(session_id) REFERENCES identity.user_sessions(id)
);

CREATE INDEX idx_audit_user ON identity.audit_logs(user_id);
CREATE INDEX idx_audit_table ON identity.audit_logs(table_name);
CREATE INDEX idx_audit_record ON identity.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created ON identity.audit_logs(created_at);

-- ============================================================================
-- SECTION 5: ORGANIZATION MODULE
-- ============================================================================

CREATE TABLE organization.organizations
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_code           VARCHAR(30) NOT NULL,
    legal_name                  VARCHAR(250) NOT NULL,
    trade_name                  VARCHAR(250),
    registration_number         VARCHAR(100),
    pan_number                  VARCHAR(20),
    gst_number                  VARCHAR(20),
    email                       VARCHAR(150),
    phone                       VARCHAR(30),
    website                     VARCHAR(250),
    logo_url                    TEXT,
    financial_year_id           BIGINT,
    base_currency_id            BIGINT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    deleted_at                  TIMESTAMP,
    deleted_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_org_code UNIQUE(organization_code)
);

CREATE INDEX idx_org_name ON organization.organizations(legal_name);
CREATE INDEX idx_org_pan ON organization.organizations(pan_number);

CREATE TABLE organization.branches
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    parent_branch_id            BIGINT,
    branch_code                 VARCHAR(30) NOT NULL,
    branch_name                 VARCHAR(200) NOT NULL,
    branch_type                 VARCHAR(50),
    manager_employee_id         BIGINT,
    email                       VARCHAR(150),
    phone                       VARCHAR(30),
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    deleted_at                  TIMESTAMP,
    deleted_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_branch_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT fk_parent_branch FOREIGN KEY(parent_branch_id) REFERENCES organization.branches(id),
    CONSTRAINT uq_branch_code UNIQUE(organization_id, branch_code)
);

CREATE INDEX idx_branch_org ON organization.branches(organization_id);
CREATE INDEX idx_branch_parent ON organization.branches(parent_branch_id);

CREATE TABLE organization.departments
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    branch_id                   BIGINT NOT NULL,
    department_code             VARCHAR(30) NOT NULL,
    department_name             VARCHAR(150) NOT NULL,
    description                 TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_department_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT fk_department_branch FOREIGN KEY(branch_id) REFERENCES organization.branches(id),
    CONSTRAINT uq_department UNIQUE(branch_id, department_code)
);

CREATE INDEX idx_department_branch ON organization.departments(branch_id);

CREATE TABLE organization.designations
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    designation_code            VARCHAR(30) NOT NULL,
    designation_name            VARCHAR(150) NOT NULL,
    hierarchy_level             INTEGER,
    description                 TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_designation_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT uq_designation UNIQUE(organization_id, designation_code)
);

CREATE INDEX idx_designation_org ON organization.designations(organization_id);
CREATE INDEX idx_designation_level ON organization.designations(hierarchy_level);

CREATE TABLE organization.organization_settings
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    setting_key                 VARCHAR(100) NOT NULL,
    setting_value               TEXT,
    data_type                   VARCHAR(30) DEFAULT 'STRING',
    category                    VARCHAR(50),
    description                 TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP,
    CONSTRAINT fk_setting_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT uq_org_setting UNIQUE(organization_id, setting_key)
);

-- ============================================================================
-- 5.1 Employee Tables
-- ============================================================================

CREATE TABLE organization.employees
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    party_id                    BIGINT NOT NULL,
    employee_code               VARCHAR(30) NOT NULL,
    branch_id                   BIGINT NOT NULL,
    department_id               BIGINT NOT NULL,
    designation_id              BIGINT NOT NULL,
    joining_date                DATE NOT NULL,
    confirmation_date           DATE,
    relieving_date              DATE,
    employment_status           VARCHAR(30) DEFAULT 'ACTIVE',
    official_email              VARCHAR(150),
    official_mobile             VARCHAR(30),
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    deleted_at                  TIMESTAMP,
    deleted_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_employee_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT fk_employee_party FOREIGN KEY(party_id) REFERENCES foundation.parties(id),
    CONSTRAINT fk_employee_branch FOREIGN KEY(branch_id) REFERENCES organization.branches(id),
    CONSTRAINT fk_employee_department FOREIGN KEY(department_id) REFERENCES organization.departments(id),
    CONSTRAINT fk_employee_designation FOREIGN KEY(designation_id) REFERENCES organization.designations(id),
    CONSTRAINT uq_employee_code UNIQUE(organization_id, employee_code),
    CONSTRAINT uq_employee_party UNIQUE(organization_id, party_id)
);

CREATE INDEX idx_employee_branch ON organization.employees(branch_id);
CREATE INDEX idx_employee_department ON organization.employees(department_id);
CREATE INDEX idx_employee_party ON organization.employees(party_id);

CREATE TABLE organization.employee_roles
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id             BIGINT NOT NULL,
    role_id                 BIGINT NOT NULL,
    effective_from          DATE NOT NULL,
    effective_to            DATE,
    is_primary              BOOLEAN DEFAULT FALSE,
    assigned_by             BIGINT,
    assigned_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emp_role_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id),
    CONSTRAINT fk_emp_role_identity FOREIGN KEY(role_id) REFERENCES identity.roles(id)
);

CREATE INDEX idx_emp_role_employee ON organization.employee_roles(employee_id);
CREATE INDEX idx_emp_role_role ON organization.employee_roles(role_id);

CREATE TABLE organization.employee_reporting
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id             BIGINT NOT NULL,
    manager_employee_id     BIGINT NOT NULL,
    effective_from          DATE,
    effective_to            DATE,
    CONSTRAINT fk_reporting_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id),
    CONSTRAINT fk_reporting_manager FOREIGN KEY(manager_employee_id) REFERENCES organization.employees(id)
);

CREATE TABLE organization.employee_branch_history
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id             BIGINT NOT NULL,
    branch_id               BIGINT NOT NULL,
    effective_from          DATE,
    effective_to            DATE,
    remarks                 TEXT,
    CONSTRAINT fk_branch_history_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id),
    CONSTRAINT fk_branch_history_branch FOREIGN KEY(branch_id) REFERENCES organization.branches(id)
);

CREATE TABLE organization.employee_department_history
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id             BIGINT NOT NULL,
    department_id           BIGINT NOT NULL,
    effective_from          DATE,
    effective_to            DATE,
    remarks                 TEXT,
    CONSTRAINT fk_department_history_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id),
    CONSTRAINT fk_department_history_department FOREIGN KEY(department_id) REFERENCES organization.departments(id)
);

-- ============================================================================
-- 5.2 Employee Assignments & Admin
-- ============================================================================

CREATE TABLE organization.employee_assignments
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id                 BIGINT NOT NULL,
    assignment_type             VARCHAR(50) NOT NULL,
    entity_type                 VARCHAR(50) NOT NULL,
    entity_id                   BIGINT NOT NULL,
    effective_from              DATE NOT NULL,
    effective_to                DATE,
    is_primary                  BOOLEAN DEFAULT FALSE,
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_assignment_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id)
);

CREATE INDEX idx_assignment_employee ON organization.employee_assignments(employee_id);
CREATE INDEX idx_assignment_entity ON organization.employee_assignments(entity_type, entity_id);
CREATE INDEX idx_assignment_type ON organization.employee_assignments(assignment_type);

CREATE TABLE organization.employee_skills
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id                 BIGINT NOT NULL,
    skill_name                  VARCHAR(150) NOT NULL,
    proficiency_level           SMALLINT,
    certified                   BOOLEAN DEFAULT FALSE,
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id)
);

CREATE TABLE organization.employee_certifications
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id                 BIGINT NOT NULL,
    certification_name          VARCHAR(200) NOT NULL,
    certificate_number          VARCHAR(100),
    issuing_authority           VARCHAR(200),
    issue_date                  DATE,
    expiry_date                 DATE,
    verification_status         VARCHAR(30) DEFAULT 'PENDING',
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificate_employee FOREIGN KEY(employee_id) REFERENCES organization.employees(id)
);

CREATE TABLE organization.organization_holidays
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    branch_id                   BIGINT,
    holiday_date                DATE NOT NULL,
    holiday_name                VARCHAR(200) NOT NULL,
    holiday_type                VARCHAR(30),
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_holiday_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT fk_holiday_branch FOREIGN KEY(branch_id) REFERENCES organization.branches(id)
);

-- ============================================================================
-- SECTION 6: CRM MODULE
-- ============================================================================

CREATE TABLE crm.customer_groups
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    group_code                  VARCHAR(30) NOT NULL,
    group_name                  VARCHAR(250) NOT NULL,
    group_type                  VARCHAR(30) DEFAULT 'INDIVIDUAL',
    head_customer_id            BIGINT,
    primary_branch_id           BIGINT,
    primary_advisor_employee_id BIGINT,
    risk_profile                VARCHAR(30),
    investment_objective        VARCHAR(100),
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_group_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT fk_group_branch FOREIGN KEY(primary_branch_id) REFERENCES organization.branches(id),
    CONSTRAINT fk_group_advisor FOREIGN KEY(primary_advisor_employee_id) REFERENCES organization.employees(id),
    CONSTRAINT uq_group_code UNIQUE(organization_id, group_code)
);

CREATE INDEX idx_group_org ON crm.customer_groups(organization_id);
CREATE INDEX idx_group_branch ON crm.customer_groups(primary_branch_id);
CREATE INDEX idx_group_advisor ON crm.customer_groups(primary_advisor_employee_id);

CREATE TABLE crm.customers
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id             BIGINT NOT NULL,
    party_id                    BIGINT NOT NULL,
    customer_code               VARCHAR(30) NOT NULL,
    occupation                  VARCHAR(150),
    annual_income               NUMERIC(18,2),
    net_worth                   NUMERIC(18,2),
    risk_profile                VARCHAR(30),
    tax_category                VARCHAR(50),
    resident_status             VARCHAR(30),
    onboarding_date             DATE,
    customer_status             VARCHAR(30) DEFAULT 'ACTIVE',
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by                  BIGINT,
    updated_at                  TIMESTAMP,
    updated_by                  BIGINT,
    version_no                  INTEGER DEFAULT 1,
    is_active                   BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_customer_org FOREIGN KEY(organization_id) REFERENCES organization.organizations(id),
    CONSTRAINT fk_customer_party FOREIGN KEY(party_id) REFERENCES foundation.parties(id),
    CONSTRAINT uq_customer_code UNIQUE(organization_id, customer_code),
    CONSTRAINT uq_customer_party UNIQUE(organization_id, party_id)
);

CREATE INDEX idx_customer_party ON crm.customers(party_id);
CREATE INDEX idx_customer_status ON crm.customers(customer_status);
CREATE INDEX idx_customer_risk ON crm.customers(risk_profile);

CREATE TABLE crm.group_members
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_group_id           BIGINT NOT NULL,
    customer_id                 BIGINT NOT NULL,
    relationship_type           VARCHAR(50),
    is_group_head               BOOLEAN DEFAULT FALSE,
    joined_on                   DATE DEFAULT CURRENT_DATE,
    left_on                     DATE,
    remarks                     TEXT,
    CONSTRAINT fk_member_group FOREIGN KEY(customer_group_id) REFERENCES crm.customer_groups(id),
    CONSTRAINT fk_member_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id),
    CONSTRAINT uq_group_member UNIQUE(customer_group_id, customer_id)
);

CREATE INDEX idx_group_member_group ON crm.group_members(customer_group_id);
CREATE INDEX idx_group_member_customer ON crm.group_members(customer_id);

CREATE TABLE crm.customer_status_history
(
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id             BIGINT NOT NULL,
    old_status              VARCHAR(30),
    new_status              VARCHAR(30) NOT NULL,
    changed_on              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by              BIGINT,
    reason                  TEXT,
    CONSTRAINT fk_status_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id)
);

-- ============================================================================
-- 6.1 CRM Relationships & Operations
-- ============================================================================

CREATE TABLE crm.customer_relationships
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_group_id           BIGINT NOT NULL,
    customer_id                 BIGINT NOT NULL,
    related_customer_id         BIGINT NOT NULL,
    relationship_type           VARCHAR(50) NOT NULL,
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rel_group FOREIGN KEY(customer_group_id) REFERENCES crm.customer_groups(id),
    CONSTRAINT fk_rel_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id),
    CONSTRAINT fk_rel_related FOREIGN KEY(related_customer_id) REFERENCES crm.customers(id)
);

CREATE INDEX idx_customer_relationship_group ON crm.customer_relationships(customer_group_id);
CREATE INDEX idx_customer_relationship_customer ON crm.customer_relationships(customer_id);

CREATE TABLE crm.group_merge_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_group_id             BIGINT NOT NULL,
    target_group_id             BIGINT NOT NULL,
    merged_by                   BIGINT,
    merged_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    merge_reason                TEXT,
    remarks                     TEXT,
    CONSTRAINT fk_merge_source FOREIGN KEY(source_group_id) REFERENCES crm.customer_groups(id),
    CONSTRAINT fk_merge_target FOREIGN KEY(target_group_id) REFERENCES crm.customer_groups(id)
);

CREATE TABLE crm.group_split_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    original_group_id           BIGINT NOT NULL,
    new_group_id                BIGINT NOT NULL,
    split_by                    BIGINT,
    split_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    split_reason                TEXT,
    remarks                     TEXT,
    CONSTRAINT fk_split_original FOREIGN KEY(original_group_id) REFERENCES crm.customer_groups(id),
    CONSTRAINT fk_split_new FOREIGN KEY(new_group_id) REFERENCES crm.customer_groups(id)
);

CREATE TABLE crm.customer_merge_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_customer_id          BIGINT NOT NULL,
    target_customer_id          BIGINT NOT NULL,
    merged_by                   BIGINT,
    merged_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    merge_reason                TEXT,
    remarks                     TEXT,
    CONSTRAINT fk_customer_merge_source FOREIGN KEY(source_customer_id) REFERENCES crm.customers(id),
    CONSTRAINT fk_customer_merge_target FOREIGN KEY(target_customer_id) REFERENCES crm.customers(id)
);

CREATE TABLE crm.group_member_order
(
    customer_group_id       BIGINT NOT NULL,
    customer_id             BIGINT NOT NULL,
    display_order           INTEGER NOT NULL,
    PRIMARY KEY(customer_group_id, customer_id),
    CONSTRAINT fk_order_group FOREIGN KEY(customer_group_id) REFERENCES crm.customer_groups(id),
    CONSTRAINT fk_order_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id)
);

-- ============================================================================
-- 6.2 Customer KYC & Compliance
-- ============================================================================

CREATE TABLE crm.customer_kyc
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id                 BIGINT NOT NULL,
    pan_number                  VARCHAR(20),
    aadhaar_masked              VARCHAR(20),
    kyc_status                  VARCHAR(30) NOT NULL,
    kyc_verified_date           DATE,
    kyc_expiry_date             DATE,
    verification_method         VARCHAR(50),
    verification_reference      VARCHAR(100),
    politically_exposed_person  BOOLEAN DEFAULT FALSE,
    minor_customer              BOOLEAN DEFAULT FALSE,
    guardian_customer_id        BIGINT,
    remarks                     TEXT,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP,
    CONSTRAINT fk_customer_kyc FOREIGN KEY(customer_id) REFERENCES crm.customers(id),
    CONSTRAINT fk_guardian FOREIGN KEY(guardian_customer_id) REFERENCES crm.customers(id),
    CONSTRAINT uq_customer_kyc UNIQUE(customer_id)
);

CREATE INDEX idx_customer_kyc_status ON crm.customer_kyc(kyc_status);
CREATE INDEX idx_customer_pan ON crm.customer_kyc(pan_number);

CREATE TABLE crm.customer_fatca
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id                 BIGINT NOT NULL,
    tax_residency_country       VARCHAR(100),
    tax_identification_number   VARCHAR(100),
    us_person                   BOOLEAN DEFAULT FALSE,
    fatca_status                VARCHAR(30),
    declaration_date            DATE,
    review_date                 DATE,
    remarks                     TEXT,
    CONSTRAINT fk_fatca_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id),
    CONSTRAINT uq_customer_fatca UNIQUE(customer_id)
);

CREATE TABLE crm.customer_risk_profiles
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id                 BIGINT NOT NULL,
    risk_profile                VARCHAR(30) NOT NULL,
    assessed_on                 DATE,
    next_review_date            DATE,
    assessment_method           VARCHAR(100),
    assessed_by_employee_id     BIGINT,
    remarks                     TEXT,
    CONSTRAINT fk_risk_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id),
    CONSTRAINT fk_risk_employee FOREIGN KEY(assessed_by_employee_id) REFERENCES organization.employees(id)
);

CREATE INDEX IF NOT EXISTS idx_customer_risk ON crm.customer_risk_profiles(risk_profile);

CREATE TABLE crm.customer_communication_preferences
(
    customer_id                 BIGINT PRIMARY KEY,
    preferred_language          VARCHAR(30),
    preferred_channel           VARCHAR(30),
    email_enabled               BOOLEAN DEFAULT TRUE,
    sms_enabled                 BOOLEAN DEFAULT TRUE,
    whatsapp_enabled            BOOLEAN DEFAULT TRUE,
    postal_enabled              BOOLEAN DEFAULT FALSE,
    marketing_consent           BOOLEAN DEFAULT FALSE,
    do_not_disturb              BOOLEAN DEFAULT FALSE,
    updated_at                  TIMESTAMP,
    CONSTRAINT fk_pref_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id)
);

CREATE TABLE crm.customer_kyc_history
(
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id                 BIGINT NOT NULL,
    previous_status             VARCHAR(30),
    new_status                  VARCHAR(30),
    reviewed_on                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by                 BIGINT,
    review_reason               TEXT,
    CONSTRAINT fk_history_customer FOREIGN KEY(customer_id) REFERENCES crm.customers(id),
    CONSTRAINT fk_history_employee FOREIGN KEY(reviewed_by) REFERENCES organization.employees(id)
);

-- ============================================================================
-- SECTION 7: SEED DATA
-- ============================================================================

-- ============================================================================
-- 7.1 Foundation Seed Data
-- ============================================================================

INSERT INTO foundation.countries (country_code, iso2, iso3, country_name, nationality, phone_code, currency_code, is_default)
VALUES ('IND', 'IN', 'IND', 'India', 'Indian', '+91', 'INR', TRUE);

INSERT INTO foundation.states (country_id, state_code, state_name)
VALUES
(1, 'AP', 'Andhra Pradesh'),
(1, 'TS', 'Telangana'),
(1, 'KA', 'Karnataka'),
(1, 'TN', 'Tamil Nadu'),
(1, 'MH', 'Maharashtra'),
(1, 'DL', 'Delhi'),
(1, 'UP', 'Uttar Pradesh'),
(1, 'GJ', 'Gujarat');

INSERT INTO foundation.lookup_categories (category_code, category_name)
VALUES
('GENDER', 'Gender'),
('MARITAL_STATUS', 'Marital Status'),
('ADDRESS_TYPE', 'Address Type'),
('CONTACT_TYPE', 'Contact Type'),
('PARTY_TYPE', 'Party Type'),
('RELATIONSHIP', 'Relationship'),
('CUSTOMER_STATUS', 'Customer Status'),
('OCCUPATION', 'Occupation');

INSERT INTO foundation.lookup_values (category_id, value_code, value_name)
VALUES
-- Gender (1)
(1, 'M', 'Male'),
(1, 'F', 'Female'),
(1, 'O', 'Other'),
-- Marital Status (2)
(2, 'SINGLE', 'Single'),
(2, 'MARRIED', 'Married'),
(2, 'DIVORCED', 'Divorced'),
(2, 'WIDOWED', 'Widowed'),
-- Address Type (3)
(3, 'HOME', 'Residential'),
(3, 'OFFICE', 'Office'),
(3, 'COMMUNICATION', 'Communication'),
(3, 'REGISTERED', 'Registered Office'),
(3, 'BILLING', 'Billing'),
(3, 'SHIPPING', 'Shipping'),
-- Contact Type (4)
(4, 'MOBILE', 'Mobile'),
(4, 'EMAIL', 'Email'),
(4, 'WHATSAPP', 'WhatsApp'),
(4, 'PHONE', 'Office Phone'),
(4, 'FAX', 'Fax'),
-- Party Type (5)
(5, 'INDIVIDUAL', 'Individual'),
(5, 'COMPANY', 'Company'),
(5, 'TRUST', 'Trust'),
(5, 'HUF', 'HUF'),
(5, 'PARTNERSHIP', 'Partnership'),
-- Relationship (6)
(6, 'SELF', 'Self'),
(6, 'SPOUSE', 'Spouse'),
(6, 'SON', 'Son'),
(6, 'DAUGHTER', 'Daughter'),
(6, 'FATHER', 'Father'),
(6, 'MOTHER', 'Mother'),
(6, 'BROTHER', 'Brother'),
(6, 'SISTER', 'Sister'),
(6, 'OTHER', 'Other'),
-- Customer Status (7)
(7, 'ACTIVE', 'Active'),
(7, 'INACTIVE', 'Inactive'),
(7, 'SUSPENDED', 'Suspended'),
(7, 'CLOSED', 'Closed'),
-- Occupation (8)
(8, 'SALARIED', 'Salaried'),
(8, 'SELF_EMPLOYED', 'Self Employed'),
(8, 'BUSINESS', 'Business'),
(8, 'PROFESSIONAL', 'Professional'),
(8, 'RETIRED', 'Retired'),
(8, 'HOUSEWIFE', 'Housewife'),
(8, 'STUDENT', 'Student');

INSERT INTO foundation.currencies (currency_code, currency_name, currency_symbol, is_base_currency)
VALUES ('INR', 'Indian Rupee', '₹', TRUE);

INSERT INTO foundation.financial_years (financial_year, start_date, end_date, assessment_year, is_current)
VALUES ('2025-2026', '2025-04-01', '2026-03-31', '2026-2027', TRUE);

INSERT INTO foundation.document_categories (category_code, category_name)
VALUES
('IDENTITY', 'Identity'),
('ADDRESS', 'Address Proof'),
('FINANCIAL', 'Financial'),
('KYC', 'KYC');

INSERT INTO foundation.document_types (category_id, type_code, type_name)
VALUES
(1, 'PAN', 'PAN Card'),
(1, 'AADHAAR', 'Aadhaar Card'),
(1, 'PASSPORT', 'Passport'),
(1, 'VOTER_ID', 'Voter ID'),
(2, 'UTILITY', 'Utility Bill'),
(2, 'BANK_STMT', 'Bank Statement'),
(3, 'ITR', 'Income Tax Return'),
(3, 'CHEQUE', 'Cancelled Cheque'),
(4, 'KYC_FORM', 'KYC Form'),
(4, 'PHOTO', 'Photograph');

-- ============================================================================
-- 7.2 Identity Seed Data
-- ============================================================================

INSERT INTO identity.permissions (permission_code, permission_name, module_name)
VALUES
-- Customer permissions
('customer.view', 'View Customer', 'CRM'),
('customer.create', 'Create Customer', 'CRM'),
('customer.edit', 'Edit Customer', 'CRM'),
('customer.delete', 'Delete Customer', 'CRM'),
('customer_group.merge', 'Merge Customer Groups', 'CRM'),
('customer_group.split', 'Split Customer Groups', 'CRM'),
-- Investment permissions
('investment.create', 'Create Investment', 'Investment'),
('investment.edit', 'Edit Investment', 'Investment'),
('investment.approve', 'Approve Investment', 'Investment'),
('investment.view', 'View Investment', 'Investment'),
-- Report permissions
('report.view', 'View Reports', 'Reports'),
('report.export', 'Export Reports', 'Reports'),
('report.generate', 'Generate Reports', 'Reports'),
-- Employee permissions
('employee.view', 'View Employee', 'Organization'),
('employee.create', 'Create Employee', 'Organization'),
('employee.edit', 'Edit Employee', 'Organization'),
-- Settings permissions
('settings.manage', 'Manage Settings', 'Administration'),
('audit.view', 'View Audit Logs', 'Administration'),
-- System permissions
('system.admin', 'System Administrator', 'System'),
('user.manage', 'Manage Users', 'System');

INSERT INTO identity.roles (organization_id, role_code, role_name, is_system, is_default)
VALUES
(NULL, 'SUPER_ADMIN', 'Super Administrator', TRUE, FALSE),
(NULL, 'ORG_ADMIN', 'Organization Administrator', TRUE, FALSE),
(NULL, 'BRANCH_MANAGER', 'Branch Manager', TRUE, FALSE),
(NULL, 'ADVISOR', 'Financial Advisor', TRUE, TRUE),
(NULL, 'EMPLOYEE', 'Employee', TRUE, FALSE),
(NULL, 'RECEPTION', 'Receptionist', TRUE, FALSE);

-- ============================================================================
-- 7.3 Organization Seed Data
-- ============================================================================

INSERT INTO organization.organizations (organization_code, legal_name)
VALUES ('DEFAULT', 'Default Organization');

INSERT INTO organization.branches (organization_id, branch_code, branch_name)
VALUES (1, 'HO', 'Head Office');

INSERT INTO organization.departments (organization_id, branch_id, department_code, department_name)
VALUES
(1, 1, 'ADMIN', 'Administration'),
(1, 1, 'SALES', 'Sales'),
(1, 1, 'OPS', 'Operations'),
(1, 1, 'FINANCE', 'Finance'),
(1, 1, 'COMPLIANCE', 'Compliance'),
(1, 1, 'IT', 'Information Technology');

INSERT INTO organization.designations (organization_id, designation_code, designation_name, hierarchy_level)
VALUES
(1, 'MD', 'Managing Director', 1),
(1, 'CEO', 'Chief Executive Officer', 2),
(1, 'BM', 'Branch Manager', 3),
(1, 'FA', 'Financial Advisor', 4),
(1, 'RM', 'Relationship Manager', 4),
(1, 'EXEC', 'Executive', 5);

-- ============================================================================
-- 7.4 CRM Seed Data
-- ============================================================================

INSERT INTO crm.customer_groups (organization_id, group_code, group_name)
VALUES (1, 'GRP000001', 'Default Group');

COMMIT;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================