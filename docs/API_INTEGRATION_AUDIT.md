# Backend / frontend integration audit — 2026-09-30

## Result

The core CRM integrations exist, but the application is **not fully connected**.
After the corrections below, all 67 mapped tables can be selected from PostgreSQL.
There are 68 registered backend operations; frontend HTTP call sites cover 60 of
them (including helpers with no UI caller). Six frontend calls target nonexistent
endpoints. API availability is not the same as a completed user workflow.

## Verification scope

- Inventoried all registered OpenAPI operations and 568 frontend TypeScript files.
- Compared mapped table/column names and SQL type families against PostgreSQL;
  executed `SELECT ... LIMIT 0` for every mapped table after fixes.
- Compared request property names for clients, groups/members/moves, meetings,
  tasks, messages, documents, registration, and transactions against OpenAPI.
  Compared list-helper query parameter names with registered parameters.
- Exercised 21 advisor GET routes with the configured database in a read-only
  transaction: dashboard/profile, list/detail routes for the seven CRM resources,
  membership history, transaction history, portfolio, and reports. All returned 200.
  Authentication was overridden with an existing advisor for these read checks;
  this does not certify login/refresh or cross-advisor authorization end to end.
- Backend tests: **92 passed**, including opt-in database checks.
- Frontend TypeScript: passed. Changed-file ESLint: no errors, seven existing
  unused-variable/import warnings.
- No live client registrations, OTP sends, password resets, uploads, or CRM writes
  were exercised. Static payload checks do not prove persistence or browser UX.

## Corrections made

1. `SecurityEvent.event_metadata` now maps to the existing `identity.security_events.metadata`
   database column. No data was renamed or copied.
2. Migration `13eecab33402` adds nullable `deleted_at` / `deleted_by` to
   `foundation.currencies` and `foundation.financial_years`, matching their AuditMixin.
   Applied successfully; all current model queries now compile against the database.
3. Registration now uses shared API helpers and the configured API base URL. Its
   declared response is a user, matching `/auth/register`, rather than login tokens.
4. Registration schema now accepts Aadhaar, legal name, and remarks that its UI
   collects and the existing auth service already persists to `foundation.parties`.
5. Navigation logout and market history use the configured API URL instead of
   a hardcoded localhost endpoint.
6. Advisor profile now returns first name, last name, phone, and role expected by
   its page, using the advisor's Foundation Party. Removed unrelated client/risk
   properties from the TypeScript profile contract.
7. Client-list typing now matches the backend envelope. Legacy document/message
   helper aliases now delegate to the actual list helpers and response types.
8. Advisor client-password reset now checks the assigned client ID and verifies
   that the requested email belongs to that customer's Party before consuming an
   OTP or resetting a password. Regression tests cover mismatched clients/emails.

## Remaining issues, in priority order

### Client forms accept data that is not fully persisted

`app/schemas/client.py` accepts more than `app/routers/clients.py` writes:

- Investment experience, financial goals, nominee details, bank fields, KYC inputs,
  and `group_id` are accepted on client requests but are not implemented as complete
  persistence workflows. Responses explicitly return `None` for several of these.
- Address creation has limited lookup resolution; address edits are absent from
  the update handler's supported field sets.
- `age` is derived from date of birth; it should not be an independent saved input.
- Client activation uses `is_active`, while some dashboard/group checks use
  `customer_status`. These need one consistent lifecycle policy.

Do not describe these form sections as saved successfully until they round-trip
through their proper domain tables. Implement bank/KYC/relationship/goal writes or
make unsupported fields explicitly unavailable; do not add flat duplicate columns.

### Registration geography is not resolved from submitted values

`create_party_profile()` in `app/services/auth_service.py` selects the first city,
state, and country rows using `LIMIT 1`. Submitted city/state text does not determine
the stored foreign keys. Resolve and validate the actual geography before saving.

### Portfolio, Reports, and Notifications pages have missing endpoints

No Next.js route handlers or backend operations implement these calls:

| Caller | Missing calls |
|---|---|
| `frontend/app/advisor-dashboard/portfolio/portfolio.service.ts` | GET `/api/portfolios`; DELETE `/api/portfolios/{id}` |
| `frontend/app/advisor-dashboard/reports/report.service.ts` | GET `/api/reports`; DELETE `/api/reports/{id}` |
| `frontend/app/advisor-dashboard/notifications/notification.service.ts` | GET `/api/notifications`; DELETE `/api/notifications/{id}` |

