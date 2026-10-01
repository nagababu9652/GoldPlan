# FINPLAN — ADMIN, ORGANIZATION SETUP & ACCESS ARCHITECTURE

**Document:** `ADMIN_ACCESS_ARCHITECTURE.md`  
**Purpose:** Canonical architecture and business-flow specification for FinPlan Admin, Organization Setup, Head/Advisor access, Employee access, Client Portal access, Associates, Agencies, ARN Holders, permissions, assignments, invitations, and authorization.

---

# 1. Overall Architecture

```text
FINPLAN
│
├── FOUNDATION
│   ├── Party
│   ├── PartyAddress
│   ├── PartyContact
│   ├── PartyBankAccount
│   └── LookupValue
│
├── IDENTITY
│   ├── User
│   ├── UserRole
│   ├── Role
│   ├── Permission
│   ├── PermissionProfile
│   ├── UserSession
│   └── AccessInvitation
│
├── ORGANIZATION
│   ├── Organization
│   ├── Branch
│   ├── Department
│   ├── Designation
│   ├── Employee
│   ├── EmployeeReporting
│   ├── EmployeeAssignment
│   ├── Associate
│   ├── Agency
│   └── ARNHolder
│
└── CRM
    ├── Customer
    ├── CustomerGroup
    ├── GroupMember
    ├── Transactions
    ├── Meetings
    ├── Tasks
    ├── Documents
    ├── Goals
    └── Reports
```

The central design principle is:

```text
Party = who/what the person or organization is
User = login identity
Employee / Customer / Associate / Agency = business role
Permission = what the user may do
Assignment = which records the user may access
```

This separation must remain consistent across the whole platform.

---

# 2. Login Personas

| Persona | Login | Scope | Permissions |
|---|---|---|---|
| Head / Organization Admin | Yes | Entire organization | Full |
| Employee | Yes | Assigned organization records | Granted by Head |
| Client | Yes | Own client record only | Restricted/read-only initially |
| Associate | Not by default | None | Optional future portal |
| Agency | Not by default | None | Optional future portal |
| ARN Holder | Not automatically | None | Depends on linked person/entity |

FinPlan should use **one authentication system**.

```text
/login
   ↓
Authenticate User
   ↓
Build AccessContext
   ↓
HEAD      → /advisor-dashboard
EMPLOYEE  → /employee-dashboard
CLIENT    → /client-portal
```

Do not create separate login tables such as:

```text
advisor_users
employee_users
client_users
```

All logins should be based on `identity.User`.

---

# 3. Identity Relationship

A person/entity should have one Foundation identity.

```text
foundation.Party
        │
        ├── identity.User
        │
        ├── organization.Employee
        │
        ├── organization.Associate
        │
        ├── organization.Agency
        │
        └── crm.Customer
```

An existing Customer who later receives portal access must **not** receive a second Party.

Example:

```text
Party 51
   ├── Customer 17
   └── User 29
          role = CLIENT
```

The same principle applies to Employees and Associates if login access is added later.

---

# 4. Organization

One Organization owns all branches, staff, clients, settings, and administration.

## Required Organization Fields

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_code` | Required, unique |
| `organization_name` | Required |
| `legal_name` | Optional |
| `organization_type` | Required |
| `pan` | Optional |
| `gstin` | Optional |
| `registration_number` | Optional |
| `primary_email` | Required |
| `primary_phone` | Required |
| `website` | Optional |
| `logo_url` | Optional |
| `financial_year_start` | Optional |
| `default_currency` | Default `INR` |
| `timezone` | Default `Asia/Kolkata` |
| `status` | `ACTIVE / INACTIVE` |
| `created_at` | Required |
| `updated_at` | Required |

Address and contact details should preferably use the Foundation address/contact architecture rather than repeated address columns.

---

# 5. Admin Navigation

Recommended Admin navigation:

```text
Admin
│
├── Organization Setup
│   ├── Organization Profile
│   ├── Branches
│   ├── Departments
│   ├── Designations
│   ├── Employees
│   ├── Associates
│   ├── Agencies
│   └── ARN Holders
│
├── Access Management
│   ├── Roles
│   ├── Permission Profiles
│   ├── Employee Access
│   ├── Client Portal Access
│   └── Invitations
│
└── Administration
    ├── Audit Log
    ├── Security
    └── System Settings
```

Departments and Designations already belong to the Organization layer and should be administered here even if they were not part of the initial menu request.

---

# 6. Common List-Screen Design

All Organization Setup list screens should behave consistently.

Example:

```text
Employees                         Search...       [+ Add]

☐   Name       Branch       Type        Status
☐   Ravi       Tuni         Employee    Active
☐   Priya      Vizag        Employee    Active

2 selected

[Deactivate] [More Actions]
```

Common features:

```text
Search
Sort
Filter
Pagination
Checkbox selection
Select all visible
View
Edit
Deactivate
Reactivate
Bulk deactivate
Status filter
Created/updated dates
Export later
```

Use:

```text
Deactivate
```

instead of:

```text
Delete
```

for persisted business records.

Hard deletion should only be considered for unused, unreferenced setup records and only when it is safe. Once a record is referenced by business data, preserve it and deactivate it.

---

# 7. Branches

Route:

```text
/admin/organization/branches
```

## Branch Fields

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `branch_code` | Required, unique within organization |
| `branch_name` | Required |
| `branch_type` | `HEAD_OFFICE / BRANCH / OTHER` |
| `address` | Required |
| `city` | Required |
| `district` | Optional |
| `state` | Required |
| `country` | Default `India` |
| `postal_code` | Required |
| `phone` | Optional |
| `email` | Optional |
| `manager_employee_id` | Optional |
| `opening_date` | Optional |
| `closing_date` | Optional |
| `status` | `ACTIVE / INACTIVE` |
| `remarks` | Optional |
| `created_at` | Required |
| `updated_at` | Required |

Where practical, address/contact details should be linked through Foundation entities.

## Branch List UI

```text
Branches                                  [+ Add Branch]

☐  Code   Branch Name    City      Manager       Status
☐  HO     Head Office    Tuni      Srinivas      Active
☐  HYD    Hyderabad      Hyderabad Ravi          Active

[Deactivate Selected]
```

## Branch Actions

```text
View
Add
Edit
Assign Manager
Deactivate
Reactivate
Bulk Deactivate
Search
Filter
Export later
```

A Branch must not be permanently deleted if it has any related:

```text
Employees
Clients
Assignments
Transactions
Meetings
Documents
Reports
Historical activity
```

---

# 8. Employees

Route:

```text
/admin/organization/employees
```

Employee is an internal staff member of the organization.

Architecture:

```text
Party
 ├── personal/contact information
 ├── User → login
 └── Employee → employment information
```

## Employee Business Fields

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `party_id` | Required |
| `employee_code` | Required, unique |
| `branch_id` | Required |
| `department_id` | Required |
| `designation_id` | Required |
| `employment_type` | `FULL_TIME / PART_TIME / CONTRACT / etc.` |
| `joining_date` | Required |
| `confirmation_date` | Optional |
| `end_date` | Optional |
| `employment_status` | `ACTIVE / ON_LEAVE / RELIEVED / INACTIVE` |
| `reporting_manager_employee_id` | Prefer `EmployeeReporting` relationship |
| `work_email` | Required |
| `work_phone` | Optional |
| `remarks` | Optional |
| `created_at` | Required |
| `updated_at` | Required |

## Personal Fields

Personal data should remain on Party instead of being duplicated on Employee.

```text
First Name
Middle Name
Last Name
DOB
Gender
PAN
Email
Phone
Address
```

---

# 9. Employee List UI

```text
Employees                                     [+ Add Employee]

☐   Employee ID   Name          Branch       Role          Status
☐   FA-0001       Srinivas      Head Office  Advisor       Active
☐   RM-0002       Ravi          Head Office  RM            Active
☐   OPS-0003      Priya         Vizag        Operations    Active

