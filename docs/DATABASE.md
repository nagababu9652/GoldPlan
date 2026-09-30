# Database Documentation

## PostgreSQL Installation

### Version Information
- **PostgreSQL Version**: 18.4
- **Installation Path**: `C:\Program Files\PostgreSQL\18\`
- **Service Name**: `postgresql-x64-18`
- **Service Status**: Running
- **Port**: 5433 (non-default, standard is 5432)

### Connection Details
- **Host**: localhost
- **Port**: 5433
- **Username**: postgres
- **Password**: postgres (default)
- **Authentication Method**: scram-sha-256
- **Default Database**: postgres

### Connection String
```
postgresql://postgres:postgres@localhost:5433/postgres
```

### pg_hba.conf Configuration
```
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

### Available Databases
- `postgres` - Default administrative database
- `finplan_db` - Application database (in use by the backend)
- `template0` - Template database (do not modify)
- `template1` - Template database (do not modify)

### Available Roles
- `postgres` - Superuser with full privileges (Create role, Create DB, Replication, Bypass RLS)

## Current Backend Configuration

### Database URL (Current)

The backend runs against **PostgreSQL** (`finplan_db`) through `backend/.env`:

```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/finplan_db
```

`backend/app/core/config.py` keeps a PostgreSQL default as a fallback (port 5432); the active
`.env` points at the local instance on port 5433. The root `dev.db` (SQLite) is a leftover from
early development and is not used by the current configuration.

### Environment Configuration
**File**: `backend/.env`

**Environment Variables**:
```env
APP_NAME=FinPlan API
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/finplan_db
SECRET_KEY=CHANGE_ME
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Database Models

The application uses SQLAlchemy ORM domain schemas — full model inventory in `ARCHITECTURE.md` §3.

**Location**: `backend/app/models/`

- `foundation/` — Party (person/entity identity), addresses, contacts, bank accounts, lookups, geography
- `identity/` — User, sessions, refresh tokens, OTP requests, roles/permissions, security events
- `organization/` — Organization, branches, departments, designations, employees, assignments
- `crm/` — Customer, CustomerGroup, GroupMember, KYC/FATCA/risk, transactions, meetings, tasks, messages, documents

**Database Session**: `backend/app/database/session.py` — builds the SQLAlchemy engine from
`settings.database_url` and provides `SessionLocal`.

Schema changes go through Alembic migrations (see §Migrations below).

## Migrations (Alembic)

The schema is managed with Alembic from the `backend` directory:

```powershell
cd backend
alembic current    # current applied revision
alembic heads      # available head revisions
alembic upgrade head
```

Migration history lives in `backend/alembic/versions/`. Recent migrations cover group membership
history support, active primary/head protection, database timestamp defaults, and retirement of
the legacy `advisor.meetings` table (see `LEGACY_CLEANUP.md`).

Do not use `Base.metadata.create_all()` (or the legacy `create_tables.py` script) as the normal
migration strategy.

Docker: the repository `docker-compose.yml` runs PostgreSQL (published on port 5433), the
backend (port 8000), and the frontend (port 3000).

## Testing Connectivity

### Test Connection
```powershell
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "SELECT version();"
```

### Expected Output
```
-------------------------------------------------------------------------
 PostgreSQL 18.4 on x86_64-windows, compiled by msvc-19.44.35227, 64-bit
(1 row)
```

## Current state (2026-09-30)

- [x] Application database `finplan_db` created and in use
- [x] `backend/.env` configured with the PostgreSQL connection string
- [x] Driver installed (`psycopg` v3, `postgresql+psycopg://` dialect)
- [x] Domain models built (foundation / identity / organization / crm — see `ARCHITECTURE.md`)
- [x] Alembic migrations in place and applied
- [x] `docker-compose.yml` includes the PostgreSQL container
- [x] Legacy `advisor.meetings` table retired (see `LEGACY_CLEANUP.md`)

## Useful Commands

### Connect to PostgreSQL
```powershell
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d finplan_db
```

### List Databases
```powershell
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "\l"
```

### List Users/Roles
```powershell
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "\du"
```

### List Tables
```powershell
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d finplan_db -c "\dt"
```

### Restart PostgreSQL Service
```powershell
Restart-Service postgresql-x64-18
```

### Check Service Status
```powershell
Get-Service postgresql-x64-18
```

## Notes

- PostgreSQL 18 is installed and running on port 5433 (non-standard; `docker-compose.yml` publishes 5433 as well)
- Default credentials are working: postgres/postgres
- The active backend configuration uses PostgreSQL (`finplan_db`); root `dev.db` (SQLite) is an unused leftover from early development
- `backend/.env` exists and is configured
- Authentication method is scram-sha-256 (secure)

## Security Recommendations

1. Change default password from 'postgres' to a strong password
2. Create a dedicated application user instead of using postgres superuser
3. Update SECRET_KEY in .env file
4. Configure SSL for production connections
5. Restrict pg_hba.conf to specific IP addresses in production