The pages import these services. Their fetch calls do not check `response.ok`, and
the page loading promises lack rejection handling. A 404 can leave the UI loading.
Build the real feature APIs/contracts or explicitly mark these features unavailable;
do not substitute unrelated response shapes or fabricated financial data.

### Existing financial responses are placeholders

`GET /advisors/portfolio` and `/advisors/reports` return hardcoded records.
`useDashboard` overwrites dashboard totals with the placeholder portfolio values.
The profile endpoint also hardcodes its plan to Premium. A successful HTTP response
does not mean these values are database-backed.

### Timezone and authorization consistency require dedicated integration tests

Meeting forms submit ISO timestamps via `toISOString()`, while database timestamp
columns are timezone-naive and some filters are local date-time strings. Establish
and test one storage/display convention before claiming schedule correctness.

Client and transaction access uses advisor assignments; some group/related-resource
lookups are organization-scoped. Review whether within-organization access is intended
and add tests for a second advisor and organization. The read smoke checks did not
exercise these negative-access scenarios.

## Backend operations without a frontend HTTP caller

Expected infrastructure-only operations:

- POST `/auth/swagger-login` — Swagger OAuth login.
- GET `/health` — monitoring.

Feature APIs not wired into frontend flows:

- POST `/auth/change-password`
- GET `/auth/sessions`
- DELETE `/auth/sessions/{session_uuid}`
- POST `/advisors/clients/{client_id}/reset-password`
- POST `/advisors/verify-email`
- POST `/onboarding/organization`

Additional helper-only APIs include `/auth/me`, POST `/advisors/documents/`, DELETE
`/advisors/clients/{client_id}`, and `/advisors/reports`. Their helpers exist but have
no external UI references. Refresh is used internally by the shared request transport.

## Recommended next work

1. Fix client and registration persistence, including geography and activation state.
2. Add real authenticated create/edit/read round-trip tests for each CRM resource.
3. Replace placeholder financial responses and connect the three missing feature APIs.
4. Add session management, password change, and organization onboarding screens if
   those workflows are in scope. Not every infrastructure API needs a frontend page.

## Complete operation inventory

Generated below from registered OpenAPI operations and TypeScript HTTP call sites.
“Referenced” means a helper name occurs in another source file, not that a browser
test exercised the workflow. Paths are normalized for parameter names/trailing slashes.

