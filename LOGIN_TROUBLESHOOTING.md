# Login Page - Troubleshooting Guide

## ✅ Current Status

### Backend (Running on port 8000)
- ✅ PostgreSQL 18.4 connected
- ✅ Authentication API working
- ✅ CORS configured to allow all origins
- ✅ Login endpoint tested and working
- ✅ Default user created: user@finplan.in / Test@123456

### Frontend (Running on port 3000)
- ✅ Next.js server running
- ✅ Login page accessible at http://localhost:3000/login
- ✅ API client configured
- ✅ .env.local file created

## 🔐 Login Credentials

```
Email: user@finplan.in
Password: Test@123456
```

## 🧪 Testing the Login

### Step 1: Verify Backend is Running
```powershell
# Test backend health
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET

# Expected output: status = "ok"
```

### Step 2: Test Login API Directly
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"user@finplan.in","password":"Test@123456"}'
```

### Step 3: Open Browser and Navigate
1. Go to: http://localhost:3000/login
2. Open Developer Tools (F12)
3. Go to Console tab
4. Go to Network tab

### Step 4: Test Login from UI
1. Enter email: `user@finplan.in`
2. Enter password: `Test@123456`
3. Click "Sign In"
4. Watch the Network tab for the request

## 🐛 Common Issues and Solutions

### Issue 1: "Failed to fetch" Error

**Cause**: CORS or network connectivity issue

**Solution**:
- Backend CORS is now set to allow all origins (`"*"`)
- Make sure backend is running on port 8000
- Check browser console for specific error messages

### Issue 2: Frontend Not Picking Up Environment Variables

**Solution**:
1. Stop the frontend server (Ctrl+C)
2. Restart it:
   ```powershell
   cd frontend
   npm run dev
   ```
3. The `.env.local` file should now be loaded

### Issue 3: Network Request Not Showing in Browser

**Check**:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Make sure "Preserve log" is checked
4. Try logging in again
5. Look for the request to `/auth/login`

### Issue 4: Request Shows 400 Bad Request

**Check**:
1. Look at the Request Payload in Network tab
2. Verify the JSON format is correct:
   ```json
   {
     "email": "user@finplan.in",
     "password": "Test@123456"
   }
   ```
3. Check the Response tab for error details

### Issue 5: Request Shows CORS Error

**Check Backend Logs**:
- Look for OPTIONS requests in the backend terminal
- Should see: `"OPTIONS /auth/login HTTP/1.1" 200 OK`
- If you see 400 or 404, CORS is not configured correctly

## 🔍 Debugging Steps

### 1. Check Browser Console
```javascript
// In browser console (F12), run:
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### 2. Check Network Request Details
Look for:
- Request URL: Should be `http://localhost:8000/auth/login`
- Request Method: Should be `POST`
- Request Headers: Should include `Content-Type: application/json`
- Request Body: Should have email and password

### 3. Check Backend Logs
In the backend terminal, you should see:
```
INFO:     127.0.0.1:XXXXX - "POST /auth/login HTTP/1.1" 200 OK
```

If you see errors, they will show the full traceback.

### 4. Test with curl
```powershell
curl -X POST http://localhost:8000/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"user@finplan.in\",\"password\":\"Test@123456\"}"
```

## 📋 Checklist

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 3000
- [ ] PostgreSQL service is running
- [ ] Default user exists in database
- [ ] Backend .env has correct DATABASE_URL
- [ ] Frontend .env.local has correct API_URL
- [ ] Browser console shows no errors
- [ ] Network tab shows POST request to /auth/login
- [ ] Response status is 200 OK
- [ ] Response contains access_token

## 🔧 Quick Fixes

### Restart Backend
```powershell
# Stop current backend (Ctrl+C)
# Then restart:
cd backend
uvicorn app.main:app --reload --port 8000
```

### Restart Frontend
```powershell
# Stop current frontend (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### Verify PostgreSQL is Running
```powershell
Get-Service postgresql-x64-18
# Should show: Running
```

### Recreate Default User
```powershell
cd backend
python create_default_user.py
```

## 📊 Expected Successful Login Flow

1. User enters credentials in UI
2. Frontend sends POST to http://localhost:8000/auth/login
3. Backend validates credentials
4. Backend returns JWT tokens
5. Frontend stores tokens in localStorage
6. Frontend redirects to /dashboard

## 🎯 Success Indicators

✅ Network tab shows POST /auth/login with status 200
✅ Response contains `access_token`, `refresh_token`, `token_type`
✅ Browser localStorage has `finplan_token` and `finplan_user`
✅ User is redirected to dashboard page

## 📞 Still Having Issues?

Check the following:
1. Backend terminal for error logs
2. Browser console (F12) for JavaScript errors
3. Network tab for failed requests
4. Make sure both servers are running
5. Try incognito/private browser mode
6. Clear browser cache and localStorage

## 🔗 Useful Links

- Backend API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Login Page: http://localhost:3000/login
- Backend Health: http://localhost:8000/health