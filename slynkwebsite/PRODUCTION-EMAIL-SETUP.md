# Production Email Setup for Slynk AI

This guide provides instructions for setting up email verification for your Slynk AI application in production using SendGrid.

## Prerequisites

- A SendGrid account (you can create one at [sendgrid.com](https://sendgrid.com))
- A verified sender identity in SendGrid (domain or single sender)
- Your SendGrid API key with email sending permissions

## Environment Configuration

Add the following variables to your `.env.production` file:

```
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email@yourdomain.com
```

## SendGrid Account Setup

1. **Create a SendGrid account**:
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Complete the account verification process

2. **Verify a Sender Identity**:
   - Go to Settings > Sender Authentication
   - Either verify a single sender email or set up domain authentication (recommended)
   - Follow SendGrid's verification steps

3. **Create an API Key**:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Give it a name like "Slynk AI Email"
   - Set permissions to "Restricted Access" and enable "Mail Send" permissions
   - Copy the generated API key (you'll only see it once) and add it to your environment variables

## Testing the Email Setup

Before deploying to production, you can test your email configuration:

1. Update your environment variables with the SendGrid configuration
2. Run the production build locally with `./production-build.sh`
3. Start the application with `pnpm start`
4. Try to sign in with an email address
5. Check if you receive the verification email

## Production Configuration Checklist

- [ ] SendGrid account created and verified
- [ ] Sender identity verified in SendGrid
- [ ] API key generated and added to environment variables
- [ ] `SENDGRID_API_KEY` added to production environment
- [ ] `EMAIL_FROM` set to your verified sender email
- [ ] Email templates tested and working correctly

## Troubleshooting

### Common Issues:

1. **Emails not sending**:
   - Verify your SendGrid API key is correct
   - Ensure your sender email is verified in SendGrid
   - Check SendGrid logs for any sending errors

2. **Emails going to spam**:
   - Set up proper SPF, DKIM and DMARC records for your domain
   - Use a professional sender email (preferably from your own domain)
   - Avoid spam-triggering content in your emails

3. **Authentication errors**:
   - Ensure that `AUTH_SECRET` and `NEXTAUTH_URL` are properly set
   - Check that your JWT configuration is correct

### Viewing Email Logs

1. Login to your SendGrid dashboard
2. Go to Activity > Email Activity
3. You can filter and search for specific emails to see delivery status

## Customizing Email Templates

You can customize the email templates by modifying the `formatVerificationEmail` function in `lib/email.ts`. This allows you to change the design, colors, and wording of your verification emails.

## Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [NextAuth.js Email Provider Documentation](https://next-auth.js.org/providers/email)
- [Email Authentication Best Practices](https://auth0.com/blog/email-authentication-best-practices/) 