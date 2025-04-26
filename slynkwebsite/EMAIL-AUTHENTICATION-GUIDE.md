# Email Authentication Setup Guide

This guide outlines how to set up and test email authentication for the Slynk AI Personas application in production.

## Overview

The application uses NextAuth.js with two authentication methods:
- Google OAuth
- Email (Magic Link) authentication via SendGrid

## Prerequisites

- SendGrid account (https://sendgrid.com)
- Verified sender domain or email address in SendGrid
- Access to modify environment variables

## SendGrid Configuration

### Step 1: Create a SendGrid Account
1. Sign up at https://sendgrid.com
2. Verify your account

### Step 2: Create an API Key
1. In SendGrid dashboard, go to Settings → API Keys
2. Click "Create API Key"
3. Name it "Slynk Email Authentication"
4. Set permission level to "Restricted Access" with "Mail Send" permissions
5. Copy the generated API key (you won't be able to see it again)

### Step 3: Verify a Sender Identity
1. Go to Settings → Sender Authentication
2. Choose either "Verify a Single Sender" (faster) or "Domain Authentication" (more reliable)
3. Follow the verification steps

## Environment Configuration

Add the following variables to your `.env.production` file:

```env
# Email Authentication (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_email@yourdomain.com

# NextAuth Configuration
AUTH_SECRET=generated_strong_random_string
NEXTAUTH_SECRET=same_as_auth_secret
NEXTAUTH_URL=https://your-production-domain.com
```

### About These Variables

- `SENDGRID_API_KEY`: Your SendGrid API key with Mail Send permissions
- `EMAIL_FROM`: Must be a verified sender email in your SendGrid account
- `AUTH_SECRET` and `NEXTAUTH_SECRET`: Should be the same value, a long random string used to encrypt cookies
- `NEXTAUTH_URL`: Full URL of your production site

### Generating Secure Secrets

Run this command to generate a secure random string:

```bash
openssl rand -base64 32
```

## Testing Email Authentication

### Development Testing
Email authentication in development mode prints magic links to the console instead of sending actual emails.

### Production Testing

1. Deploy your application with all environment variables configured
2. Navigate to the Sign In page
3. Enter an email address and click "Sign in with Email"
4. Check your email for the magic link (also check spam folder)
5. Click the link to complete authentication

### Common Issues and Solutions

#### Emails Not Sending
- Verify `SENDGRID_API_KEY` is correct
- Confirm `EMAIL_FROM` is verified in SendGrid
- Check SendGrid Activity Feed for sending errors

#### Magic Links Not Working
- Ensure `NEXTAUTH_URL` is correctly set to your production domain
- Verify `AUTH_SECRET` and `NEXTAUTH_SECRET` are properly set
- Check that callback URLs aren't being blocked by security settings

#### Invalid API Key Error
- Regenerate the API key in SendGrid
- Update the `SENDGRID_API_KEY` environment variable
- Restart your application

## Security Best Practices

1. Never commit API keys or secrets to version control
2. Regenerate secrets if ever compromised
3. Use environment variables for all sensitive data
4. Set appropriate CORS settings to prevent abuse
5. Implement rate limiting for authentication attempts

## Monitoring Email Delivery

SendGrid provides monitoring tools:
1. Go to Activity → Email Activity
2. Filter by recipient email to track specific authentication emails
3. View delivery status, opens, and clicks

## Customizing Email Templates

The email template is defined in `/lib/email.ts` in the `formatVerificationEmail` function. Customize this function to change the appearance of authentication emails.

## Appendix: Full Code Reference

### 1. Email Configuration (`/lib/email.ts`)
```typescript
// SendGrid setup, email sending, and template formatting functions
```

### 2. Auth Configuration (`/lib/auth.ts`)
```typescript
// NextAuth configuration including email provider setup
```

### 3. SignIn Page (`/app/signin/page.tsx`)
```typescript
// UI for authentication including email sign-in form
```

### 4. Check Email Page (`/app/check-email/page.tsx`)
```typescript
// UI shown after requesting email authentication
``` 