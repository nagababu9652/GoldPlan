# Email Deliverability Guide

## Current Status
- ✅ OTP emails are sending successfully
- ⚠️ Emails going to spam (common for new Gmail senders)

## Quick Solution for Development

**Use the OTP from the frontend:**
- After clicking "Send OTP", a green success message appears
- It shows: "✅ OTP sent to [email]\n\nYour OTP is: [6-digit-code]"
- This is the fastest way to test during development

## Production Solutions

### Option 1: Use a Dedicated Email Service (Recommended)

Instead of Gmail SMTP, use a service optimized for transactional emails:

**SendGrid (Free tier: 100 emails/day)**
```python
# backend/.env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=FinPlan <noreply@finplan.in>
```

**Mailgun (Free tier: 5,000 emails/month)**
```python
# backend/.env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM=FinPlan <noreply@finplan.in>
```

### Option 2: Improve Gmail Deliverability

If you want to continue using Gmail:

#### A. Add SPF Record
Add to your DNS settings:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

#### B. Add DKIM Record
1. Go to Gmail Settings → Forwarding and POP/IMAP
2. Enable DKIM signing
3. Add the TXT record to your DNS

#### C. Add DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.com
```

### Option 3: Use a Different "From" Address

Instead of `noreply@finplan.in`, use your actual Gmail:
```python
# backend/.env
SMTP_FROM=FinPlan <boddunagababu54321@gmail.com>
```

## Immediate Fix for Testing

**Mark sender as "Not Spam":**
1. Open the email in spam folder
2. Click "Not spam" or "Move to inbox"
3. Add sender to contacts: boddunagababu54321@gmail.com

**Create a filter in Gmail:**
1. Go to Gmail Settings → Filters and Blocked Addresses
2. Create a new filter:
   - From: boddunagababu54321@gmail.com
   - To: [your-email]
3. Check "Never send it to spam"

## Testing Email Deliverability

Use mail-tester.com to check:
1. Send an email to the test address
2. Check your spam score (should be < 5/10)
3. Follow recommendations to improve

## Best Practices for Production

1. **Use a dedicated domain** (not @gmail.com)
2. **Set up SPF, DKIM, and DMARC** records
3. **Use a transactional email service** (SendGrid, Mailgun, AWS SES)
4. **Warm up your domain** (start with low volume, gradually increase)
5. **Monitor sender reputation** (use tools like Sender Score)
6. **Include unsubscribe link** (for marketing emails)
7. **Avoid spam trigger words** in subject lines

## Current Workaround

For now, users can:
1. Enter email on registration page
2. Click "Send OTP"
3. **Copy OTP from green success message**
4. Enter OTP in verification step
5. Complete registration

The OTP is also:
- Printed in backend console
- Stored in PostgreSQL database
- Sent to email (check spam folder)

This ensures the registration flow works even if email goes to spam.