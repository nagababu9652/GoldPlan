# Advisor Center Database Design

# Part 3 -- Organization Setup (Simplified)

## Overview

This version reduces the number of tables while keeping the design
scalable.

## Tables

1.  lookups
2.  departments
3.  designations
4.  employees
5.  designation_history
6.  advisors
7.  associates
8.  agencies
9.  arn_holders

## lookups

``` sql
CREATE TABLE lookups(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 category VARCHAR(50) NOT NULL,
 code VARCHAR(50) NOT NULL,
 display_name VARCHAR(100) NOT NULL,
 description TEXT,
 sort_order INT DEFAULT 0,
 is_active BOOLEAN DEFAULT TRUE,
 UNIQUE(category,code)
);
```

## departments

``` sql
CREATE TABLE departments(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id UUID REFERENCES organizations(id),
 department_code VARCHAR(20),
 department_name VARCHAR(100) NOT NULL,
 description TEXT,
 status_lookup_id UUID REFERENCES lookups(id)
);
```

## designations

``` sql
CREATE TABLE designations(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id UUID REFERENCES organizations(id),
 department_id UUID REFERENCES departments(id),
 designation_code VARCHAR(20),
 designation_name VARCHAR(100),
 status_lookup_id UUID REFERENCES lookups(id)
);
```

## employees

``` sql
CREATE TABLE employees(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 party_id UUID NOT NULL REFERENCES parties(id),
 organization_id UUID NOT NULL REFERENCES organizations(id),
 branch_id UUID REFERENCES branches(id),
 employee_code VARCHAR(30) NOT NULL,
 department_id UUID REFERENCES departments(id),
 designation_id UUID REFERENCES designations(id),
 reporting_manager_id UUID REFERENCES employees(id),
 joining_date DATE,
 employment_type_id UUID REFERENCES lookups(id),
 salary NUMERIC(18,2),
 status_lookup_id UUID REFERENCES lookups(id),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(organization_id,employee_code)
);
```

## designation_history

``` sql
CREATE TABLE designation_history(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 employee_id UUID REFERENCES employees(id),
 designation_id UUID REFERENCES designations(id),
 department_id UUID REFERENCES departments(id),
 effective_from DATE,
 effective_to DATE,
 remarks TEXT
);
```

## advisors

``` sql
CREATE TABLE advisors(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 party_id UUID REFERENCES parties(id),
 organization_id UUID REFERENCES organizations(id),
 advisor_code VARCHAR(30),
 arn_number VARCHAR(30),
 arn_valid_from DATE,
 arn_valid_to DATE,
 euin_number VARCHAR(30),
 joining_date DATE,
 status_lookup_id UUID REFERENCES lookups(id)
);
```

## associates

``` sql
CREATE TABLE associates(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 party_id UUID REFERENCES parties(id),
 organization_id UUID REFERENCES organizations(id),
 advisor_id UUID REFERENCES advisors(id),
 associate_code VARCHAR(30),
 commission_percentage NUMERIC(5,2),
 joining_date DATE,
 status_lookup_id UUID REFERENCES lookups(id)
);
```

## agencies

``` sql
CREATE TABLE agencies(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 party_id UUID REFERENCES parties(id),
 organization_id UUID REFERENCES organizations(id),
 advisor_id UUID REFERENCES advisors(id),
 agency_code VARCHAR(30),
 license_number VARCHAR(50),
 status_lookup_id UUID REFERENCES lookups(id)
);
```

## arn_holders

``` sql
CREATE TABLE arn_holders(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 party_id UUID REFERENCES parties(id),
 organization_id UUID REFERENCES organizations(id),
 arn_number VARCHAR(30) UNIQUE,
 validity_from DATE,
 validity_to DATE,
 status_lookup_id UUID REFERENCES lookups(id)
);
```

## Suggested Seed Categories

-   GENDER
-   MARITAL_STATUS
-   ADDRESS_TYPE
-   CONTACT_TYPE
-   DOCUMENT_TYPE
-   EMPLOYMENT_TYPE
-   STATUS
-   KYC_STATUS
-   RELATIONSHIP_TYPE
-   CLIENT_TYPE
-   RISK_PROFILE
-   COMMISSION_TYPE
