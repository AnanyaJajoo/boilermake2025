# Implementing Email Authentication in Production

This guide provides step-by-step instructions for implementing SendGrid email authentication in your production Slynk AI application.

## Prerequisites

Before you begin, make sure you have:
- A verified SendGrid account
- A verified sender identity in SendGrid
- Your SendGrid API key with Mail Send permissions

## Step 1: Set Up Production Environment

We've created a helper script to set up your production environment variables. Run:

```bash
pnpm setup-prod
```

This interactive script will:
- Generate secure random secrets for authentication
- Help you configure your SendGrid API key
- Set up all necessary environment variables
- Create a `.env.production` file
- Optionally test your email configuration

## Step 2: Verify Email Authentication Components

The application should already have all necessary components for email authentication:

1. **NextAuth Configuration** (`lib/auth.ts`)
   - Confirms we're using the Email provider
   - Sets up SendGrid for email delivery in production
   - Properly formats and sends verification emails

2. **Email Components** (`lib/email.ts`)
   - `setupSendgrid()` - Configures SendGrid with your API key
   - `sendEmail()` - Sends emails using the SendGrid API
   - `formatVerificationEmail()` - Creates beautiful, professional email templates

3. **User Interface**
   - Sign-in page with email input
   - "Check Email" page with instructions to users

All these components are connected and work together in production mode when `USE_MOCK_API=false`.

## Step 3: Test Email Delivery Locally

Before deploying to production, test your email configuration:

1. Create an `.env.production` using the `setup-prod` script
2. Run the email test script:
   ```bash
   pnpm test-email your@email.com
   ```
3. Check if you receive the test email (including spam folder)

## Step 4: Test Authentication Flow Locally

Test the complete authentication flow in a production-like environment:

1. Build for production:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

3. Navigate to http://localhost:3000/signin
4. Enter your email address
5. Check your email for the verification link
6. Click the link to authenticate

## Step 5: Deploy to Production

Deploy your application with the proper environment variables:

### Option A: Vercel Deployment
1. Push your code to your repository
2. Connect to Vercel
3. Add all environment variables from your `.env.production` file to Vercel
4. Deploy the application

### Option B: Manual Server Deployment
1. Copy your `.env.production` file to your server
2. Build and deploy the application using:
   ```bash
   ./production-build.sh
   ```

## Step 6: Test in Production

After deployment, test the authentication flow in production:

1. Navigate to your production URL
2. Sign in with email
3. Check your email for the verification link
4. Click the link to authenticate

## Troubleshooting

If you encounter issues with email authentication in production:

### Emails Not Sending
- Check SendGrid Activity logs in the SendGrid dashboard
- Verify your sender identity is correctly set up
- Ensure the EMAIL_FROM variable matches a verified sender identity
- Verify your API key has Mail Send permissions

### Authentication Failures
- Check the NEXTAUTH_URL is set correctly with https://
- Ensure AUTH_SECRET and NEXTAUTH_SECRET are both set
- Verify database connections are working (for user storage)

## Customizing Email Templates

You can customize the email verification template by editing the `formatVerificationEmail` function in `lib/email.ts`.

### Customization options:
- Change colors and branding
- Modify the message text
- Update the button style
- Add a logo or additional information

## Security Best Practices

For production email authentication:

1. Always use HTTPS for your production site
2. Set NEXTAUTH_URL to your https:// domain
3. Generate unique, strong values for AUTH_SECRET and NEXTAUTH_SECRET
4. Never commit secrets to version control
5. Implement proper rate limiting
6. Consider adding CAPTCHA for email sign-in attempts

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [NextAuth Email Provider Docs](https://next-auth.js.org/providers/email)
- [Email Authentication Guide](./EMAIL-AUTHENTICATION-GUIDE.md)
- [Troubleshooting Guide](./EMAIL-AUTH-TROUBLESHOOTING.md) 