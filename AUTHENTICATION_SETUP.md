# Authentication System - Setup Complete

## ✅ What Was Accomplished

### 1. PostgreSQL Setup
- **Version**: PostgreSQL 18.4 installed and running
- **Port**: 5433 (non-default)
- **Service**: `postgresql-x64-18` (Running)
- **Database Created**: `finplan_db`
- **Tables Created**: `users`, `items`

### 2. Backend Authentication System

#### Created Files:
- `backend/app/models/user.py` - User model with SQLAlchemy ORM
- `backend/app/schemas/user.py` - Pydantic schemas for request/response
- `backend/app/services/auth.py` - Authentication business logic
- `backend/app/routers/auth.py` - Authentication API endpoints
- `backend/.env` - Environment configuration
- `backend/create_tables.py` - Database table creation script
- `backend/create_default_user.py` - Default user creation script

#### API Endpoints:
```
POST   /auth/register     - Register new user
POST   /auth/login        - Login and get JWT tokens
POST   /auth/logout       - Logout (clears refresh token)
POST   /auth/refresh      - Refresh access token
GET    /auth/me           - Get current user info
POST   /auth/forgot-password  - Request password reset
POST   /auth/reset-password   - Reset password with token
```

### 3. Frontend Integration
- Updated `frontend/lib/api.ts` with authentication functions
- Updated `frontend/app/login/page.tsx` to use real authentication
- Added form validation (email format, password length)
- Integrated with backend API endpoints

### 4. Database Configuration
- **Database**: PostgreSQL (switched from SQLite)
- **Connection**: `postgresql+psycopg://postgres:postgres@localhost:5433/finplan_db`
- **Password Hashing**: bcrypt with 12 rounds
- **JWT**: HS256 algorithm with configurable expiry

## 🔐 Login Credentials

### Default Test User:
```
Email: user@finplan.in
Password: Test@123456
```

### How to Use:
1. Start the backend server: `cd backend && uvicorn app.main:app --reload --port 8000`
2. Start the frontend: `cd frontend && npm run dev`
3. Go to: http://localhost:3000/login
4. Enter the credentials above

## 🧪 Testing the Authentication

### Test Registration:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"newuser@example.com","password":"SecurePass123","first_name":"New","last_name":"User"}'
```

### Test Login:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"user@finplan.in","password":"Test@123456"}'
```

### Test Get Current User:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/me" `
  -Method GET `
  -Headers @{"Authorization"="Bearer YOUR_ACCESS_TOKEN"}
```

## 📊 Database Schema

### Users Table:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Items Table:
```sql
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255),
    description VARCHAR(255) DEFAULT '',
    completed BOOLEAN DEFAULT FALSE
);
```

## 🔧 Configuration

### Backend Environment Variables (`.env`):
```env
APP_NAME=FinPlan API
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/finplan_db
SECRET_KEY=CHANGE_ME
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Running the Application

### 1. Start PostgreSQL Service:
```powershell
# Check status
Get-Service postgresql-x64-18

# Start if not running
Start-Service postgresql-x64-18
```

### 2. Start Backend:
```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend:
```powershell
cd frontend
npm run dev
```

### 4. Access the Application:
- Frontend: http://localhost:3000
- Login Page: http://localhost:3000/login
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📝 Next Steps

### To Add More Users:
1. **Via Registration Endpoint**: Use POST /auth/register
2. **Via Script**: Modify `create_default_user.py` and run it
3. **Via PostgreSQL Directly**: Insert into users table (password must be bcrypt hashed)

### To Protect Routes:
Add authentication middleware to protected endpoints:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Validate token and return user
    pass
```

### To Implement Password Reset:
1. Set up email service (SMTP)
2. Generate reset tokens
3. Create reset token table
4. Implement email sending logic

## 🐛 Troubleshooting

### Issue: "No module named 'psycopg2'"
**Solution**: Using `psycopg` (v3) with `postgresql+psycopg://` dialect

### Issue: "password cannot be longer than 72 bytes"
**Solution**: Fixed by using bcrypt directly instead of passlib

### Issue: "Module 'bcrypt' has no attribute '__about__'"
**Solution**: Fixed by switching from passlib to direct bcrypt usage

### Issue: Tables not created
**Solution**: Run `python create_tables.py` to create tables manually

## 📚 Documentation

- Full database documentation: `docs/DATABASE.md`
- API documentation: http://localhost:8000/docs (when server is running)
- Frontend API client: `frontend/lib/api.ts`

## ✨ Features Implemented

- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Refresh token mechanism
- ✅ Logout functionality
- ✅ Get current user info
- ✅ PostgreSQL database integration
- ✅ Frontend login page with validation
- ✅ Error handling and user feedback
- ✅ CORS configuration

## 🔒 Security Notes

1. **Change SECRET_KEY**: Update the secret key in `.env` for production
2. **Use HTTPS**: Set `secure=True` for cookies in production
3. **Strong Passwords**: Enforce password complexity requirements
4. **Rate Limiting**: Add rate limiting to auth endpoints
5. **Email Verification**: Implement email verification for new users
6. **Password Reset**: Complete the forgot/reset password flow

## 📞 Support

For issues or questions, refer to:
- Backend logs in terminal
- PostgreSQL logs: `C:\Program Files\PostgreSQL\18\data\pg_log\`
- API documentation at http://localhost:8000/docs