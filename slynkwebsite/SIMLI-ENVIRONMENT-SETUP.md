# Simli API Integration Setup Guide

This guide explains how to set up the Simli API integration for the avatar/agent feature.

## Environment Variables

The Simli integration requires an API key from Simli. To set up your environment:

1. Create a `.env.local` file in the root of your project (if it doesn't exist already)
2. Add your Simli API key:

```
SIMLI_API_KEY="your-actual-simli-api-key"
```

## How to Obtain a Simli API Key

1. Go to [Simli Studio](https://app.simli.com) and create an account
2. Navigate to your account settings or API section
3. Generate a new API key
4. Copy the key and add it to your `.env.local` file

## Testing Your Simli Configuration

We provide a test page to verify your Simli API configuration:

1. Start your development server
2. Navigate to `/simli-test` in your browser
3. The test page will check if your API key is valid
4. If successful, it will display available face IDs from your Simli account

## Common Errors

### "Invalid face ID" Error

If you see this error when starting a conversation, it usually means:

1. Your API key might be valid, but you don't have any faces set up in your Simli account
2. You need to create/configure faces in the Simli dashboard
3. The system will now automatically try to fetch available faces and use the first one

### "Invalid API key" Error

If you see this error:

1. Make sure your API key is correctly entered in `.env.local`
2. Verify the key is valid in the Simli dashboard
3. Restart your development server after updating the key

## Troubleshooting

If you encounter issues:

1. Check your browser console for error messages
2. Make sure your `.env.local` file has the correct Simli API key
3. Ensure you have a working internet connection
4. Verify that your browser has permission to access your camera and microphone
5. Try using Chrome or Safari if you encounter browser compatibility issues
6. Refer to the `SIMLI-API-TROUBLESHOOTING.md` file for more detailed help

## Using Mock Mode for Development

If you don't have a Simli API key, the system will automatically use a mock token. This is useful for development but will not connect to the real Simli service. The avatar will not appear, but you'll see an error message explaining the issue.

For a complete experience with the avatar feature, a valid Simli API key is required.

## Additional Resources

- [Simli API Documentation](https://api.simli.ai/docs)
- [Daily.co Documentation](https://docs.daily.co/) 