[Disable Selected]
```

Selecting an Employee opens the Employee Profile.

---

# 10. Employee Profile

Route:

```text
/admin/organization/employees/{employee_id}
```

Recommended tabs:

```text
Overview
Employment
Contact
Access & Permissions
Assigned Clients
Reporting
Activity
```

## Overview

```text
Photo
Name
Employee Code
Designation
Department
Branch
Work Email
Phone
Joining Date
Employment Status
Login Status
```

## Employment

```text
Branch
Department
Designation
Employment Type
Joining Date
Confirmation Date
Reporting Manager
End Date
Status
Remarks
```

## Contact

```text
Personal Email
Work Email
Phone
Alternate Phone
Address
Emergency Contact later if needed
```

## Access & Permissions

Example:

```text
CLIENTS
☑ View
☑ Create
☑ Edit
☐ Deactivate

HOUSEHOLDS
☑ View
☑ Edit
☐ Deactivate

TRANSACTIONS
☑ View
☑ Create
☐ Edit
☐ Delete

MEETINGS
☑ View
☑ Create
☑ Edit

TASKS
☑ View
☑ Create
☑ Edit

DOCUMENTS
☑ View
☑ Upload
☐ Delete

REPORTS
☑ View
☐ Generate

ADMINISTRATION
☐ Branch Management
☐ Employee Management
☐ Permission Management
```

Actions:

```text
[Save Permissions]
[Disable Login]
[Reset Access]
```

These checkboxes must modify backend authorization records. They must never be treated as the security layer themselves.

## Assigned Clients

```text
Assigned Clients

☐ C-00001   Raj Kumar
☐ C-00012   Priya Sharma
☐ C-00016   Arun Rao

[+ Assign Clients]
[Remove Assignment]
```

This should use the existing `EmployeeAssignment` model.

## Reporting

```text
Reports To
Direct Reports
Reporting History
Effective From
Effective To
```

Use `EmployeeReporting` instead of duplicating reporting relationships across multiple tables where possible.

## Activity

Show relevant administrative and CRM activity later:

```text
Profile changes
Permission changes
Client assignments
Login enable/disable events
Meetings created
Tasks created
Important audit events
```

---

# 11. Employee Role vs Permission vs Assignment

These are three different concepts.

## Role

Answers:

> What is this user?

Example:

```text
EMPLOYEE
```

## Permission

Answers:

> What may this employee do?

Example:

```text
CLIENT.READ
CLIENT.UPDATE
TRANSACTION.READ
DOCUMENT.READ
MEETING.CREATE
```

## Assignment

Answers:

> Which records may this employee work with?

Example:

```text
Customer 17
Customer 24
Customer 31
```

A user must pass both **permission** and **scope/assignment** checks.

---

# 12. Employee Permissions

Use the existing identity permission architecture:

```text
Role
   ↓
PermissionProfile
   ↓
Permissions
```

The employee's base role may be:

```text
EMPLOYEE
```

Example permission codes:

```text
CLIENT.READ
CLIENT.CREATE
CLIENT.UPDATE
CLIENT.DEACTIVATE

GROUP.READ
GROUP.CREATE
GROUP.UPDATE
GROUP.DEACTIVATE

TRANSACTION.READ
TRANSACTION.CREATE
TRANSACTION.UPDATE

DOCUMENT.READ
DOCUMENT.UPLOAD
DOCUMENT.DELETE

MEETING.READ
MEETING.CREATE
MEETING.UPDATE

TASK.READ
TASK.CREATE
TASK.UPDATE

REPORT.READ
REPORT.GENERATE

ORG.BRANCH.READ
ORG.BRANCH.MANAGE

ORG.EMPLOYEE.READ
ORG.EMPLOYEE.MANAGE

ORG.PERMISSION.MANAGE
```

The Head receives all organization-level permissions.

Employees receive only what the Head explicitly grants.

---

# 13. Employee Permission Profiles

Recommended use of profiles:

```text
FINANCIAL_ADVISOR_STANDARD
RELATIONSHIP_MANAGER_STANDARD
OPERATIONS_STANDARD
COMPLIANCE_STANDARD
READ_ONLY_EMPLOYEE
```

A profile can provide defaults, but Head/Admin may customize individual access if required.

Example:

```text
FINANCIAL_ADVISOR_STANDARD

CLIENT.READ
CLIENT.CREATE
CLIENT.UPDATE

GROUP.READ

TRANSACTION.READ
TRANSACTION.CREATE
TRANSACTION.UPDATE

MEETING.READ
MEETING.CREATE
MEETING.UPDATE

TASK.READ
TASK.CREATE
TASK.UPDATE

DOCUMENT.READ
DOCUMENT.UPLOAD

REPORT.READ
```

Not included by default:

```text
EMPLOYEE.MANAGE
PERMISSION.MANAGE
CLIENT.DELETE
GROUP.DEACTIVATE
ORGANIZATION.UPDATE
```

---

# 14. Employee Client Access

Permission and client scope are separate.

Example:

```text
Ravi has:
CLIENT.UPDATE ✅

Customer 17 assigned to Ravi ✅
→ Ravi can edit Customer 17

Customer 91 assigned to Ravi ❌
→ Ravi cannot edit Customer 91
```

Use the existing:

```text
EmployeeAssignment
```

Recommended active assignment structure:

| Field | Value |
|---|---|
| `employee_id` | Employee |
| `assignment_type` | `ADVISOR` |
| `entity_type` | `CUSTOMER` |
| `entity_id` | Customer ID |
| `effective_from` | Start date |
| `effective_to` | Nullable |
| `is_primary` | Optional |
| `is_active` | True |

Initially, V1 should use direct Customer assignments.

Possible future entity scopes:

```text
CUSTOMER
CUSTOMER_GROUP
BRANCH
```

Do not add those broader scopes until the current Customer assignment model is stable.

---

# 15. Employee Creation Flow

Exact workflow:

```text
Head
 ↓
Admin
 ↓
Organization Setup
 ↓
Employees
 ↓
+ Add Employee
 ↓
Enter personal details
 ↓
Create/find Party
 ↓
Enter employment details
 ↓
Create Employee
 ↓
Assign:
    Branch
    Department
    Designation
    Reporting Manager
 ↓
Choose Permission Profile
 ↓
Customize permissions if necessary
 ↓
Assign Clients
 ↓
Enable Login?
 ├── No → save employee only
 └── Yes
       ↓
    Create Access Invitation
       ↓
    Send invitation
       ↓
    Employee sets password
       ↓
    User created/activated using SAME Party
       ↓
    EMPLOYEE role assigned
       ↓
    Login enabled
```

The Head should **not** set the employee's permanent password.

---

# 16. Editing Employee

Flow:

```text
Employee List
 ↓
Select Employee
 ↓
Edit Profile
 ↓
Change allowed fields
 ↓
Validate organization access
 ↓
Save
 ↓
Audit change
```

Head may change:

```text
Personal details
Branch
Department
Designation
Manager
Employment status
Permissions
Assigned clients
Login access
```

An Employee should normally only be able to edit limited self-profile fields such as:

```text
Phone
Profile photo
Possibly address
Password
```

An Employee must not change their own:

```text
Role
Permissions
Branch
Designation
Employment status
Reporting manager
Assigned client scope
```

unless an explicit privileged permission is introduced later.

---

# 17. Employee Deactivation

Never hard-delete an Employee record.

Flow:

```text
Head
 ↓
Deactivate Employee
 ↓
Confirmation
 ↓
Employee status → INACTIVE / RELIEVED
 ↓
Close active EmployeeAssignments
 ↓
Disable User account
 ↓
Revoke active sessions
 ↓
Preserve:
   Client history
   Meetings
   Transactions
   Tasks
   Audit logs
   Assignments
```

If active clients are assigned:

```text
Ravi currently manages 27 active clients.

[Reassign Clients]
[Deactivate After Reassignment]
```

FinPlan should warn the Head instead of silently leaving clients unmanaged.

---

# 18. Associates

Route:

```text
/admin/organization/associates
```

An Associate is an external individual associated with the organization and is not an internal Employee.

Architecture:

```text
Party
  ↓
