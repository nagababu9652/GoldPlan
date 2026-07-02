# Email Setup Guide for OTP

## Current Status
- ✅ OTP system is working
- ✅ OTP displayed in frontend (for development)
- ❌ Email not sending (Gmail credentials rejected)

## Option 1: Gmail with App Password (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification" 
3. Follow the prompts to enable it

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Click "Select app" → Choose "Mail"
3. Click "Select device" → Choose "Other (Custom name)"
4. Type: "FinPlan Backend"
5. Click "Generate"
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update backend/.env
```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Paste the 16-char app password
```

### Step 4: Restart Backend
```bash
Set-Location backend; uvicorn app.main:app --reload --port 8000
```

## Option 2: Use EmailJS (No Server Setup Required)

For development, you can use EmailJS to send emails directly from the frontend:

1. Sign up at https://www.emailjs.com/
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Update frontend to use EmailJS SDK

## Option 3: Use SendGrid (Production Ready)

1. Sign up at https://sendgrid.com/
2. Create API key
3. Update `backend/.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=FinPlan <noreply@finplan.in>
```

## Option 4: Use Mailtrap (Testing Only)

For testing without sending real emails:

1. Sign up at https://mailtrap.io/
2. Get SMTP credentials from inbox settings
3. Update `backend/.env`:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM=FinPlan <noreply@finplan.in>
```

## Current Workaround

Until email is configured, OTPs are:
1. ✅ Displayed in the frontend (green success message)
2. ✅ Printed in backend console
3. ✅ Stored in PostgreSQL database

## Testing Without Email

You can test the complete flow without email:
1. Go to http://localhost:3000/register
2. Enter email and click "Send OTP"
3. **Copy the OTP from the green success message**
4. Enter OTP in verification step
5. Complete registration

The OTP system is fully functional - just needs email credentials configured!