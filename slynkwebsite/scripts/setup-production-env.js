#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * This script helps set up the production environment variables for Slynk AI
 * with a focus on email authentication with SendGrid.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a secure random string for AUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Path to the .env.production file
const envPath = path.join(process.cwd(), '.env.production');

// Template for the .env.production file
const createEnvTemplate = (answers) => {
  const secret = answers.authSecret || generateSecret();
  
  return `# Authentication
AUTH_SECRET="${secret}"
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="${answers.productionUrl}"

# API Mode (set to false for production)
USE_MOCK_API=false
NEXT_PUBLIC_USE_MOCK_API=false

# SendGrid Email Authentication
SENDGRID_API_KEY="${answers.sendgridApiKey}"
EMAIL_FROM="${answers.emailFrom}"

# Google OAuth
${answers.useGoogleAuth ? `GOOGLE_CLIENT_ID="${answers.googleClientId}"
GOOGLE_CLIENT_SECRET="${answers.googleClientSecret}"` : '# Google OAuth not configured'}

# Database
DATABASE_URL="${answers.databaseUrl}"
DIRECT_URL="${answers.databaseUrl}"

# Simli API
${answers.usesSimli ? `SIMLI_API_KEY="${answers.simliApiKey}"` : '# SIMLI_API_KEY not configured'}
`;
};

// Questions to ask
const askQuestions = async () => {
  const answers = {};
  
  // Production URL
  await new Promise(resolve => {
    rl.question('Production URL (e.g., https://yourdomain.com): ', (answer) => {
      answers.productionUrl = answer.trim();
      resolve();
    });
  });
  
  // SendGrid API Key
  await new Promise(resolve => {
    rl.question('SendGrid API Key: ', (answer) => {
      answers.sendgridApiKey = answer.trim();
      resolve();
    });
  });
  
  // Email From
  await new Promise(resolve => {
    rl.question('Verified sender email (must match SendGrid verified identity): ', (answer) => {
      answers.emailFrom = answer.trim();
      resolve();
    });
  });
  
  // Google OAuth
  await new Promise(resolve => {
    rl.question('Do you want to configure Google OAuth? (y/n): ', (answer) => {
      answers.useGoogleAuth = answer.toLowerCase() === 'y';
      resolve();
    });
  });
  
  if (answers.useGoogleAuth) {
    await new Promise(resolve => {
      rl.question('Google Client ID: ', (answer) => {
        answers.googleClientId = answer.trim();
        resolve();
      });
    });
    
    await new Promise(resolve => {
      rl.question('Google Client Secret: ', (answer) => {
        answers.googleClientSecret = answer.trim();
        resolve();
      });
    });
  }
  
  // Database URL
  await new Promise(resolve => {
    rl.question('Database URL (postgresql://username:password@host:port/dbname): ', (answer) => {
      answers.databaseUrl = answer.trim();
      resolve();
    });
  });
  
  // Simli API
  await new Promise(resolve => {
    rl.question('Do you use Simli API? (y/n): ', (answer) => {
      answers.usesSimli = answer.toLowerCase() === 'y';
      resolve();
    });
  });
  
  if (answers.usesSimli) {
    await new Promise(resolve => {
      rl.question('Simli API Key: ', (answer) => {
        answers.simliApiKey = answer.trim();
        resolve();
      });
    });
  }
  
  // Generate or use provided auth secret
  await new Promise(resolve => {
    const generatedSecret = generateSecret();
    rl.question(`Auth Secret (leave blank to use generated: ${generatedSecret.substring(0, 10)}...): `, (answer) => {
      answers.authSecret = answer.trim() || generatedSecret;
      resolve();
    });
  });
  
  return answers;
};

// Main function
const main = async () => {
  console.log('=== Slynk AI Production Environment Setup ===');
  console.log('This script will help you set up your production environment variables');
  console.log('with a focus on email authentication using SendGrid.\n');
  
  const answers = await askQuestions();
  
  // Create the .env.production file
  const envContent = createEnvTemplate(answers);
  
  // Check if file exists
  const fileExists = fs.existsSync(envPath);
  
  if (fileExists) {
    await new Promise(resolve => {
      rl.question('.env.production already exists. Overwrite? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          fs.writeFileSync(envPath, envContent);
          console.log('\n✅ .env.production file updated!');
        } else {
          console.log('\n❌ Operation cancelled. No changes were made.');
        }
        resolve();
      });
    });
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.production file created!');
  }
  
  // Run the test email script
  await new Promise(resolve => {
    rl.question('\nDo you want to test the SendGrid configuration now? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Email to send test to: ', (email) => {
          console.log(`\nRunning test: pnpm test-email ${email}`);
          exec(`pnpm test-email ${email}`, (error, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  });
  
  console.log('\n=== Next Steps ===');
  console.log('1. Deploy your application to production');
  console.log('2. Make sure your SendGrid sender identity is verified');
  console.log('3. Test a login with email authentication');
  console.log('\nFor more details, see the EMAIL-AUTHENTICATION-GUIDE.md document.');
  
  rl.close();
};

main().catch(err => {
  console.error('Error:', err);
  rl.close();
}); 