Associate
```

## Associate Fields

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `party_id` | Required |
| `associate_code` | Required |
| `associate_type` | Required |
| `branch_id` | Optional |
| `agency_id` | Optional |
| `joining_date` | Required |
| `end_date` | Optional |
| `status` | `ACTIVE / INACTIVE` |
| `referral_code` | Optional |
| `remarks` | Optional |
| `created_at` | Required |
| `updated_at` | Required |

Party stores:

```text
Name
PAN
Email
Phone
Address
DOB
Gender
```

## Associate List UI

```text
Associates                                     [+ Add Associate]

☐   Code       Name          Agency        Branch       Status
☐   AS-0001    Ravi Kumar    ABC Agency    Tuni         Active
☐   AS-0002    Manoj         XYZ Agency    Vizag        Active

[Deactivate Selected]
```

## Associate Actions

```text
Add
View
Edit
Link Agency
Change Branch
Deactivate
Reactivate
Bulk Deactivate
View linked ARN
View activity
```

Associates do not automatically receive login access.

If an Associate Portal is introduced later, link a User to the existing Party.

---

# 19. Agencies

Route:

```text
/admin/organization/agencies
```

An Agency represents an external organization.

Architecture:

```text
Party (COMPANY)
   ↓
Agency
   ↓
Associates
```

## Agency Fields

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `party_id` | Required |
| `agency_code` | Required |
| `agency_name` | Required |
| `legal_name` | Optional |
| `pan` | Optional |
| `gstin` | Optional |
| `registration_number` | Optional |
| `branch_id` | Optional |
| `primary_contact_party_id` | Optional |
| `start_date` | Required |
| `end_date` | Optional |
| `status` | `ACTIVE / INACTIVE` |
| `remarks` | Optional |
| `created_at` | Required |
| `updated_at` | Required |

Contacts and addresses should use Foundation entities where practical.

## Agency List UI

```text
Agencies                                       [+ Add Agency]

☐   Code       Agency Name        Contact       City       Status
☐   AG-0001    ABC Financials     Ravi Kumar    Tuni       Active
☐   AG-0002    XYZ Services       Manoj         Vizag      Active

[Deactivate Selected]
```

## Agency Profile

Recommended sections:

```text
Overview
Associates
ARN Holders
Contact Details
Documents
Activity
```

## Agency Actions

```text
Add
View
Edit
Add/Remove Associates
Link ARN Holder
Upload Documents
Deactivate
Reactivate
Bulk Deactivate
```

---

# 20. ARN Holders

Assumption: ARN refers to an **AMFI Registration Number** used for mutual-fund distribution.

Route:

```text
/admin/organization/arn-holders
```

ARN should be modeled as a proper registration/entity record rather than a plain Employee or Associate text field.

## ARN Holder Fields

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `arn_number` | Required, unique as appropriate |
| `holder_party_id` | Required |
| `holder_type` | Required |
| `branch_id` | Optional |
| `employee_id` | Optional |
| `associate_id` | Optional |
| `agency_id` | Optional |
| `registration_date` | Optional |
| `valid_from` | Optional |
| `valid_to` | Optional |
| `status` | `ACTIVE / EXPIRED / SUSPENDED / INACTIVE` |
| `remarks` | Optional |
| `created_at` | Required |
| `updated_at` | Required |

Possible holder types:

```text
ORGANIZATION
EMPLOYEE
ASSOCIATE
AGENCY
OTHER
```

The final allowed types should reflect actual business requirements.

## ARN Holder List UI

```text
ARN Holders                                    [+ Add ARN]

☐   ARN          Holder             Type        Expiry        Status
☐   ARN-12345    Srinivas           Employee    12-06-2028    Active
☐   ARN-56789    ABC Financials     Agency      18-02-2029    Active

[Deactivate Selected]
```

## ARN Holder Profile

```text
ARN Number
Holder Name
Holder Type
Registration Date
Expiry Date
Linked Employee / Associate / Agency
Branch
Contact
Status
Documents
Remarks
```

## ARN Documents

Use the common Document system for:

```text
Registration certificate
Renewal certificate
Supporting documents
```

Do not create ARN-specific file-storage columns unless there is a strong reason.

## ARN Actions

```text
Add ARN
View
Edit
Link Holder
Link Branch
Link Agency/Associate/Employee
Renew
Mark Expired
Suspend
Deactivate
Reactivate
View History
Upload Documents
```

Never permanently delete an ARN record after it has been referenced by transactions, reports, commission data, or other historical business records.

---

# 21. Head / Organization Admin

The existing primary Advisor account should conceptually act as the Organization Head.

The Head has organization-level scope.

```text
Head
 │
 ├── All employees
 ├── All clients
 ├── All households/groups
 ├── All transactions
 ├── All meetings
 ├── All tasks
 ├── All documents
 ├── All reports
 ├── Manage assignments
 ├── Manage employee permissions
 ├── Invite employees
 ├── Disable employee access
 └── Enable/disable client portal access
```

Most importantly:

> Only the Head or another explicitly authorized Organization Admin may grant Employee access.

Employees must not self-register into an Organization as Employees.

Public registration should not allow arbitrary creation of privileged Employee/Admin accounts.

---

# 22. Employee Dashboard

Route:

```text
/employee-dashboard
```

Employees may reuse existing advisor components where suitable, but access must be scoped.

Recommended navigation:

```text
Dashboard
My Clients
Households
Transactions
Meetings
Tasks
Documents
Messages
Reports
```

Navigation must be permission-aware.

Example:

If the Employee lacks:

```text
TRANSACTION.READ
```

then `Transactions` should not appear.

However, frontend hiding is only user experience.

The backend must still reject direct API requests.

---

# 23. Client Portal

Route:

```text
/client-portal
```

An existing Client already has:

```text
Party
 ↓
Customer
```

When portal access is enabled:

```text
Party
 ├── Customer
 └── User
      └── CLIENT role
```

Do not create another Party.

## Client Portal Navigation

```text
Dashboard
My Profile
My Goals
My Investments
My Transactions
My Documents
My Reports
My Household
Messages
```

## Client V1 Access

| Module | Client |
|---|---|
| Profile | Read own |
| Household | Limited |
| Transactions | Read own |
| Goals | Read own |
| Investments | Read own |
| Reports | Read own |
| Documents | Read/download approved |
| Internal notes | No |
| Employee tasks | No |
| Other family member finances | No |
| CRM edit | No |

A Client should not see:

```text
Internal advisor remarks
Internal KYC notes
Employee tasks
Compliance notes
Other household members' PAN
Other household members' bank details
Other household members' transactions
Other household members' investments
```

Sharing the same Household does not imply financial-data access.

---

# 24. Client Portal Activation Flow

```text
Head / Authorized Employee
 ↓
Open Client
 ↓
Enable Portal Access
 ↓
Verify email/mobile
 ↓
Create AccessInvitation
 ↓
Client receives invitation
 ↓
Client sets password
 ↓
User linked to existing Party
 ↓
CLIENT role assigned
 ↓
Portal access active
```

Disable flow:

```text
Disable Portal Access
 ↓
User account disabled
 ↓
Sessions revoked
 ↓
Customer data remains untouched
```

Disabling portal access must not affect:

```text
Party
Customer
Household
Transactions
Documents
Goals
Reports
```

---

# 25. AccessInvitation

Introduce a dedicated access invitation entity.

## Fields

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `organization_id` | Organization |
| `party_id` | Existing/new person |
| `employee_id` | Nullable |
| `customer_id` | Nullable |
| `invitation_type` | `EMPLOYEE_ACCESS / CLIENT_PORTAL` |
| `target_role` | `EMPLOYEE / CLIENT` |
| `email` | Invitation destination |
| `token_hash` | Never store raw invitation token |
| `expires_at` | Required |
| `accepted_at` | Nullable |
| `revoked_at` | Nullable |
| `invited_by_user_id` | Head/Admin |
| `created_at` | Required |

Possible state can be derived:

```text
PENDING
ACCEPTED
EXPIRED
REVOKED
```

Do not store a permanent plain-text invitation token.

---

# 26. One Login Page

Use:

```text
/login
```

After authentication, resolve the active actor context.

Conceptual endpoint:

```text
/auth/context
```

Example Employee result:

```json
{
  "user_id": 12,
  "actor_type": "EMPLOYEE",
  "organization_id": 1,
  "employee_id": 8,
  "customer_id": null,
  "permissions": [
    "CLIENT.READ",
    "CLIENT.UPDATE",
    "TRANSACTION.READ"
  ]
}
```

Redirect:

```text
Head
→ /advisor-dashboard

