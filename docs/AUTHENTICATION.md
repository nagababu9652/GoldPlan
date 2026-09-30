# Authentication & Login Guide

**Scope:** local authentication setup, the register/login/OTP flow, test credentials, and login
troubleshooting.
**Related:** `EMAIL.md` (OTP delivery), `ARCHITECTURE.md` (identity domain), root `README.md` (quick start).

## 1. Current status

- ✅ Authentication API working (FastAPI on port 8000): OTP-gated registration, login, logout,
  token refresh, current user, forgot/reset/change password, and session management
- ✅ PostgreSQL connected (see `DATABASE.md`); JWT access + refresh tokens; bcrypt password hashing
- ✅ Frontend login page working at http://localhost:3000/login
- ✅ Default test user available (below)
- ⚠️ OTP email delivery depends on SMTP configuration — see `EMAIL.md` for the development workaround

## 2. Default test user

```text
Email: user@finplan.in
Password: Test@123456
```

Recreate it any time from `backend` with `python create_default_user.py`.

## 3. Authentication endpoints (`backend/app/routers/auth.py`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/send-otp` | Send OTP email (registration / password reset) |
| POST | `/auth/verify-otp` | Verify OTP |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login — returns JWT access + refresh tokens |
| POST | `/auth/logout` | Logout (clears refresh token/session) |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/forgot-password` | Request password reset OTP |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/change-password` | Change password while logged in |
| GET | `/auth/sessions` | List active sessions |
| DELETE | `/auth/sessions/{session_uuid}` | Revoke a session |
| POST | `/auth/swagger-login` | Token helper for the Swagger UI |

Interactive API docs: http://localhost:8000/docs

## 4. Identity model (current)

The starter public `users`/`items` tables were retired. The current identity stack is:

- `identity.User` — login account (`backend/app/models/identity/auth.py`)
- `foundation.Party` — person/entity identity data
- `organization.Employee` / `EmployeeAssignment` — advisor scoping

See `ARCHITECTURE.md` §3 and `BUSINESS_RULES.md` for the Party vs Customer rule. Use Alembic for
schema changes — the legacy `create_tables.py` script is not the migration path.

## 5. Running locally

1. PostgreSQL service (Windows):

   ```powershell
   Get-Service postgresql-x64-18    # check status
   Start-Service postgresql-x64-18  # start if needed
   ```

2. Backend:

   ```powershell
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

3. Frontend:

   ```powershell
   cd frontend
   npm run dev
   ```

4. Access:

   - Frontend: http://localhost:3000
   - Login page: http://localhost:3000/login
   - Backend API: http://localhost:8000
   - API docs: http://localhost:8000/docs

Environment variables:

- `backend/.env`: `DATABASE_URL`, `SMTP_*` (see `EMAIL.md`), `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000`

## 6. Testing the authentication (PowerShell)

### Backend health

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
# Expected: status = "ok"
```

### Login API

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"user@finplan.in","password":"Test@123456"}'
```

The response contains `access_token`, `refresh_token`, and `token_type`. On the frontend, a
successful login stores `finplan_token` and `finplan_user` in localStorage and redirects to
`/advisor-dashboard`.

### Current user

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/me" `
  -Method GET `
  -Headers @{"Authorization"="Bearer YOUR_ACCESS_TOKEN"}
```

### OTP-gated flows

Registration and password reset call `POST /auth/send-otp` → `POST /auth/verify-otp` before
`/auth/register` or `/auth/reset-password`. See http://localhost:8000/docs for exact request
schemas, or use the UI and read the OTP from the green success message (see `EMAIL.md`).

## 7. Login troubleshooting (UI)

### Issue: "Failed to fetch"

Cause: backend not reachable or CORS blocking the request.

- Confirm the backend runs on port 8000 (health check above)
- Confirm CORS in `backend/app/main.py` allows the frontend origin
- Check the browser console for the specific error

### Issue: frontend not picking up environment variables

- Stop the frontend (Ctrl+C) and run `npm run dev` again — `.env.local` is read at startup

### Issue: 400 Bad Request

- Inspect the request payload in DevTools → Network tab; it must be valid JSON:

  ```json
  { "email": "user@finplan.in", "password": "Test@123456" }
  ```

- Check the Response tab for the specific validation error

### Issue: CORS error

- Backend logs should show `OPTIONS /auth/login HTTP/1.1" 200 OK`; a 400/404 there means CORS
  is misconfigured

### Debugging steps

1. Browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)` should print the backend URL
2. Network tab (check "Preserve log"): POST request to `http://localhost:8000/auth/login`
3. Backend terminal: look for `POST /auth/login HTTP/1.1" 200 OK` (errors include a traceback)

### Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] PostgreSQL service running
- [ ] Default user exists in the database
- [ ] `backend/.env` has the correct `DATABASE_URL`
- [ ] `frontend/.env.local` has the correct `NEXT_PUBLIC_API_URL`
- [ ] Browser console shows no errors
- [ ] Network tab shows POST `/auth/login` returning 200
- [ ] Response contains `access_token` and `refresh_token`
- [ ] localStorage has `finplan_token` and `finplan_user` after login

### Quick fixes

- Restart backend: `cd backend; uvicorn app.main:app --reload --port 8000`
- Restart frontend: `cd frontend; npm run dev`
- Verify PostgreSQL: `Get-Service postgresql-x64-18`
- Recreate the default user: `cd backend; python create_default_user.py`

## 8. Known environment issues (fixed)

| Symptom | Resolution |
|---------|------------|
| `No module named 'psycopg2'` | The project uses psycopg v3 with the `postgresql+psycopg://` dialect — psycopg2 is not needed |
| `password cannot be longer than 72 bytes` | Fixed by using `bcrypt` directly instead of passlib |
| `Module 'bcrypt' has no attribute '__about__'` | Fixed by switching from passlib to direct `bcrypt` usage |
| Tables not created | Use Alembic migrations (see `DATABASE.md`); the legacy `create_tables.py` path is retired |

## 9. Security notes

1. Change `SECRET_KEY` in `backend/.env` before production
2. Use HTTPS and secure cookies in production
3. Enforce password complexity and keep rate limiting on auth endpoints
4. The development OTP display (frontend message + console) is a local convenience — remove it
   from any production deployment
5. Rotate the Gmail SMTP app password if it was ever shared (see `EMAIL.md`)