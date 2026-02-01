# Email Verification Setup Guide

This guide will help you set up Gmail for sending verification emails.

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "LiftLink Backend" as the name
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Gmail credentials:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=abcdefghijklmnop
   FRONTEND_URL=http://localhost:5173
   ```

   **Important Notes:**
   - Use your full Gmail address for `GMAIL_USER`
   - Use the 16-character App Password (remove spaces) for `GMAIL_PASSWORD`
   - Update `FRONTEND_URL` if your frontend runs on a different port/domain

## Step 4: Install Dependencies

Make sure you have the required Python package:
```bash
pip install python-dotenv
```

## Step 5: Test the Setup

1. Start the backend server:
   ```bash
   python main.py
   ```

2. Try registering a new account
3. Check the console for any email sending errors
4. Check the user's inbox (and spam folder) for the verification email

## Troubleshooting

### "Authentication failed" error
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that there are no extra spaces in the password

### "Connection refused" error
- Check your internet connection
- Verify Gmail SMTP settings (should be `smtp.gmail.com:587`)

### Emails going to spam
- This is normal for automated emails
- Consider using a professional email service (SendGrid, Resend, AWS SES) for production

### Email not sending
- Check the backend console for error messages
- Verify the `.env` file is in the `backend/` directory
- Make sure the `.env` file is not in `.gitignore` (but don't commit it!)

## Production Recommendations

For production, consider using:
- **SendGrid** - Free tier: 100 emails/day
- **Resend** - Developer-friendly API
- **AWS SES** - Cost-effective for high volume
- **Mailgun** - Good deliverability

These services provide better deliverability and don't require App Passwords.