Employee
→ /employee-dashboard

Client
→ /client-portal
```

---

# 27. Central AccessContext

A central AccessContext should become the foundation of authorization.

Conceptually:

```python
AccessContext(
    user_id=12,
    actor_type="EMPLOYEE",
    organization_id=1,
    employee_id=7,
    customer_id=None,
    permissions={
        "CLIENT.READ",
        "CLIENT.UPDATE",
        "TRANSACTION.READ",
    },
)
```

For a Client:

```python
AccessContext(
    user_id=40,
    actor_type="CLIENT",
    organization_id=1,
    employee_id=None,
    customer_id=82,
    permissions={
        "PORTAL.PROFILE.READ",
        "PORTAL.TRANSACTION.READ",
        "PORTAL.DOCUMENT.READ",
    },
)
```

Reusable backend checks should eventually look conceptually like:

```text
require_permission("CLIENT.READ")

require_customer_access(customer_id)

require_head()

require_employee()

require_client()
```

---

# 28. Request Authorization Flow

Every protected backend request must follow:

```text
API Request
   ↓
Validate JWT
   ↓
Resolve current User
   ↓
Check User is ACTIVE
   ↓
Resolve role/persona
   ↓
Resolve Organization
   ↓
Load live permissions
   ↓
Build AccessContext
   ↓
Check requested permission
   ↓
Check resource scope
   ↓
Perform operation
   ↓
Audit operation
```

Example:

```text
Employee requests:

PATCH /clients/17
```

Backend evaluates:

```text
Authenticated?                    ✅
Employee active?                 ✅
CLIENT.UPDATE?                   ✅
Customer 17 belongs to org?      ✅
Customer 17 assigned to user?    ✅

ALLOW
```

But:

```text
PATCH /clients/86

CLIENT.UPDATE?                   ✅
Customer 86 assigned?            ❌

403 Forbidden
```

---

# 29. Do Not Trust JWT for Live Permissions

JWT answers:

> Who is this user?

Database authorization answers:

> What is this user allowed to do right now?

Do not rely permanently on a permission list embedded in an access token.

Reason:

```text
Head removes TRANSACTION.UPDATE from Ravi
```

That change should take effect immediately rather than waiting for an old token to expire.

Recommended principle:

```text
JWT
→ Identity

Database
→ Current authorization
```

Role hints may exist in the token, but sensitive authorization decisions should use current database state.

---

# 30. Organization Boundary

No request may cross Organization boundaries.

Even if an Employee guesses another Customer ID:

```text
Customer.organization_id
```

must match:

```text
AccessContext.organization_id
```

before additional scope checks occur.

This applies to:

```text
Branches
Employees
Clients
Groups
Transactions
Documents
Meetings
Tasks
Reports
Agencies
Associates
ARN Holders
```

---

# 31. Admin Permission Codes

Recommended Admin permission namespace:

```text
ORG.BRANCH.READ
ORG.BRANCH.CREATE
ORG.BRANCH.UPDATE
ORG.BRANCH.DEACTIVATE

ORG.EMPLOYEE.READ
ORG.EMPLOYEE.CREATE
ORG.EMPLOYEE.UPDATE
ORG.EMPLOYEE.DEACTIVATE
ORG.EMPLOYEE.ACCESS_MANAGE

ORG.ASSOCIATE.READ
ORG.ASSOCIATE.CREATE
ORG.ASSOCIATE.UPDATE
ORG.ASSOCIATE.DEACTIVATE

ORG.AGENCY.READ
ORG.AGENCY.CREATE
ORG.AGENCY.UPDATE
ORG.AGENCY.DEACTIVATE

ORG.ARN.READ
ORG.ARN.CREATE
ORG.ARN.UPDATE
ORG.ARN.DEACTIVATE
```

Additional permissions may include:

```text
ORG.DEPARTMENT.READ
ORG.DEPARTMENT.MANAGE

ORG.DESIGNATION.READ
ORG.DESIGNATION.MANAGE

ORG.PERMISSION.READ
ORG.PERMISSION.MANAGE

ORG.INVITATION.READ
ORG.INVITATION.MANAGE

ORG.AUDIT.READ
```

Head receives the full set.

Other Employees receive only explicitly granted permissions.

---

# 32. Departments

Departments already belong in the Organization architecture.

Recommended fields:

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `department_code` | Required |
| `department_name` | Required |
| `description` | Optional |
| `head_employee_id` | Optional |
| `status` | ACTIVE / INACTIVE |
| `created_at` | Required |
| `updated_at` | Required |

Actions:

```text
Add
View
Edit
Assign Department Head
Deactivate
Reactivate
```

---

# 33. Designations

Recommended fields:

| Field | Requirement |
|---|---|
| `id` | Required |
| `organization_id` | Required |
| `designation_code` | Required |
| `designation_name` | Required |
| `description` | Optional |
| `level` | Optional |
| `status` | ACTIVE / INACTIVE |
| `created_at` | Required |
| `updated_at` | Required |

Actions:

```text
Add
View
Edit
Deactivate
Reactivate
```

Designation is an employment attribute.

It is not the same as login Role or Permission.

---

# 34. Employee Reporting

Use `EmployeeReporting` for reporting hierarchy.

Recommended conceptual fields:

```text
id
organization_id
employee_id
manager_employee_id
effective_from
effective_to
is_primary
remarks
created_at
updated_at
```

Rules:

```text
An active reporting relationship should have no effective_to.
Historical manager changes should be preserved.
Do not overwrite reporting history when a manager changes.
```

---

# 35. Login Enablement Is Separate From Business Record

Important principle:

```text
Employee != automatically User
Client   != automatically User
Associate != automatically User
```

An Employee can exist before login is enabled.

A Client can exist without Client Portal access.

This separation allows:

```text
Create business record first
Enable login later
Disable login without deleting business record
```

---

# 36. Session Revocation

When access is disabled:

```text
User.account_status → DISABLED
```

and all active login sessions should be revoked.

This applies to:

```text
Employee login disabled
Client portal disabled
Employee deactivated
Security lockout
Admin revocation
```

Do not leave valid refresh sessions active after account disablement.

---

# 37. Associates and Login

Associates should not automatically get login access.

If a future Associate Portal is required:

```text
Existing Associate Party
        ↓
Create/activate User
        ↓
Assign ASSOCIATE role
        ↓
Apply dedicated permissions/scope
```

Do not create a duplicate Party.

---

# 38. Agency Login

Agencies should not receive a login by default.

If an Agency Portal is introduced later, the preferred model would likely be:

```text
Agency Party
   ↓
Authorized Agency Contact Party
   ↓
User
```

rather than a shared login for an entire company.

Shared credentials should be avoided.

---

# 39. ARN Holder Linkage

ARN Holder should be able to link to the relevant business entity without forcing one universal ownership pattern.

Possible relationships:

```text
ARNHolder
 │
 ├── holder_party_id
 ├── employee_id nullable
 ├── associate_id nullable
 ├── agency_id nullable
 └── branch_id nullable
```

The holder's Party remains the primary identity.

---

# 40. Deactivation vs Delete Rules

Use deactivation/archive for:

```text
Branches
Employees
Associates
Agencies
ARN Holders
Departments
Designations
Users
Assignments
```

Hard delete should generally be avoided after a record has business references.

Examples:

```text
Employee leaves company
→ deactivate Employee + User
→ preserve meetings, tasks, transactions, assignments

Agency relationship ends
→ deactivate Agency
→ preserve referrals, ARN links, documents

