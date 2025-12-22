# IMAP Email-to-Ticket Setup Guide

## Quick Setup

Your `.env` file should have exactly these lines (no extra spaces, no quotes):

```env
MONGO_URI=mongodb://localhost:27017/workdesks
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=yasirraeesit@gmail.com
EMAIL_PASS=bmgv lere pgnq rsmn
EMAIL_FROM=Support Panel <no-reply@supportpanel.com>
APP_URL=http://localhost:5173
IMAP_USER=yasirraeesit@gmail.com
IMAP_PASS=bmgv lere pgnq rsmn
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true
IMAP_POLL_INTERVAL=60000
```

## Gmail IMAP Setup

1. **Enable IMAP in Gmail:**
   - Go to https://mail.google.com/mail/u/0/#settings/fwdandpop
   - Scroll to "IMAP access"
   - Select "Enable IMAP"
   - Click "Save Changes"

2. **Verify App Password:**
   - Your app password: `bmgv lere pgnq rsmn`
   - This should work for both SMTP and IMAP
   - If not working, generate a new one at: https://myaccount.google.com/apppasswords

## Testing

After updating `.env` and restarting the server, you should see:

```
✅ Email service is ready
📧 Starting email receiver service...
✅ Email receiver polling every 60 seconds
```

## Troubleshooting

### Issue: "Missing credentials for PLAIN"
**Solution:** Remove any quotes around EMAIL_PASS and IMAP_PASS

### Issue: "IMAP credentials not configured"
**Solution:** Ensure IMAP_USER and IMAP_PASS are in .env file

### Issue: "IMAP connection failed"
**Solutions:**
1. Enable IMAP in Gmail settings
2. Check if app password is correct
3. Try generating a new app password
4. Ensure no firewall blocking port 993

## How to Test Email-to-Ticket

1. Send an email to: yasirraeesit@gmail.com
2. Wait up to 60 seconds
3. Check your agent dashboard for new ticket
4. You should receive a confirmation email back

## Expected Console Output

```
🚀 Server running in development mode on port 5000
MongoDB Connected: localhost
✅ Email service is ready
📧 Starting email receiver service...
✅ Email receiver polling every 60 seconds
```

When an email arrives:
```
📬 Found 1 new email(s)
📨 Processing email #1
From: sender@example.com
Subject: Test Issue
✅ Created ticket: TKT-001
✅ Sent confirmation email to sender@example.com
```
