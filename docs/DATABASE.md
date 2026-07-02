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
- `template0` - Template database (do not modify)
- `template1` - Template database (do not modify)

### Available Roles
- `postgres` - Superuser with full privileges (Create role, Create DB, Replication, Bypass RLS)

## Current Backend Configuration

### Database URL (Current)
The backend is currently configured to use **SQLite**:
```
DATABASE_URL=sqlite:///./dev.db
```

**Location**: `backend/app/core/config.py`
```python
database_url: str = "sqlite:///./dev.db"
```

### Environment Configuration
**File**: `backend/.env` (does not exist - needs to be created)

**Required Environment Variables**:
```env
APP_NAME=FinPlan API
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
DATABASE_URL=sqlite:///./dev.db  # Change to PostgreSQL URL when ready
SECRET_KEY=CHANGE_ME
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Database Models

### Current Models
The application uses SQLAlchemy ORM with the following structure:

**Location**: `backend/app/models/`
- `item.py` - Item model (example/sample model)

**Database Session**: `backend/app/database/session.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## Migration to PostgreSQL

### Required Changes

#### 1. Update PostgreSQL Configuration (Optional)
If you want to use the standard port 5432 instead of 5433:
- Edit `C:\Program Files\PostgreSQL\18\data\postgresql.conf`
- Change `port = 5433` to `port = 5432`
- Restart PostgreSQL service

#### 2. Create Application Database
```sql
CREATE DATABASE finplan_db;
```

#### 3. Create Application User (Optional - can use postgres)
```sql
CREATE USER finplan_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE finplan_db TO finplan_user;
```

#### 4. Update Backend Configuration
**Option A**: Create `backend/.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/finplan_db
```

**Option B**: Update `backend/app/core/config.py`:
```python
database_url: str = "postgresql://postgres:postgres@localhost:5433/finplan_db"
```

#### 5. Install PostgreSQL Driver
```bash
cd backend
pip install psycopg2-binary
```

#### 6. Update Docker Configuration
Edit `docker-compose.yml` to add PostgreSQL service:
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:18-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=finplan_db
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - APP_NAME=FinPlan API
      - FRONTEND_ORIGINS=http://localhost:3000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/finplan_db
      - SECRET_KEY=replace_with_secure_value
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    command: npm run dev -- --hostname 0.0.0.0 --port 3000
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

volumes:
  postgres_data:
```

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

## Pending Tasks

- [ ] Create application database `finplan_db`
- [ ] Create `backend/.env` file with PostgreSQL connection string
- [ ] Install `psycopg2-binary` package
- [ ] Update `backend/app/core/config.py` to use PostgreSQL URL
- [ ] Create database models for the application
- [ ] Set up Alembic for database migrations (if needed)
- [ ] Test backend connectivity with PostgreSQL
- [ ] Update docker-compose.yml for PostgreSQL container

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

- PostgreSQL 18 is installed and running on port 5433 (non-standard)
- Default credentials are working: postgres/postgres
- Current backend uses SQLite (dev.db)
- No application database has been created yet
- No .env file exists in the backend directory
- Authentication method is scram-sha-256 (secure)

## Security Recommendations

1. Change default password from 'postgres' to a strong password
2. Create a dedicated application user instead of using postgres superuser
3. Update SECRET_KEY in .env file
4. Configure SSL for production connections
5. Restrict pg_hba.conf to specific IP addresses in production