ARN expires
→ mark EXPIRED
→ preserve registration history
```

---

# 41. Audit Log

Administrative and access changes should be auditable.

Recommended fields:

| Field | Purpose |
|---|---|
| `actor_user_id` | Who made the change |
| `organization_id` | Organization |
| `action` | What happened |
| `entity_type` | Employee, Branch, etc. |
| `entity_id` | Target record |
| `old_values` | Before |
| `new_values` | After |
| `timestamp` | When |
| `ip_address` | Optional |
| `device/user_agent` | Optional |

Important audit events:

```text
Employee created
Employee edited
Employee disabled
Permissions changed
Clients assigned
Clients unassigned
Login enabled
Login disabled
Invitation sent
Invitation accepted
Invitation revoked
Branch changed
Designation changed
Department changed
ARN updated
Agency deactivated
Associate deactivated
Client portal enabled
Client portal disabled
```

---

# 42. Business Rules to Lock

These rules are canonical.

```text
1. Every person/company should have one Party identity.

2. Giving login access must never create a duplicate Party.

3. Employee does not automatically mean User.
   Login is enabled separately.

4. Client does not automatically mean User.
   Portal access is enabled separately.

5. Associate does not automatically mean User.

6. Agency does not automatically mean User.

7. Head controls Employee access.

8. Permission determines WHAT an Employee can do.

9. Assignment determines WHICH Clients an Employee can access.

10. Both permission and assignment must pass.

11. Frontend visibility is not security.

12. Backend always enforces authorization.

13. Permissions are checked from current database state,
    not permanently trusted from JWT.

14. Employees, Branches, Associates, Agencies, ARN Holders,
    Departments and Designations should normally be deactivated,
    not hard-deleted.

15. Historical assignments remain preserved.

16. Historical reporting relationships remain preserved.

17. Disabling a login must revoke active sessions.

18. Clients initially receive read-only portal access.

19. One Client cannot read another Client's financial data merely
    because they share the same Household.

20. Organization boundaries can never be crossed.

21. Every administrative change should eventually be auditable.

22. Designation is not the same as Role.

23. Role is not the same as Permission.

24. Permission is not the same as Assignment.

25. Business records and login identity have separate lifecycles.

26. Client Portal disablement must never delete Client data.

27. Employee disablement must never delete employment or CRM history.

28. ARN history should be preserved once referenced.

29. Branch history should be preserved once referenced.

30. Invitation raw tokens must not be stored permanently.
```

---

# 43. End-to-End Organization Setup Flow

```text
CREATE ORGANIZATION
       ↓
Create Head Office Branch
       ↓
Create Head / Advisor
       ↓
HEAD LOGIN
       ↓
Admin → Organization Setup
       │
       ├── Create Branches
       │
       ├── Create Departments
       │
       ├── Create Designations
       │
       ├── Create Employees
       │      ↓
       │   Set Permissions
       │      ↓
       │   Assign Clients
       │      ↓
       │   Send Login Invitation
       │
       ├── Create Agencies
       │      ↓
       │   Add Associates
       │
       └── Add ARN Holders
              ↓
           Link appropriate
           entity/branch
```

---

# 44. Employee Login Flow

```text
EMPLOYEE LOGIN
       ↓
Validate credentials
       ↓
Resolve User
       ↓
Check User active
       ↓
Resolve Employee
       ↓
Check Employee active
       ↓
Resolve Organization
       ↓
Load permissions
       ↓
Load assignments
       ↓
Build AccessContext
       ↓
Employee Dashboard
       ↓
Show only allowed modules
       ↓
Every API call verifies:
    permission
    +
    assignment/resource scope
```

---

# 45. Client Creation and Portal Flow

```text
CLIENT CREATED
       ↓
Party
       ↓
Customer
       ↓
Household
       ↓
Advisor decides:
Enable Portal?
       ↓
YES
       ↓
Invitation
       ↓
Client sets password
       ↓
Client User linked to same Party
       ↓
CLIENT LOGIN
       ↓
Build Client AccessContext
       ↓
Read-only own information
```

---

# 46. Employee Access Evaluation Example

Question:

> Can Ravi edit Customer 27?

Evaluation:

```text
User authenticated?                 ✅
User active?                        ✅
Employee active?                    ✅
Organization matches?               ✅
CLIENT.UPDATE permission?           ✅
Customer 27 assigned to Ravi?       ✅

ALLOW
```

Question:

> Can Ravi edit Customer 83?

```text
User authenticated?                 ✅
Employee active?                    ✅
CLIENT.UPDATE permission?           ✅
Customer 83 assigned to Ravi?       ❌

DENY
```

Return:

```text
403 Forbidden
```

---

# 47. Client Access Evaluation Example

Question:

> Can Client 17 view Client 18 transactions because both belong to the same Household?

```text
Authenticated Client = Customer 17
Requested Transactions = Customer 18
Same Household = Yes
Same Customer = No
Explicit sharing permission = No
```

Result:

```text
DENY
```

Household membership alone does not grant cross-client financial-data access.

---

# 48. Frontend Route Strategy

Recommended route structure:

```text
/admin
/admin/organization
/admin/organization/profile
/admin/organization/branches
/admin/organization/departments
/admin/organization/designations
/admin/organization/employees
/admin/organization/employees/{id}
/admin/organization/associates
/admin/organization/associates/{id}
/admin/organization/agencies
/admin/organization/agencies/{id}
/admin/organization/arn-holders
/admin/organization/arn-holders/{id}

/admin/access
/admin/access/roles
/admin/access/permission-profiles
/admin/access/employees
/admin/access/client-portals
/admin/access/invitations
/admin/audit

/employee-dashboard
/employee-dashboard/clients
/employee-dashboard/groups
/employee-dashboard/transactions
/employee-dashboard/meetings
/employee-dashboard/tasks
/employee-dashboard/documents
/employee-dashboard/messages
/employee-dashboard/reports

/client-portal
/client-portal/profile
/client-portal/household
/client-portal/goals
/client-portal/investments
/client-portal/transactions
/client-portal/documents
/client-portal/reports
/client-portal/messages
```

---

# 49. Head/Admin Actions Summary

Head/Admin should be able to:

```text
Organization
- View/edit organization profile

Branches
- Add
- View
- Edit
- Assign manager
- Deactivate
- Reactivate
- Bulk deactivate

Departments
- Add
- Edit
- Deactivate
- Reactivate

Designations
- Add
- Edit
- Deactivate
- Reactivate

Employees
- Add
- View
- Edit
- Assign branch
- Assign department
- Assign designation
- Assign reporting manager
- Assign permission profile
- Customize permissions
- Assign clients
- Remove client assignments
- Enable login
- Disable login
- Send invitation
- Revoke invitation
- Deactivate employee
- Reactivate employee if business rules allow
- View activity

Associates
- Add
- View
- Edit
- Link agency
- Change branch
- Link ARN
- Deactivate
- Reactivate

Agencies
- Add
- View
- Edit
- Add/remove Associates
- Link ARN
- Add documents
- Deactivate
- Reactivate

ARN Holders
- Add
- View
- Edit
- Link holder
- Link branch
- Link Employee
- Link Associate
- Link Agency
- Upload documents
- Renew
- Mark expired
- Suspend
- Deactivate
- Reactivate
- View history

Access
- Manage roles
- Manage permission profiles
- Manage Employee access
- Manage Client Portal access
- Manage invitations
- View audit logs
```

---

# 50. Employee Actions Summary

Employee actions depend on granted permissions and assigned scope.

Possible actions:

```text
View assigned Clients
Create Clients if permitted
Edit assigned Clients if permitted
View Households
Edit Households if permitted
View Transactions
Create Transactions if permitted
Edit Transactions if permitted
View Meetings
Create Meetings
Edit Meetings
View Tasks
Create Tasks
Edit Tasks
View Documents
Upload Documents
View Reports
Generate Reports if permitted
View Messages
Use permitted dashboard modules
```

An Employee must not automatically be allowed to:

```text
Manage Employees
Manage Roles
Manage Permission Profiles
Change own permissions
Access unassigned Clients
Cross Organization boundaries
Read another Employee's private scope without permission
```

---

# 51. Client Actions Summary

V1 Client Portal is primarily read-only.

Allowed initially:

```text
View own profile
View limited Household information
View own Goals
View own Investments
View own Transactions
View approved own Documents
Download approved Documents
View own Reports
View own Messages
Change password
Possibly update limited self-service contact details later
```

Not allowed initially:

```text
Edit CRM financial data
Delete records
See internal advisor notes
See compliance/internal notes
See Employee tasks
See other Clients' private financial data
Modify Household membership
Modify Transactions
Modify Reports
Manage Users
Manage permissions
```

---

# 52. Security Principles

```text
Backend authorization is mandatory.
Frontend hiding is never sufficient.

