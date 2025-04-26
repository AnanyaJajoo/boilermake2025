# Simli API Troubleshooting Guide

This guide will help you troubleshoot common issues with the Simli API integration.

## Common Issues

### "Failed to start chat session"

**Symptoms:**
- Error message "Failed to start chat session" appears when trying to chat with a persona
- Chat interface fails to load

**Solutions:**

1. **Enable mock API mode (Temporary Solution)**
   - Add the following to your `.env.local` file:
   ```
   USE_MOCK_API=true
   NEXT_PUBLIC_USE_MOCK_API=true
   ```
   - This will make the chat work with mock data instead of the real Simli API
   - Restart your development server

2. **Fix your Simli API key (Permanent Solution)**
   - Get a new valid Simli API key
   - Add it to your `.env.local` file:
   ```
   SIMLI_API_KEY=your_new_api_key_here
   USE_MOCK_API=false
   NEXT_PUBLIC_USE_MOCK_API=false
   ```
   - Restart your development server

**Verification:**
- The chat loads successfully
- You can send and receive messages
- Look for logs indicating successful connection

### "Black Screen with Error Message" 

**Symptoms:**
- The chat interface loads but shows a black screen in the avatar area
- When you send a message, you see "I'm having trouble processing your message right now"

**Cause:**
This issue typically occurs when:
- The Simli Player fails to initialize properly
- The message API cannot properly handle or parse the response
- The real API is being used but lacks proper credentials

**Solutions:**

1. **Check Browser Console for Errors**
   - Open developer tools (F12 or right-click → Inspect)
   - Look for errors related to Simli in the console
   - Identify any network errors or 401/403 responses

2. **Ensure Proper Environment Setup**
   - Verify that your environment variables are properly set in `.env.local`:
   ```
   # For mock mode
   USE_MOCK_API=true
   NEXT_PUBLIC_USE_MOCK_API=true
   
   # OR for real API mode (if you have a valid key)
   SIMLI_API_KEY=your_valid_api_key_here
   USE_MOCK_API=false
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

3. **Camera Permissions**
   - The Simli Player requires camera permissions
   - Ensure you've granted camera access to your browser
   - Try using a different browser if permissions are unclear

4. **Clear Browser Cache**
   - Clear your browser cache and cookies
   - Restart your browser and try again

5. **Use Mock Mode Temporarily**
   - Switch to mock mode as described above to test functionality
   
**Permanent Fix Implementation:**
Our latest update includes:
- Enhanced fallback system to handle API errors gracefully
- Improved message parsing to handle various response formats
- A better visual experience when the avatar can't be loaded
- Retries for API calls with exponential backoff

With these updates, the system should automatically handle errors and provide fallback responses even when components of the Simli API integration fail.

## Implementation Details

The Simli API integration has been updated with:

1. **Enhanced Fallback System**
   - Generates fallback session tokens when real API calls fail
   - Creates fallback responses for messages when needed

2. **Improved Error Handling**
   - Extensive logging for easier debugging
   - Graceful error states in the UI

3. **Mixed Mode Support**
   - Detects mock/real API modes automatically
   - Works even in mixed configuration states

## Simli API Documentation

For reference, the Simli API has these main endpoints:
- Create Session Token: Used to obtain an authorization token for the session
- Start Interactive Session: Initializes a session with an AI avatar
- Send Message: Sends user messages to the AI and receives responses

## Need Further Help?

If issues persist after trying these solutions, please contact the development team with:
- Your environment configuration (redact any API keys)
- Browser console logs
- Steps to reproduce the issue

## 2. "Avatar won't load" or "Black screen in chat"

This issue occurs when the 3D avatar cannot be initialized.

**Possible causes:**

1. WebGL is not supported or disabled in your browser
2. The Simli SDK failed to load
3. The Simli Player failed to initialize
4. The Simli API key is invalid

**Solutions:**

1. **Try a different browser:**
   - Chrome and Edge have the best WebGL support
   - Ensure WebGL is enabled in your browser settings

2. **Check for console errors:**
   - Open browser developer tools (F12)
   - Look for specific errors related to the Simli SDK or WebGL

3. **Verify your API key:**
   - Ensure your Simli API key is valid and active
   - Check the response from the session token API call

## 3. Recent API Changes (July 2023)

Simli has updated their API with the following changes:

**Parameter name changes:**
- `sessionToken` is now `apiKey` in most endpoints
- New parameter `ttsModel` is required for session creation
- New parameter `voiceId` is required for session creation

**Updated endpoints:**
- `/createE2ESessionToken` - Creates a session token
- `/startE2ESession` - Starts an interactive session
- `/sendE2EMessage` - Sends messages in a session

**How to handle these changes:**

1. **Update your code:**
   - The codebase has been updated to use the new parameter names
   - If you've made custom modifications, ensure you're using the new parameter names

2. **Check your API key:**
   - The latest API may require a newer API key format
   - If you're getting authentication errors, get a new API key from Simli

3. **Review the API documentation:**
   - The complete API documentation is available on the Simli website
   - Pay attention to required vs optional parameters

## 4. Getting Further Help

If you're still experiencing issues:

1. Check browser console logs for detailed error information
2. Review the server logs for API response details
3. Ensure your API key is valid and properly configured
4. Refer to the official Simli API documentation for the latest information

Remember that the fallback system should ensure users can always chat, even if the 3D avatar cannot be loaded.

## Simli API Reference

For more information about the Simli Auto API, refer to the official documentation:

```
POST /createE2ESessionToken: Creates a new session token for authentication
POST /startE2ESession: Initializes a new end-to-end interactive session with an AI avatar
```

Review your API implementation in:
- `/api/simli/create-session-token/route.ts`
- `/api/simli/start-session/route.ts`
- `/components/create/chat-interface.tsx` 