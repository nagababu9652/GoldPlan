# Email & OTP Delivery

**Scope:** OTP email delivery for registration and password reset — SMTP configuration, provider
options, deliverability, and the development workaround.
**Related:** `AUTHENTICATION.md` (login/registration flow), `../backend/.env` (configuration).

## 1. Current status

- ✅ OTP system works end to end (registration + password reset)
- ✅ OTP is shown in the frontend success message, printed in the backend console, and stored in PostgreSQL
- ✅ SMTP is configured in `backend/.env` (Gmail SMTP with a 16-character app password)
- ⚠️ Mail from personal Gmail senders can land in recipients' spam folders — see §4

## 2. Development workaround (works with or without email)

OTPs are always available three ways, so registration testing never depends on inbox delivery:

1. Frontend green success message after clicking "Send OTP"
2. Backend console output
3. PostgreSQL database

Testing without email:

1. Go to http://localhost:3000/register
2. Enter email and click "Send OTP"
3. Copy the OTP from the green success message
4. Enter the OTP in the verification step and complete registration

## 3. SMTP configuration (`backend/.env`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<16-character app password>   # never commit real credentials
SMTP_FROM=FinPlan <noreply@finplan.in>
```

### Option A — Gmail app password (used for local testing)

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate an app password: https://myaccount.google.com/apppasswords
   ("Select app" → Mail, "Select device" → Other → "FinPlan Backend")
3. Copy the 16-character password into `SMTP_PASSWORD`
4. Restart the backend:

   ```powershell
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

### Option B — Transactional email service (recommended for production)

**SendGrid (free tier: 100 emails/day)**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=FinPlan <noreply@finplan.in>
```

**Mailgun (free tier: 5,000 emails/month)**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.com
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM=FinPlan <noreply@finplan.in>
```

**Mailtrap (testing only — no real emails sent)**

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM=FinPlan <noreply@finplan.in>
```

## 4. Deliverability (avoiding the spam folder)

### Immediate fix for testing (Gmail SMTP)

1. Open the email in the spam folder and click "Not spam" / "Move to inbox"
2. Add the sender address to contacts
3. Create a Gmail filter: Settings → Filters and Blocked Addresses → From: sender address → check "Never send it to spam"

### DNS records for a sending domain (production)

- **SPF** — TXT record on the domain:

  ```text
  v=spf1 include:_spf.google.com ~all
  ```

- **DKIM** — enable signing for the domain and publish the provided TXT record
- **DMARC** — TXT record on `_dmarc`:

  ```text
  v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.com
  ```

### Best practices for production

1. Use a dedicated domain (not `@gmail.com`)
2. Set up SPF, DKIM, and DMARC records
3. Use a transactional email service (SendGrid, Mailgun, AWS SES)
4. Warm up the domain (start with low volume, increase gradually)
5. Monitor sender reputation
6. Include an unsubscribe link in marketing emails
7. Avoid spam-trigger words in subject lines

### Testing deliverability

Use https://www.mail-tester.com: send an email to the test address, check the spam score
(aim for < 5/10), and follow its recommendations.

## 5. Security notes

- Never commit real SMTP credentials; rotate the Gmail app password if it was ever shared
- Use a dedicated application password (not the main account password)
- Change `SMTP_FROM` to a domain you control before production use