Every resource access checks Organization ownership.

Every Employee record access checks both:
1. Permission
2. Assignment/resource scope

Every Client portal access checks:
1. Client identity
2. Requested resource ownership
3. Explicit portal policy

Disabled users cannot continue using refresh sessions.

Invitation tokens are hashed.

Sensitive permissions are loaded from current database state.

Business records are preserved even when login access is disabled.

Audit important administration actions.

Never expose raw passwords.

Never store permanent plain-text invitation tokens.

Never give Employee or Client users arbitrary SQL/database access.
```

---

# 53. Future Extension Points

Do not build these until needed, but preserve architecture for them.

```text
EmployeeAssignment scope:
- CUSTOMER
- CUSTOMER_GROUP
- BRANCH

Associate Portal

Agency Portal

Household-level permission sharing

Client self-service updates

Document approval workflow

Advanced compliance permissions

Maker-checker authorization

Temporary delegated access

Permission effective dates

Access approval workflow

ARN renewal reminders

Branch transfer history

Employee transfer history

Multi-organization users

Organization-specific role profiles
```

---

# 54. Implementation Order

Build this architecture in the following order.

## Phase 1 — Authorization Foundation

```text
Central AccessContext
Actor resolution
Organization resolution
Employee resolution
Client resolution
Live permission loading
require_permission(...)
require_customer_access(...)
require_head(...)
require_employee(...)
require_client(...)
Organization boundary checks
Session disable/revocation behavior
```

This phase must come first.

## Phase 2 — Organization Administration

```text
Organization Profile
Branches
Departments
Designations
Employees
```

## Phase 3 — Employee Access

```text
Employee permission profiles
Individual permissions
Employee client assignments
Reporting hierarchy
Employee profile
```

## Phase 4 — Employee Login

```text
AccessInvitation
Employee invitation
Password setup
EMPLOYEE role activation
Employee Dashboard
Permission-aware navigation
Scoped API access
```

## Phase 5 — Client Portal

```text
Client Portal invitation
User linked to existing Client Party
CLIENT role
Read-only Client Portal
Own-resource scope enforcement
Portal disable/revoke flow
```

## Phase 6 — External Organization Setup

```text
Associates
Agencies
ARN Holders
ARN documents
ARN status lifecycle
```

## Phase 7 — Governance

```text
Audit logs
Bulk administration
Advanced permission profiles
Reactivation workflows
Security review
Access tests
```

---

# 55. Canonical Architecture Diagram

```text
FOUNDATION
Party
 │
 ├──────────────────────────────────────────────────┐
 │                                                  │
 ▼                                                  ▼
IDENTITY                                        BUSINESS ENTITIES
User                                            Employee
 │                                              Customer
 ├── UserRole                                   Associate
 ├── Session                                    Agency
 ├── Authentication                             ARN Holder
 │
 ▼
AUTHORIZATION
Role
Permission
PermissionProfile
 │
 ▼
AccessContext
 │
 ├──────────────────────┬───────────────────────┐
 │                      │                       │
 ▼                      ▼                       ▼
HEAD                  EMPLOYEE                CLIENT
 │                      │                       │
Entire               Permissions             Own Customer/
organization         + Assignment            Party scope
scope                scope                   read-only V1
```

---

# 56. Organization Entity Relationship Overview

```text
Organization
│
├── Branch
│   ├── Employees
│   ├── Associates
│   └── ARN Holders
│
├── Department
│   └── Employees
│
├── Designation
│   └── Employees
│
├── Employee
│   ├── Party
│   ├── User (optional until login enabled)
│   ├── EmployeeReporting
│   ├── EmployeeAssignment
│   └── Permissions via Identity
│
├── Agency
│   ├── Party
│   ├── Associates
│   └── ARN Holders
│
├── Associate
│   ├── Party
│   ├── Agency optional
│   └── ARN Holder optional
│
└── ARN Holder
    ├── Party
    ├── Branch optional
    ├── Employee optional
    ├── Associate optional
    └── Agency optional
```

---

# 57. Final Product Principle

FinPlan should treat identity, organization, permissions, assignments, and CRM data as separate but connected layers.

```text
WHO ARE YOU?
→ User + Party

WHAT BUSINESS ROLE DO YOU HAVE?
→ Employee / Customer / Associate / Agency

WHAT ARE YOU ALLOWED TO DO?
→ Permissions

WHICH RECORDS MAY YOU DO IT TO?
→ Assignments / scope

WHICH ORGANIZATION OWNS THOSE RECORDS?
→ Organization boundary

