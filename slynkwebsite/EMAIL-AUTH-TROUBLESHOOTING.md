# Email Authentication Troubleshooting Guide

## QUICK FIX: Sender Identity Verification

**If you see this error**: "The from address does not match a verified Sender Identity"

This is the most common issue with SendGrid email authentication. To fix it:

1. **Log in to your SendGrid account**: https://app.sendgrid.com/
2. **Go to Settings → Sender Authentication** in the left menu
3. **Verify your sender identity** by choosing ONE of these options:
   - **Single Sender Verification** (fastest): Verify the exact email address you're using in EMAIL_FROM
   - **Domain Authentication** (recommended for production): Verify your entire domain

**Step-by-step for Single Sender Verification**:
1. In SendGrid dashboard, go to Settings → Sender Authentication → Verify a Single Sender
2. Fill in the form with YOUR information (not the recipient's)
3. The "From Email Address" MUST EXACTLY MATCH your EMAIL_FROM environment variable
4. Complete the verification by clicking the link SendGrid sends to this email
5. Wait for verification to complete (typically a few minutes)
6. Update your .env.local or .env.production file to use this verified email

**Remember**: You can only send emails from verified email addresses or domains.

## Testing Email Delivery

We've created a dedicated script to test if your SendGrid configuration works:

```bash
# Run the test (replace with your actual email)
pnpm test-email your-email@example.com
```

This will send a test email using your SendGrid configuration. If successful, you'll receive an email. If not, the script will provide diagnostic information.

## Common Issues and Solutions

### 1. Environment Variables Missing or Incorrect

**Symptoms:**
- Error messages about missing environment variables
- "Unauthorized" errors from SendGrid

**Solutions:**
- Verify all required variables are present in `.env.production`:
  ```
  SENDGRID_API_KEY=your_key
  EMAIL_FROM=your_verified_email
  AUTH_SECRET=random_string
  NEXTAUTH_SECRET=same_random_string
  NEXTAUTH_URL=your_domain
  ```
- Check for typos or trailing spaces in your environment values

### 2. Invalid SendGrid API Key

**Symptoms:**
- 401 Unauthorized errors
- "API key does not start with 'SG.'" errors

**Solutions:**
- Regenerate your API key in the SendGrid dashboard
- Ensure you've copied the entire API key (it should start with "SG.")
- Verify the API key has "Mail Send" permissions

### 3. Unverified Sender Email

**Symptoms:**
- 403 Forbidden errors
- "Mail service access forbidden" errors
- "Sender identity does not have mail permissions"

**Solutions:**
- Verify your sender email or domain in SendGrid
- Ensure the EMAIL_FROM value matches a verified sender
- For new SendGrid accounts, you may need to complete additional verification steps

### 4. Emails Going to Spam

**Symptoms:**
- Users report not receiving authentication emails
- Emails are found in spam/junk folders

**Solutions:**
- Use a business domain email rather than free providers
- Complete domain verification in SendGrid
- Ensure your HTML is properly formatted
- Add SPF and DKIM records to your domain's DNS

### 5. Magic Link Not Working

**Symptoms:**
- Users click links but don't get signed in
- Invalid/expired token errors

**Solutions:**
- Verify `NEXTAUTH_URL` is set correctly to your production domain
- Check that both `AUTH_SECRET` and `NEXTAUTH_SECRET` are set
- Confirm token expiration hasn't elapsed (default is 24 hours)
- Ensure your site is using HTTPS

## Debugging Authentication Flow

To debug authentication issues:

1. **Review Server Logs**:
   - Check for error messages after authentication attempts
   - Look for specific error codes or messages

2. **Check NextAuth Configuration**:
   - Verify the auth.ts file has proper configuration
   - Ensure the adapter is properly configured

3. **Test in Development Mode**:
   - Run the app in development mode to see console logs
   - Authentication links will be printed to the console

4. **SendGrid Activity Feed**:
   - Login to SendGrid and check Activity → Email Activity
   - Look for delivery status, bounces, or blocks

## Manual Testing Steps

1. Go to your sign-in page
2. Enter an email address and click "Sign in with Email"
3. Check console/logs for errors
4. Monitor SendGrid activity feed for email delivery status
5. Check both inbox and spam folders
6. Try clicking the magic link within a few minutes

## Fixing Non-Delivery Issues

If emails are sent but not delivered:

1. **Set up sender authentication in SendGrid**:
   - Authenticate your domain
   - Verify your sender identity

2. **Improve email deliverability**:
   - Use a business email address 
   - Ensure your HTML is well-formatted
   - Set up proper DNS records (SPF, DKIM, DMARC)

3. **Check email reputation**:
   - Use tools like mail-tester.com to check spam score
   - Gradually increase sending volume for new accounts

## Emergency Alternatives

If you need an immediate solution while fixing email authentication:

1. **Temporarily use Google OAuth only**:
   - Remove email provider from auth.ts if needed
   - Encourage users to sign in with Google

2. **Use development mode printing**:
   - Temporarily enable development mode email printing in production
   - Send links manually to users (NOT recommended for real production) 