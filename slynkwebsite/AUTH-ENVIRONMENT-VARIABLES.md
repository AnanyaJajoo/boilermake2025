# Authentication Environment Variables

This document explains all environment variables required for authentication in the Slynk AI Personas application.

## Core Authentication Variables

| Variable | Purpose | Required | Format | Example |
|----------|---------|----------|--------|---------|
| `AUTH_SECRET` | Secret key for encrypting auth cookies and tokens | Yes | Random string (32+ chars) | `WyOJ9EIzA5zR3myYQVJ9xpANKlnrXFss` |
| `NEXTAUTH_SECRET` | Legacy variable, should match AUTH_SECRET | Yes | Same as AUTH_SECRET | `WyOJ9EIzA5zR3myYQVJ9xpANKlnrXFss` |
| `NEXTAUTH_URL` | Full production URL of your site | Yes | URL with protocol | `https://slynk.example.com` |

## Email Authentication (SendGrid)

| Variable | Purpose | Required | Format | Example |
|----------|---------|----------|--------|---------|
| `SENDGRID_API_KEY` | SendGrid API key for sending emails | Yes* | SendGrid key | `SG.xxxxxx.yyyyy` |
| `EMAIL_FROM` | Email address for sending authentication emails | Yes* | Verified email | `noreply@yourcompany.com` |

*Required if using email authentication

## Google OAuth Authentication

| Variable | Purpose | Required | Format | Example |
|----------|---------|----------|--------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes* | Google OAuth ID | `123456-abcdef.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes* | Google OAuth secret | `GOCSPX-abcdefg123456` |

*Required if using Google authentication

## Mock Mode Variables

| Variable | Purpose | Required | Format | Example |
|----------|---------|----------|--------|---------|
| `USE_MOCK_API` | Enable mock authentication mode | No | Boolean | `true` or `false` |
| `NEXT_PUBLIC_USE_MOCK_API` | Client-side flag for mock mode | No | Boolean | `true` or `false` |

## Generating Secure Secrets

Use these commands to generate secure random strings for AUTH_SECRET:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Environment Files

For development:
- `.env.local` or `.env.development`

For production:
- `.env.production`

## Important Notes

1. **Security**: Never commit these variables to version control
2. **Consistency**: `AUTH_SECRET` and `NEXTAUTH_SECRET` should have the same value
3. **URL Format**: `NEXTAUTH_URL` must include the protocol (https://)
4. **Production Mode**: Set `USE_MOCK_API=false` in production
5. **Email Provider**: SendGrid is only used in production; development uses console logging

## Checking Variable Configuration

You can use this command to check if your authentication variables are properly set:

```bash
# From the project root
pnpm test-email your-test-email@example.com
```

## Troubleshooting

If authentication isn't working:

1. Check that all required variables are set
2. Verify `NEXTAUTH_URL` matches your actual domain
3. Ensure secrets are properly formatted with no spaces
4. Check SendGrid API key permissions (must have "Mail Send")
5. Verify that your sender email is verified in SendGrid

For detailed troubleshooting, see `EMAIL-AUTH-TROUBLESHOOTING.md`. 