WHAT HAPPENED?
→ Audit log
```

Every future FinPlan module should fit into this same authorization model.

This includes:

```text
Clients
Households
Transactions
Goals
Investments
Documents
Meetings
Tasks
Reports
Portfolio
Notifications
Future financial modules
```

---

# 58. Development Rule

Before implementing Employee Login, Client Portal, or any additional Admin feature:

1. Keep this document as the architecture source of truth.
2. Reuse existing `Party`, `User`, `Role`, `Permission`, `PermissionProfile`, `Employee`, `EmployeeAssignment`, `Branch`, `Department`, and `Designation` models where they already exist.
3. Do not build a parallel authentication system.
4. Do not duplicate Party records to enable login.
5. Do not put authorization only in frontend code.
6. Do not hard-delete historical business records.
7. Preserve organization and assignment boundaries in every API.
8. Add new schema only where the current architecture does not already provide the needed concept.
9. Build authorization before Employee/Client dashboards.
10. Add automated authorization tests before production use.

---

# 58A. Authorization Decisions and Rollout Requirements

**Agreed:** 2026-10-01. These rules refine the earlier examples wherever persona,
permission, invitation, or historical-access behavior was left implicit.
They are implementation requirements, not a claim that the code already enforces them.

## Head identity and first administrator

- Use `ORG_ADMIN` as the canonical organization-admin role code. `HEAD` is the
  product persona resolved from that role, not a second independently granted role.
- Existing `ADVISOR` users retain their assigned-client business access; they are
  not automatically organization administrators.
- Create the first Head through a controlled bootstrap operation bound to a
  verified existing User/Party and organization. Record who authorized the grant.
  Public registration and caller-supplied Party/User IDs cannot grant admin access.
- Subsequent admin grants require an authorized Head in the same organization.
- Prevent removal, expiry, deactivation, or login disablement of the last active
  Head. Apply the check transactionally, including bulk operations and concurrent
  changes. Transfer responsibility before ending the last Head's access.
- Resolve active personas within the current organization. For initial navigation,
  prefer Head, then Employee, then Client when eligible. Route selection grants no
  additional permission, and client-portal requests always use client visibility rules.
- An ambiguous organization or identity must fail closed until explicitly resolved;
  never select the first matching role or employee row.

## Permission precedence and resource scope

1. Validate active login, session, organization, and the relevant business identity.
2. Load effective roles, profiles, permissions, and individual overrides from
   current database state; ignore expired or inactive grants.
3. Combine applicable grants within the selected organization. An explicit denial
   wins over any allowance. Missing permission means deny.
4. Apply resource scope separately: employee access requires both the requested
   permission and a current applicable assignment.
5. Head access is organization-wide only within its own organization. It cannot
   bypass disabled login/session checks, explicit denials, or client publication rules.

Individual overrides must be organization-bound, attributable to a grantor, and
audited. Model them explicitly if the existing schema cannot express them; do not
repurpose business assignments as permission overrides. Audit permission changes
from the first access-management endpoint, rather than deferring all audit work to A7.

Service-team membership records who supports a client. Membership alone does not
grant login, permissions, or resource access. A support employee needs an enabled
login, permitted action, and separately authorized resource scope.

## Existing endpoints included in A1

- Review public registration role selection and organization onboarding before
  enabling admin roles. Derive actor identity from authentication, not submitted IDs.
- Apply authenticated resource checks to document downloads. A protected document
  record must not remain downloadable through an unprotected static upload URL.
- Validate session ownership and active state for access tokens as well as refresh
  tokens. Disabling login revokes sessions and refresh credentials atomically.
- Permission removal and assignment expiry must affect the next protected request,
  without requiring logout. Any authorization cache must support immediate invalidation.
- Inventory existing CRM, financial, workflow, report, and download endpoints and
  track migration to shared dependencies. A pilot endpoint is not completion of A1.

## Invitation lifecycle

- Bind every invitation to organization, existing Party, intended role, purpose,
  and normalized verified recipient email; store only the token hash.
- Acceptance must atomically validate expiry, unused state, recipient identity,
  current inviter authority, and organization/business-record eligibility before
  attaching login and granting access.
- Concurrent acceptance may succeed once only. Reuse or mismatched recipient,
  organization, Party, purpose, or role must fail.
- Resending invalidates the previous outstanding token. Revocation and expiry
  prevent acceptance; disabling a target record invalidates pending invitations.
- Existing users attach through authenticated identity verification. Matching an
  email alone must not merge Parties or transfer an existing login.
- Log issuance, acceptance, expiry, resend, and revocation without raw tokens or passwords.

## Reassignment, history, and client publication

- Preserve historical reports, documents, and audit records when assignments end.
  Preservation does not mean continued access for the former employee.
- Re-evaluate current scope on historical reads and downloads. Former assignees
  lose access unless they hold a separate explicit historical-access permission.
- A saved report containing several clients requires access to every included
  client or an authorized organization-wide report scope. Do not silently redact
  or recalculate its immutable contents.
- Report authorship and document upload ownership are provenance, not sufficient
  authorization. Successor access requires current permission and applicable scope.
- Client visibility is explicit: publication records identify approved report
  versions/documents, audience, approver, publication time, and revocation state.
- Publish client-specific artifacts only after checking all included data. Never
  expose an advisor-wide report to a client simply because it contains that client.
- Internal notes, employee tasks, compliance notes, and unapproved files remain
  excluded. Revoking publication blocks subsequent portal reads and downloads;
  files already downloaded cannot be recalled.

## Migration, rollback, and acceptance

- Inventory existing roles, profiles, assignments, sessions, and organization links.
  Produce a reviewed mapping for legacy roles and explicitly selected initial Heads.
- Use idempotent permission seeds and additive migrations. Validate the backfill
  before enforcing new dependencies; never infer administrator status from ADVISOR.
- Define permission codes per operation and verify assignment types and effective
  dates. Include role/profile/override conflict tests and legacy advisor regression tests.
- Roll out shared authorization in tracked endpoint batches. Keep valid existing
  business access while removing unintended access.
- Document database backup, migration/backfill verification, and rollback steps.
  Rollback must not restore revoked grants or reopen unsafe onboarding/download paths.
- Require negative integration tests for cross-organization access, unassigned
  resources, permission denial, expired roles/assignments, disabled identities,
  revoked access and refresh sessions, and last-Head races.
- Test invitation replay/concurrency, reassigned historical reports, unpublished
  client content, direct file URLs, and same-organization service-team membership
  without an access grant.
- Require positive browser/API flows for Head setup, employee invitation and
  assignment, client publication, and disable/revoke. Unit tests and successful
  OpenAPI generation alone do not establish production readiness.

---

# 59. Current Implementation Baseline and Pending Admin Work

**Baseline reviewed:** 2026-09-30. **Plan revised:** 2026-10-01.

Advisor-side CRM and financial-planning features through Phase 7 have been
implemented. This is a feature baseline, not a production-readiness or comprehensive
authorization sign-off. Admin access architecture is the next development track.

## Existing foundation to reuse

- [x] One `foundation.Party` identity model is used by users, employees, and customers.
- [x] `identity.User`, authentication methods, sessions, refresh tokens, and login history exist.
- [x] `Role`, `UserRole`, `Permission`, `PermissionProfile`,
  `ProfilePermission`, and `RolePermissionProfile` exist.
- [x] Organization, branch, department, designation, employee, reporting, and
  employee-assignment tables exist.
- [x] Advisor-to-customer assignments already scope the current CRM APIs.
- [x] Audit-log and security-event tables exist.
- [x] One login/token service exists and must remain the only authentication system.

## Current gaps

- [ ] There is no central live `AccessContext`.
- [ ] Backend dependencies currently recognize the advisor role directly; they do
  not evaluate Head, Employee, and Client personas through one authorization layer.
- [ ] Permission/profile records are not yet evaluated on every request.
- [ ] JWT role data is used for routing context, while live permission changes and
  assignment changes are not centrally re-evaluated.
- [ ] There is no Admin API or Admin dashboard.
- [ ] Organization, branch, department, designation, and employee management do
  not yet have complete scoped CRUD/lifecycle APIs and screens.
- [ ] Employee profile permissions, individual overrides, client-access management,
  and reporting-hierarchy management are not implemented end to end.
- [ ] `AccessInvitation` does not exist.
- [ ] Employee and Client activation/revocation flows are not implemented.
- [ ] Employee Dashboard and Client Portal route trees do not exist.
- [ ] Associate, Agency, and ARN Holder models/workflows do not exist.
- [ ] Admin actions do not yet emit complete audit events.
- [x] The organization onboarding endpoint no longer accepts raw party/user IDs;
  it derives a verified identity from an active session and records the bootstrap.
- [ ] Cross-organization, revoked-session, permission-denial, and assignment-denial
  test matrices are incomplete.

## Pending implementation plan

Work must follow this order. Do not begin Admin CRUD screens before the
authorization foundation is enforced.

### Pending A1 — Authorization foundation

- [x] Add an initial `AccessContext` service that resolves the authenticated User, Party,
  active roles, organization, employee/customer identity, live permissions, and
  assignment scope from the database.
- [ ] Add reusable dependencies: `require_head`, `require_employee`,
  `require_client`, `require_permission`, `require_customer_access`, and
  organization-bound resource checks.
- [ ] Define canonical persona precedence for users with more than one active role.
- [ ] Implement the ORG_ADMIN-to-Head mapping, controlled first-Head bootstrap,
  and transactional last-active-Head protection defined in section 58A. The
  mapping, first-Head bootstrap, and login-disable protection are complete;
  future role-removal mutations must call the same locked guard.
- [ ] Implement explicit-deny precedence and separate service-team membership
  from permission and resource-access grants.
- [ ] Stop treating `ADVISOR` as the only accepted staff role.
- [ ] Re-check user status, active role dates, employee/customer status, session
  state, permissions, and assignments on protected requests.
- [x] Revoke active sessions and refresh tokens when login access is disabled.
- [x] Seed and document the canonical permission-code catalog from section 31,
  including the business and portal namespaces used by the shared resolver.
- [ ] Close public registration/onboarding role-grant gaps and protect direct
  document downloads, including the current static upload path. Registration
  and organization bootstrap are secured; direct downloads remain pending.
- [ ] Inventory and migrate all protected endpoints after the pilot; verify that
  revoked sessions and changed grants affect the next request.
- [ ] Add denial tests for another organization, another employee's client,
  expired assignment, removed permission, disabled user, and revoked session.

**First implementation slice:** build and test `AccessContext` and permission
dependencies, then migrate one read-only advisor endpoint to prove the pattern
while preserving intended advisor access. A1 remains pending until the endpoint
inventory and existing entry-point gaps are addressed.

**Pilot implemented (2026-10-01):** `services/access.py` resolves live user,
session, Party, organization, eligible staff/client identities, effective roles,
role-profile grants/denials, and active ADVISOR customer assignments. Ambiguous
identities fail closed. Service-team membership does not provide resource scope.
`GET /auth/access-context` exposes the resolved context and
`GET /advisors/profile` now additionally requires `PROFILE.READ` through this
service. The profile endpoint retains its existing advisor dependency.

Head-only employee login lifecycle endpoints now require
`ORG.EMPLOYEE.ACCESS_MANAGE`, an active `FEATURE.EMPLOYEE_MANAGEMENT`
subscription, and the same organization boundary. Disabling login locks the
target employee/user and all effective Head grants, rejects removal of the last
active Head, disables the User, revokes every active session and refresh token,
and emits an audit record in one transaction. Enabling login restores account
eligibility but never restores old sessions or tokens.

Permissions now come only from live role/profile mappings. The idempotent
`91ad7e60c2b4` migration seeds 70 canonical permissions, `HEAD_FULL`, and
`FINANCIAL_ADVISOR_STANDARD`, then backfills existing ORG_ADMIN and ADVISOR role
links. New organization bootstrap also repairs the catalog and attaches these
profiles transactionally. Explicit denials still win. New sessions must have
access-type tokens and an active matching session.

The reusable persona, permission, and customer-scope checks are present but are
not yet installed across other routes. Individual overrides, broader employee
scope grants and session-disable mutations remain pending.

Public registration now requires a recently verified registration OTP, creates
only a global base USER role, rejects role/organization fields, and no longer
creates organizations from registration data. `POST /onboarding/organization`
requires an active access-token session and verified email, derives User and
Party from the session, locks the Party row, and atomically creates the
organization, main branch, leadership department, Head designation, Employee
identity, organization-scoped ORG_ADMIN role, role links, and bootstrap audit
record. A scoped ADVISOR compatibility role keeps existing advisor APIs usable
while their dependencies are migrated. It accepts no party or user ID and
rejects repeat bootstrap. Login routes unscoped users to
`/onboarding/organization`; the setup screen consumes the authenticated
bootstrap endpoint. Client portal policy remains pending.

Validation includes resolver/policy regressions and an HTTP test of the profile
dependency; comprehensive database authorization integration tests are still pending.

### A1.5 — Subscription foundation

Subscription is organization-owned product access. It is evaluated separately
from identity, permissions, and record assignments:

```text
Authentication -> who the actor is
Authorization  -> which actions and records the actor may access
Subscription   -> which product features and capacity the organization owns
```

- [x] Add global `SubscriptionPlan`, effective `OrganizationSubscription`, and
  append-only `SubscriptionEvent` records.
- [x] Preserve an entitlement snapshot on each subscription so later plan edits
  cannot rewrite historical access terms.
- [x] Enforce one current subscription row per organization while retaining
  ended periods as history.
- [x] Create and backfill `FOUNDATION_TRIAL`, including an auditable
  `TRIAL_STARTED` event for every active organization.
- [x] Provision a 30-day trial atomically during first-Head organization bootstrap.
- [x] Expose live subscription status, feature entitlements, and numeric limits
  through `AccessContext`, with reusable entitlement and limit checks.
- [x] Require an active subscription for protected advisor business APIs and
  enforce module entitlements for CRM, groups, tasks, goals, and portfolio routes.
- [x] Keep authentication, access-context resolution, organization bootstrap,
  health checks, and subscription-status recovery available when access is inactive.
- [x] Enforce `LIMIT.CLIENTS` and `LIMIT.BRANCHES` before creation; employee
  limits will use the same guard when employee creation is introduced.
- [ ] Define commercial plans and an Admin subscription-status screen.
- [ ] Select a billing provider and implement checkout/customer mapping.
- [ ] Implement signed, idempotent webhooks for activation, renewal, plan change,
  payment failure, grace period, cancellation, and expiry.
- [ ] Add invoice/payment records and reconciliation once the provider is selected.
- [ ] Complete fine-grained entitlement coverage inside the mixed advisor router
  for reports, documents, meetings, messages, and transactions as those routes
  are migrated to the central authorization dependencies.

Subscription status must never be accepted directly from an advisor-facing
request. Provider events or an explicitly authorized platform operation own
commercial status changes. Roles and permissions cannot bypass subscription
features, and subscription purchase cannot grant a user permission or record scope.
The frontend redirects inactive organizations to `/admin/subscription`, where
the current status and period end remain visible without granting business access.

### Pending A2 — Organization administration

- [x] Reconcile Organization, Branch, Department, and Designation fields with
  sections 4, 7, 32, and 33 using migrations only for missing concepts.
- [x] Implement organization-profile read/update.
- [x] Implement branch, department, and designation list/create/update/deactivate/reactivate.
- [x] Enforce organization-local uniqueness and referenced-record deactivation.
- [x] Build `/admin/organization`, `/admin/organization/branches`,
  `/admin/organization/departments`, and `/admin/organization/designations` screens.

Field reconciliation reuses `trade_name` as the editable organization name,
`pan_number`/`gst_number` as PAN/GSTIN, and `is_active` as lifecycle status.
It adds organization type, financial-year start, currency code and timezone;
branch address/opening/closing/remarks fields; and optional department head.
Legacy `MAIN` branches are normalized to `HEAD_OFFICE`. Branch address fields
remain nullable for migrated and bootstrap records until onboarding collects a
complete postal address; new Admin edits can populate them without inventing a
second address model.

### Pending A3 — Employee administration and access

- [x] Implement employee create/profile/edit/deactivate/reactivate with one Party.
- [x] Preserve branch, department, designation, and reporting history on changes.
- [x] Implement permission-profile assignment and any required individual override model.
- [x] Implement effective-dated client, group, and branch assignments.
- [x] Implement reporting-manager history.
- [x] Build employee Overview, Employment, Contact, Access, Assigned Clients,
  Reporting, and Activity tabs.
- [x] Prevent self-escalation and unauthorized permission administration.
- [x] Apply historical-access rules when assignments end, including multi-client
  snapshots and documents owned by former assignees.

### Pending A4 — Invitations and employee login

- [x] Add `AccessInvitation` with hashed token, expiry, purpose, status, inviter,
  organization, Party, and intended role.
- [x] Implement invite, accept, resend, expire, and revoke flows.
- [x] Enforce atomic single-use acceptance, recipient/Party/organization binding,
  resend invalidation, and concurrent-acceptance tests from section 58A.
- [x] Link login to the existing Employee Party; never create a duplicate Party.
- [x] Activate the EMPLOYEE role only after successful invitation acceptance.
- [x] Build permission-aware `/employee-dashboard` navigation and APIs.

### Pending A5 — Client portal

- [x] Invite an existing Customer Party and attach the CLIENT role.
- [x] Build the read-only V1 `/client-portal` routes defined in section 23.
- [x] Enforce own-customer and approved-household visibility in the backend.
- [x] Separate client-visible content from internal notes, tasks, compliance notes,
  and unapproved documents.
- [x] Implement portal disable/revoke and session termination.
- [x] Add explicit client publication/approval for specific report versions and
  documents, with audience validation and publication revocation.

### Pending A6 — External organization records

- [ ] Add Associate, Agency, ARN Holder, and ARN document models only after A1–A5.
- [ ] Implement their status lifecycles, ownership, relationships, and deactivation.
- [ ] Keep login disabled by default and use the same invitation system if enabled later.

### Pending A7 — Governance and production gate

- [ ] Emit audit events for organization, employee, permission, assignment,
  invitation, login-access, and session-revocation changes.
- [ ] Add bulk deactivate/reactivate operations with authorization and audit records.
- [ ] Add permission-aware frontend navigation while keeping backend enforcement mandatory.
- [ ] Complete security review, authorization integration tests, and audit-retention policy.
- [ ] Execute the legacy-role migration, idempotent seed, rollback, and acceptance
  checklist in section 58A; retain evidence of negative and positive integration tests.
- [ ] Verify every Admin query has an organization boundary and every Employee
  business query has both permission and assignment checks.

## Definition of done for this track

Admin access architecture is complete only when:

1. Head, Employee, and Client requests use the same live AccessContext.
2. Permissions and assignments are enforced by backend dependencies.
3. Organization administration and employee access are manageable through scoped APIs and UI.
4. Employee and Client login activation uses hashed, expiring invitations linked to existing Parties.
5. Disabled access revokes sessions.
6. Cross-organization and cross-assignment access tests pass.
7. Administrative changes are auditable and historical business records remain preserved.
8. Initial Head grants are explicit, last-Head protection is enforced, and no
   legacy advisor or service-team membership silently gains administration rights.
9. Invitations are atomically single-use, and historical/client-visible artifacts
   obey current scope and explicit publication policy.
10. Existing endpoints and direct downloads pass the migration and authorization
    acceptance checklist, with a tested rollback plan.
