# 📧 Email Setup Guide - Free Gmail SMTP

This guide will help you set up email verification using Gmail's free SMTP service.

## 🔧 Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and enter "Daycare Manager"
4. Click "Generate"
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
Edit `apps/api/.env` and replace these values:

```env
# Email Configuration (Gmail SMTP)
EMAIL_PROVIDER="gmail"
EMAIL_USER="your-actual-gmail@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
EMAIL_FROM="your-actual-gmail@gmail.com"
```

### Step 4: Test Email Sending
1. Start your API server: `npm run dev --filter=api`
2. Register a new user through the frontend
3. Check your email inbox for the verification email
4. If no email arrives, check the API console logs for error messages

## 🎯 Alternative Free Email Providers

### Option 1: Outlook/Hotmail (Free)
```env
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-outlook-password"
EMAIL_FROM="your-email@outlook.com"
```

### Option 2: Yahoo Mail (Free)
```env
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587" 
SMTP_SECURE="false"
EMAIL_USER="your-email@yahoo.com"
EMAIL_PASSWORD="your-yahoo-app-password"
EMAIL_FROM="your-email@yahoo.com"
```

## 🔍 Troubleshooting

### "Invalid credentials" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Double-check that 2-Factor Authentication is enabled

### "Connection timeout" error
- Check your internet connection
- Try using port 465 with `SMTP_SECURE="true"`

### Emails going to spam
- Add a custom domain in production
- Use a professional email address
- Consider using a dedicated email service for production

### Still not working?
- Check the API console logs for detailed error messages
- Verify your Gmail account allows "Less secure app access" (if not using App Password)

## 🚀 Production Recommendations

For production, consider upgrading to:
- **Gmail Workspace** ($6/month) - Better deliverability
- **Amazon SES** - Very cheap, $0.10 per 1000 emails
- **Mailgun** - Free tier: 5,000 emails/month
- **Postmark** - Free tier: 100 emails/month

## 📝 Current Implementation Features

✅ **HTML Email Templates** - Beautiful, responsive emails  
✅ **Email Verification** - Secure token-based verification  
✅ **Resend Functionality** - Users can request new verification emails  
✅ **Password Reset** - Ready for password reset emails  
✅ **Console Fallback** - Logs emails when SMTP not configured  
✅ **Multi-Provider Support** - Gmail, Outlook, Yahoo, custom SMTP  

## 🔒 Security Notes

- Never commit real email credentials to version control
- Use App Passwords, not regular passwords
- App Passwords are automatically revoked if you change your main password
- Consider using environment-specific email accounts for development/staging

---

**Need help?** Check the API logs in your terminal for detailed error messages when sending emails.