# Slynk - AI Persona Web App with Simli Integration

This project integrates the Simli AI API for creating virtual spokespersons with realistic video and audio capabilities. The application allows users to create AI personas that can interact in both standard chat mode and AR (Augmented Reality) mode.

## Features

- Create AI personas with custom knowledge, appearance, and voice
- Chat with AI personas using realistic video and audio through Simli
- AR mode for immersive experiences
- Dashboard for managing multiple personas
- Secure authentication through NextAuth.js

## Simli Integration

The application integrates with Simli's E2E (End-to-End) API for creating realistic conversational AI experiences. Key components:

### API Routes

- `/api/simli/create-session-token` - Creates a secure session token for Simli API
- `/api/simli/start-session` - Initializes a Simli session with persona data
- `/api/session/message` - Handles sending messages to the Simli API

### Client Components

- `ChatInterface` - Main component for interacting with Simli avatars
- `ARModeToggle` - Toggle for switching between standard and AR modes
- `simli-client.ts` - Utility functions for Simli SDK integration

### Technical Implementation

The Simli integration follows these steps:

1. Create a session token through the Simli API
2. Start a session with the persona's knowledge (Q&A pairs)
3. Initialize the client-side Simli player with WebRTC
4. Handle sending/receiving messages through WebRTC or REST API
5. Support AR mode when the device is compatible

## Development

This application is built with:

- Next.js (App Router)
- TypeScript
- Prisma (database ORM)
- TailwindCSS (styling)
- Lucide (icons)
- Simli API (AI personas)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables by creating a `.env.local` file:
   ```
   # Simli API Key - Replace with your actual API key
   SIMLI_API_KEY=your_simli_api_key_here
   
   # WebRTC/API URL - Change to production URL when deploying
   NEXT_PUBLIC_SIMLI_API_URL=https://api.simli.ai
   
   # AR capabilities (optional)
   NEXT_PUBLIC_ENABLE_AR=true
   
   # Database connection string (if needed)
   DATABASE_URL="postgresql://username:password@localhost:5432/slynkdb"
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Deployment

The application can be deployed to any platform that supports Next.js, such as Vercel or Netlify.

1. Set up the required environment variables on your hosting platform
2. Deploy using the platform's recommended deployment process
3. Ensure the Simli API key is properly configured in the production environment

## AR Mode Capabilities

AR mode requires:
- WebXR compatible browser
- Camera permissions
- Device with AR capabilities

For optimal experience, use mobile devices with AR capabilities.

## Troubleshooting

### API Errors

If you encounter API errors with the Simli integration:

1. Verify your API key is correct in the environment variables
2. Check that the persona has been properly created with Q&A pairs
3. Ensure media permissions are granted in the browser

### WebRTC Connection Issues

If the video stream doesn't load:

1. Check browser console for errors
2. Verify that camera permissions are granted
3. Try using a different browser or device

### Mock Mode

During development, you can set `USE_MOCK_API=true` in your `.env.local` file to use mock data instead of making real API calls to Simli.

## License

MIT 