| Method | Backend path | Frontend call/helper | Usage |
|---|---|---|---|
| GET | `/market/live` | `fetchMarketData` | Referenced in frontend source |
| GET | `/market/history` | `MarketChart` | Direct MarketChart request |
| POST | `/auth/send-otp` | `sendOTP` | Referenced in frontend source |
| POST | `/auth/verify-otp` | `verifyOTP` | Referenced in frontend source |
| POST | `/auth/register` | `registerUser` | Referenced in frontend source |
| POST | `/auth/swagger-login` | ? | No HTTP caller found |
| POST | `/auth/login` | `loginUser` | Referenced in frontend source |
| POST | `/auth/logout` | `logoutUser` | Referenced in frontend source |
| POST | `/auth/refresh` | `refreshToken` | Internal token-refresh transport |
| GET | `/auth/me` | `getCurrentUser` | Helper only / no external reference |
| POST | `/auth/forgot-password` | `forgotPassword` | Referenced in frontend source |
| POST | `/auth/reset-password` | `resetPassword` | Referenced in frontend source |
| POST | `/auth/change-password` | ? | No HTTP caller found |
| GET | `/auth/sessions` | ? | No HTTP caller found |
| DELETE | `/auth/sessions/{session_uuid}` | ? | No HTTP caller found |
| GET | `/advisors/meetings/` | `getMeetings` | Referenced in frontend source |
| POST | `/advisors/meetings/` | `createMeeting` | Referenced in frontend source |
| GET | `/advisors/meetings/{meeting_id}` | `getMeeting` | Referenced in frontend source |
| PUT | `/advisors/meetings/{meeting_id}` | `updateMeeting` | Referenced in frontend source |
| POST | `/advisors/meetings/{meeting_id}/cancel` | `cancelMeeting` | Referenced in frontend source |
| GET | `/advisors/messages/` | `getMessages` | Referenced in frontend source |
| POST | `/advisors/messages/` | `createMessage` | Referenced in frontend source |
| GET | `/advisors/messages/{message_id}` | `getMessage` | Referenced in frontend source |
| PUT | `/advisors/messages/{message_id}` | `updateMessage` | Referenced in frontend source |
| POST | `/advisors/messages/{message_id}/read` | `markMessageRead` | Referenced in frontend source |
| POST | `/advisors/messages/{message_id}/archive` | `archiveMessage` | Referenced in frontend source |
| GET | `/advisors/documents/` | `getDocuments` | Referenced in frontend source |
| POST | `/advisors/documents/` | `createDocument` | Helper only / no external reference |
| POST | `/advisors/documents/upload` | `uploadDocument` | Referenced in frontend source |
| GET | `/advisors/documents/{document_id}` | `getDocument` | Referenced in frontend source |
| PUT | `/advisors/documents/{document_id}` | `updateDocument` | Referenced in frontend source |
| POST | `/advisors/documents/{document_id}/archive` | `archiveDocument` | Referenced in frontend source |
| GET | `/advisors/dashboard` | `getAdvisorDashboard` | Referenced in frontend source |
| GET | `/advisors/portfolio` | `getAdvisorPortfolio` | Referenced in frontend source |
| GET | `/advisors/reports` | `getAdvisorReports` | Helper only / no external reference |
| GET | `/advisors/profile` | `getAdvisorProfile` | Referenced in frontend source |
| POST | `/advisors/clients/{client_id}/reset-password` | ? | No HTTP caller found |
| GET | `/advisors/transactions` | `getTransactions` | Referenced in frontend source |
| POST | `/advisors/transactions` | `createTransaction` | Referenced in frontend source |
| GET | `/advisors/transactions/{transaction_id}/history` | `getTransactionHistory` | Referenced in frontend source |
| GET | `/advisors/transactions/{transaction_id}` | `getTransaction` | Helper only / no external reference |
| PUT | `/advisors/transactions/{transaction_id}` | `updateTransaction` | Referenced in frontend source |
| DELETE | `/advisors/transactions/{transaction_id}` | `deleteTransaction` | Referenced in frontend source |
| POST | `/advisors/verify-email` | ? | No HTTP caller found |
| GET | `/advisors/tasks/` | `getTasks` | Referenced in frontend source |
| POST | `/advisors/tasks/` | `createTask` | Referenced in frontend source |
| GET | `/advisors/tasks/{task_id}` | `getTask` | Referenced in frontend source |
| PUT | `/advisors/tasks/{task_id}` | `updateTask` | Referenced in frontend source |
| POST | `/advisors/tasks/{task_id}/complete` | `completeTask` | Referenced in frontend source |
| POST | `/advisors/tasks/{task_id}/reopen` | `reopenTask` | Referenced in frontend source |
| GET | `/advisors/clients` | `getClients` | Referenced in frontend source |
| POST | `/advisors/clients` | `createClient` | Referenced in frontend source |
| GET | `/advisors/clients/{client_id}` | `getClient`, `getClientById` | Referenced in frontend source |
| PUT | `/advisors/clients/{client_id}` | `updateClient` | Referenced in frontend source |
| DELETE | `/advisors/clients/{client_id}` | `deleteClient` | Helper only / no external reference |
| GET | `/advisors/groups/` | `getGroups` | Referenced in frontend source |
| POST | `/advisors/groups/` | `createGroup` | Referenced in frontend source |
| GET | `/advisors/groups/{group_id}` | `getGroup` | Referenced in frontend source |
| PUT | `/advisors/groups/{group_id}` | `updateGroup` | Referenced in frontend source |
| GET | `/advisors/groups/{group_id}/members` | `getGroupMembers` | Referenced in frontend source |
| POST | `/advisors/groups/{group_id}/members` | `addGroupMember` | Referenced in frontend source |
| GET | `/advisors/groups/{group_id}/members/history` | `getGroupMembershipHistory` | Referenced in frontend source |
| PUT | `/advisors/groups/{group_id}/head` | `changeGroupHead` | Referenced in frontend source |
| DELETE | `/advisors/groups/{group_id}/members/{customer_id}` | `removeGroupMember` | Referenced in frontend source |
| POST | `/advisors/groups/{group_id}/deactivate` | `deactivateGroup` | Referenced in frontend source |
| POST | `/advisors/groups/{group_id}/move-client` | `moveClientToHousehold` | Referenced in frontend source |
| POST | `/onboarding/organization` | ? | No HTTP caller found |
| GET | `/health` | ? | No HTTP caller found |
