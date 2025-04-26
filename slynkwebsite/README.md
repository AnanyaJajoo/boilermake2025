# Slynk AI Personas

A platform for creating AI-powered virtual spokespersons with lip-synced avatars.

## Features

- Create custom AI personas with personalized information
- Add Q&A pairs to train your AI persona
- Chat with your AI personas in real-time
- Lip-synced video avatars via Simli API integration
- User authentication with Google or Magic Link

## Tech Stack

- Next.js 15+
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication
- Prisma ORM
- PostgreSQL database
- Simli API for avatar generation
- SendGrid for email authentication

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (optional - can use mock API for development)
- SendGrid account for email authentication (required for magic link signin)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/slynkwebsite.git
   cd slynkwebsite
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   pnpm run setup-env
   ```
   
   Edit `.env.local` to add your configuration.
   
   **IMPORTANT FOR EMAIL AUTHENTICATION**:
   - You MUST verify your sender identity in SendGrid (Settings → Sender Authentication)
   - The EMAIL_FROM variable must exactly match a verified sender identity
   - See EMAIL-AUTH-TROUBLESHOOTING.md for help with common issues

4. Generate Prisma client (optional if using mock API):
   ```bash
   pnpm prisma generate
   ```

5. Run database migrations (optional if using mock API):
   ```bash
   pnpm prisma migrate dev
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application.

## Development and Testing

### Demo Mode

The app includes a demo mode that uses a mock API instead of actual database and Simli API calls. This is useful for development and testing.

To enable demo mode, set `USE_MOCK_API=true` in your `.env.local` file.

### User Authentication

Authentication is handled by NextAuth.js. The app supports:
- Google OAuth
- Magic Link email (via SendGrid in production)

For development, authentication will work in mock mode with a simulated user session. In development mode, email authentication links are printed to the console instead of sent via email.

### Testing Email Authentication

We've included a tool to test your SendGrid email configuration:

```bash
pnpm test-email your@email.com
```

This will attempt to send a test email using your SendGrid configuration.

## Production Deployment

### Production Environment Setup

We've created a helper script to set up your production environment:

```bash
pnpm setup-prod
```

This interactive script will guide you through setting up all required environment variables including SendGrid configuration for email authentication.

### Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. For production deployment, make sure to:
   - Set up a PostgreSQL database
   - Get a Simli API key
   - Configure OAuth providers and SendGrid for email authentication
   - Set `USE_MOCK_API=false` in your production environment

3. Deploy to your hosting provider of choice (Vercel recommended for Next.js apps).

### Email Authentication in Production

For production email authentication:

1. Create a SendGrid account
2. Verify a sender identity (email or domain)
3. Create an API key with Mail Send permissions
4. Set up environment variables:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=your_verified_email@domain.com
   ```

For detailed instructions, see:
- [PRODUCTION-EMAIL-IMPLEMENTATION.md](./PRODUCTION-EMAIL-IMPLEMENTATION.md)
- [EMAIL-AUTHENTICATION-GUIDE.md](./EMAIL-AUTHENTICATION-GUIDE.md)
- [AUTH-ENVIRONMENT-VARIABLES.md](./AUTH-ENVIRONMENT-VARIABLES.md)

## Simli API Integration

This project integrates with [Simli](https://simli.com) to generate and interact with AI-powered personas. The integration enables:

1. **Face Generation**: Create realistic virtual representatives for products and services
2. **Interactive AI**: Users can chat with the generated personas
3. **Custom Voice Support**: Option to customize the voice of the AI persona

### Setup Requirements

To use the Simli integration, you need to set the following environment variables:

```
SIMLI_API_KEY=your_simli_api_key
```

You can get an API key by signing up at [Simli's website](https://simli.com).

### API Endpoints

The application uses the following Simli API endpoints:

- `/createE2ESessionToken` - Creates a session token for Simli API authentication
- `/startE2ESession` - Starts an interactive session with a Simli AI agent
- `/generateFaceID` - Generates a face ID based on reference images (optional)

### Authentication Flow

1. Users must be logged in to access the persona creation page
2. When creating a persona, the app generates a Simli face ID (or uses a default)
3. The persona data is stored in the database along with the Simli face ID
4. When interacting with a persona, the app uses the stored face ID to start a Simli session

## Documentation

The project includes extensive documentation:

- [PRODUCTION-DEPLOY.md](./PRODUCTION-DEPLOY.md) - Full production deployment guide
- [AUTHENTICATION-README.md](./AUTHENTICATION-README.md) - Authentication system overview
- [EMAIL-AUTHENTICATION-GUIDE.md](./EMAIL-AUTHENTICATION-GUIDE.md) - Setting up email authentication
- [EMAIL-AUTH-TROUBLESHOOTING.md](./EMAIL-AUTH-TROUBLESHOOTING.md) - Troubleshooting email issues

## License

[MIT](LICENSE)

## Acknowledgements

- [Simli](https://simli.ai) for the avatar generation API
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Next.js](https://nextjs.org) for the framework
- [SendGrid](https://sendgrid.com) for email services 