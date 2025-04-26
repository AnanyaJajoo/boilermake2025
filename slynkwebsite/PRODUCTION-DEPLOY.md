# Production Deployment Guide

This document describes how to deploy the Slynk AI Personas application to production with real API integrations.

## Prerequisites

- A production server or hosting provider (Vercel recommended)
- PostgreSQL database
- Simli API key
- Google OAuth credentials (for authentication)
- SMTP server credentials (for email authentication)
- Node.js 18.x or higher
- PNPM package manager
- Git
- Access to the Vercel platform (for Vercel deployment)
- SendGrid account for email authentication

## Environment Setup

1. Create a `.env.production` file with the following variables:

```env
# App settings
AUTH_SECRET="generate-a-new-secret-for-production"
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET="generate-a-new-secret-for-production"

# Use real API calls for production
USE_MOCK_API=false
NEXT_PUBLIC_USE_MOCK_API=false

# Simli API Key (required for production)
SIMLI_API_KEY=your-simli-api-key

# Database settings (required for production)
DATABASE_URL="postgresql://username:password@your-db-host:5432/your-db-name"
DIRECT_URL="postgresql://username:password@your-db-host:5432/your-db-name"

# Google OAuth (required for production)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Provider (required for production)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="username"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@example.com"

# Email Authentication (SendGrid)
SENDGRID_API_KEY=<your-sendgrid-api-key>
```

Replace all placeholder values with your actual credentials.

## Database Setup

1. Make sure your PostgreSQL database is accessible from your hosting provider.

2. Apply the Prisma migrations to set up the database schema:

```bash
npx prisma migrate deploy
```

3. Generate the Prisma client:

```bash
npx prisma generate
```

## Building for Production

1. Install dependencies (if not already installed):

```bash
pnpm install
```

2. Build the application:

```bash
pnpm build
```

3. Start the production server:

```bash
pnpm start
```

## Deployment on Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel

3. Configure environment variables in the Vercel dashboard:
   - Add all the environment variables from your `.env.production` file
   - Make sure to set `NEXTAUTH_URL` to your Vercel deployment URL

4. Deploy the application

## Simli API Integration

The Simli API integration requires:

1. A valid Simli API key
2. Proper configuration of the Simli services:
   - Face ID generation
   - E2E session creation
   - TTS services

Make sure your Simli API key has sufficient permissions for all required services.

## Authentication Setup

### Google OAuth

1. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/)
2. Set authorized JavaScript origins to your domain
3. Set authorized redirect URIs to:
   - `https://your-domain.com/api/auth/callback/google`

### Email Authentication

Make sure your SMTP server is properly configured:
- Check that the port is correct (usually 587 for TLS)
- Verify that your SMTP username and password are correct
- Test that the FROM email address is authorized to send through your SMTP server

## Email Authentication Setup with SendGrid

1. Create a SendGrid account at https://sendgrid.com/
2. Create an API key with "Mail Send" permissions
3. Add the API key to your `.env.production` file as `SENDGRID_API_KEY`
4. Set your sender email address in the `EMAIL_FROM` environment variable
5. Ensure your domain is properly verified in SendGrid to avoid deliverability issues

## File Storage

For production use, implement proper file storage for:
- User-uploaded images
- Voice samples
- Other media assets

Consider using:
- AWS S3
- Cloudinary
- Vercel Blob Storage

## Troubleshooting

If you encounter issues:

1. Check your environment variables are set correctly
2. Verify database connection
3. Test Simli API connectivity
4. Check authentication configurations
5. Review server logs for specific errors

## Security Considerations

- Use strong, unique secrets for AUTH_SECRET and NEXTAUTH_SECRET
- Keep your API keys secure
- Set up CORS properly
- Implement rate limiting
- Configure secure headers

## Performance Optimization

- Enable caching where appropriate
- Consider implementing edge functions for global performance
- Optimize image and media asset delivery

## Monitoring

Set up monitoring for:
- Server health
- API request performance
- Database performance
- Error tracking 