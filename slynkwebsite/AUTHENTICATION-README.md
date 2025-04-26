s# Slynk Authentication Documentation

This document serves as an index for all authentication-related documentation for the Slynk AI Personas application.

## Overview

The Slynk AI Personas application uses NextAuth.js for authentication with two primary methods:
1. Email authentication (magic links via SendGrid)
2. Google OAuth authentication

## Documentation Index

| Document | Description |
|----------|-------------|
| [AUTH-ENVIRONMENT-VARIABLES.md](./AUTH-ENVIRONMENT-VARIABLES.md) | Complete list of environment variables for authentication |
| [EMAIL-AUTHENTICATION-GUIDE.md](./EMAIL-AUTHENTICATION-GUIDE.md) | Guide for setting up and configuring email authentication |
| [EMAIL-AUTH-TROUBLESHOOTING.md](./EMAIL-AUTH-TROUBLESHOOTING.md) | Troubleshooting guide for email authentication issues |
| [PRODUCTION-DEPLOY.md](./PRODUCTION-DEPLOY.md) | Production deployment guide (includes authentication setup) |
| [PRODUCTION-EMAIL-IMPLEMENTATION.md](./PRODUCTION-EMAIL-IMPLEMENTATION.md) | Step-by-step implementation guide for production email authentication |
| [PRODUCTION-EMAIL-SETUP.md](./PRODUCTION-EMAIL-SETUP.md) | SendGrid configuration for production email services |

## Quick Start

1. **Set environment variables**
   - Copy from [AUTH-ENVIRONMENT-VARIABLES.md](./AUTH-ENVIRONMENT-VARIABLES.md)
   - Generate secrets with `openssl rand -base64 32`
   - Or use our helper script: `pnpm setup-prod`

2. **Configure SendGrid** (for email authentication)
   - Create account and API key
   - Verify sender identity
   - Set environment variables

3. **Configure Google OAuth** (for social login)
   - Create OAuth credentials in Google Cloud Console
   - Add authorized origins and redirect URIs
   - Set environment variables

4. **Test your configuration**
   - Run `pnpm test-email your-email@example.com`
   - Check logs and email delivery

## Implementation Details

The authentication system is implemented across several files:

1. **NextAuth Configuration**
   - Located at `lib/auth.ts`
   - Configures providers, callbacks, and session management

2. **Email Provider**
   - Located at `lib/email.ts`
   - Implements SendGrid integration and email templates

3. **API Routes**
   - Located at `app/api/auth/[...nextauth]/route.ts`
   - Handles authentication requests and callbacks

4. **Sign In UI**
   - Located at `app/signin/page.tsx`
   - Provides the user interface for authentication

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to version control
   - Use different secrets for development and production

2. **Production Configuration**
   - Always use HTTPS in production
   - Set proper CORS and CSP headers
   - Validate callback URLs to prevent open redirect vulnerabilities

3. **Session Management**
   - JWT-based sessions with secure cookies
   - 30-day session expiration by default

## Testing Authentication

### Development Mode
In development mode, authentication is simplified:
- Email magic links are printed to the console
- Mock authentication can be enabled with environment variables

### Production Mode
In production mode:
- Real emails are sent via SendGrid
- OAuth providers require proper configuration
- Use the test script to verify email delivery

## Related Scripts

- `scripts/test-email-auth.js`: Test SendGrid configuration
- `production-build.sh`: Production build script that verifies environment setup

## Need Help?

If you encounter issues:
1. Check the troubleshooting guide
2. Verify environment variables
3. Check server logs for specific errors
4. Test authentication in development mode for detailed logging 