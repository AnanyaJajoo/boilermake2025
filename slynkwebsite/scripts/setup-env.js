#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps set up environment variables for Slynk AI
 * with a focus on email authentication with SendGrid.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a secure random string for AUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Path to the .env.local file
const envPath = path.join(process.cwd(), '.env.local');

// Create environment template
const createEnvTemplate = () => {
  const secret = generateSecret();
  
  return `# Authentication
AUTH_SECRET="${secret}"
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"

# API Mode (set to false for production-like environment)
USE_MOCK_API=false
NEXT_PUBLIC_USE_MOCK_API=false

# SendGrid Email Authentication
# IMPORTANT: THIS MUST BE A VERIFIED SENDER in your SendGrid account
# Go to app.sendgrid.com → Settings → Sender Authentication to verify
# The EMAIL_FROM address MUST match exactly what you verify in SendGrid
SENDGRID_API_KEY="SG.your-actual-sendgrid-api-key"
EMAIL_FROM="your-verified@email.com"

# Force to use production email mode
NODE_ENV=development
`;
};

// Main function
const main = () => {
  console.log('=== Slynk AI Local Environment Setup ===');
  console.log('This script will create a .env.local file with required environment variables.\n');
  
  // Create the .env.local file
  const envContent = createEnvTemplate();
  
  // Check if file exists
  const fileExists = fs.existsSync(envPath);
  
  if (fileExists) {
    console.log('.env.local already exists. Skipping creation.');
    console.log('If you want to update it, please edit the file manually or delete it first.');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local file created!');
    console.log('\nPlease edit the .env.local file and:');
    console.log('1. Replace SENDGRID_API_KEY with your actual SendGrid API key');
    console.log('2. Set EMAIL_FROM to a verified sender email in your SendGrid account');
  }
  
  console.log('\n=== Next Steps ===');
  console.log('1. Make sure your SendGrid sender identity is verified');
  console.log('2. Ensure your SendGrid API key has "Mail Send" permissions');
  console.log('3. Restart your application after making these changes');
};

main(); 