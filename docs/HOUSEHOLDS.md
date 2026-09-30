# FinPlan Household & Group Model

**Purpose:** Canonical domain guide for `CustomerGroup` and `GroupMember`.

## 1. Why FinPlan uses CustomerGroup

A financial-planning client may participate in several simultaneous relationship structures. A single generic `group_id` on Customer cannot represent this correctly.

FinPlan therefore models:

```text
Customer
   │
   └── GroupMember (historical membership period)
          │
          └── CustomerGroup
```

`CustomerGroup` is a flexible backend entity. In the UI, normal personal/family grouping is presented as a **Household**.

---

## 2. Group types

| Type | Household-like? | Multiple active memberships for same client? | Example role |
|---|---:|---:|---|
| HOUSEHOLD | Yes | No (across HOUSEHOLD/FAMILY) | SELF, SPOUSE |
| FAMILY | Yes | No (across HOUSEHOLD/FAMILY) | MEMBER |
| BUSINESS | No | Yes | DIRECTOR, OWNER |
| INVESTMENT | No | Yes | INVESTOR |
| TRUST | No | Yes | TRUSTEE, BENEFICIARY |
| HUF | No | Yes | KARTA, MEMBER |
| OTHER | No | Yes | MEMBER |

The “No” in HOUSEHOLD/FAMILY means a client cannot simultaneously have another active household-like membership.

---

## 3. Initial client household

When a client is created:

```text
New Customer
   ↓
New HOUSEHOLD
   ↓
New GroupMember
```

Initial member state:

```text
relationship_type = SELF
is_group_head      = true
is_primary         = true
joined_on          = today
left_on            = null
```

The group is assigned to the current advisor/branch context.

---

## 4. Meaning of membership fields

### `joined_on`
Start date of this membership period.

### `left_on`
End date. `NULL` means the membership is currently active.

### `is_primary`
Backend-managed flag representing the client's active household-like membership. It is not an arbitrary “favorite group” flag.

### `is_group_head`
Marks the current head of that specific group.

### `relationship_type`
Role/relationship of the customer within that group.

---

## 5. Membership history

A customer may leave and later rejoin the same group.

Example:

```text
ID  Customer  Group  Joined      Left
1   Ravi      A      2026-01-01  2026-03-10
9   Ravi      A      2026-07-15  NULL
```

These are two distinct business events and must remain two rows.

The database currently protects this with a partial unique index on `(customer_group_id, customer_id)` for rows where `left_on IS NULL`.

---

## 6. Active primary protection

The database also protects against more than one active membership with `is_primary = true` for the same customer.

Application logic adds the higher-level rule that only HOUSEHOLD/FAMILY memberships become primary.

---

## 7. Active head protection

The database protects against multiple active `is_group_head = true` rows inside one group.

Application logic also keeps `CustomerGroup.head_customer_id` synchronized with the selected head.

---

## 8. Add-member flow

```text
Select Group
   ↓
Authorize Group
   ↓
Authorize Customer
   ↓
Validate Customer active
   ↓
Validate relationship type
   ↓
HOUSEHOLD/FAMILY?
   ├── yes: ensure no other active household-like membership
   └── no: multiple group relationships allowed
   ↓
Ensure no active membership already exists in target group
   ↓
INSERT new GroupMember
```

The backend sets `is_primary` automatically.

---

## 9. Move-household flow

The move endpoint targets an active HOUSEHOLD/FAMILY.

```text
Old Household membership
   ↓ close with left_on

Target Household
   ↓ create new GroupMember
```

Business/Trust/HUF/Investment memberships stay unchanged.

### Old household head case

If the moving client is old head and members remain, `new_head_customer_id` is mandatory.

If the moving client is the last member, the old household becomes inactive.

---

## 10. Remove-member flow

Removal means membership closure, not deletion.

If a household-like group becomes empty, it is deactivated.

If a non-household group loses a member, the group remains active unless separately deactivated.

---

## 11. Group deactivation

### HOUSEHOLD/FAMILY

Must be empty first.

### Other types

May be deactivated with active members; their active membership periods are closed as part of deactivation.

---

## 12. Active vs history API

Current intended/implemented contract:

```text
GET /advisors/groups/{group_id}/members
```

Returns active memberships only (`left_on IS NULL`).

```text
GET /advisors/groups/{group_id}/members/history
```

Returns all membership periods, including ended and active periods.

Do not deduplicate the history endpoint by customer.

---

## 13. Client household display

A client may have multiple active non-household memberships, so client UI must not use the “first active membership.”

Display preference:

1. active `is_primary = true` HOUSEHOLD/FAMILY membership
2. fallback active HOUSEHOLD/FAMILY membership
3. no household if neither exists

BUSINESS/TRUST/HUF/INVESTMENT groups are not used as the client's displayed household.

---

## 14. Future extensions

The current model is designed to support future additions such as:

- household-level goals
- household financial accounts
- household AUM/reporting
- advisor/service teams
- beneficial ownership
- merge/split workflows
- household risk/planning profile

Do not overload `CustomerGroup` with portfolio/account semantics that deserve separate first-class models.
