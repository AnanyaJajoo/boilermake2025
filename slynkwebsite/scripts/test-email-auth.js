#!/usr/bin/env node

/**
 * Email Authentication Test Script
 * 
 * This script tests if your SendGrid configuration is working properly.
 * It will attempt to send a test email using your SendGrid API key.
 * 
 * Usage:
 * 1. Make sure your .env.production or .env file has SENDGRID_API_KEY and EMAIL_FROM set
 * 2. Run: node scripts/test-email-auth.js your-test-email@example.com
 */

// Load environment variables
require('dotenv').config({ path: '.env.production' });
if (!process.env.SENDGRID_API_KEY) {
  // Try regular .env if .env.production doesn't have the values
  require('dotenv').config();
}

const sgMail = require('@sendgrid/mail');

async function main() {
  // Check for email argument
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('Error: Please provide a test email address as an argument');
    console.error('Usage: node scripts/test-email-auth.js your-test-email@example.com');
    process.exit(1);
  }

  // Check environment variables
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Error: SENDGRID_API_KEY is not set in your .env.production or .env file');
    process.exit(1);
  }

  if (!process.env.EMAIL_FROM) {
    console.error('Error: EMAIL_FROM is not set in your .env.production or .env file');
    console.exit(1);
  }

  console.log('🔑 Connecting to SendGrid...');
  
  try {
    // Set up SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Send a test email
    console.log(`📧 Sending test email to ${testEmail}...`);
    
    const msg = {
      to: testEmail,
      from: process.env.EMAIL_FROM,
      subject: 'Slynk Email Authentication Test',
      text: 'This is a test email to verify your SendGrid configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF53A5; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Slynk AI</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eaeaea; border-top: none;">
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Email authentication is configured correctly! 🎉</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">If you're seeing this message, your SendGrid integration is working properly.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 14px; color: #666;">This is a test email sent at: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    };
    
    const result = await sgMail.send(msg);
    
    if (result && result[0] && result[0].statusCode >= 200 && result[0].statusCode < 300) {
      console.log('✅ Success! Test email sent successfully.');
      console.log(`📬 Check ${testEmail} inbox (and spam folder) for the test email.`);
    } else {
      console.error('❌ Error: Unexpected response from SendGrid:', result);
    }
  } catch (error) {
    console.error('❌ Error sending test email:');
    
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error('Response body:', error.response.body);
      
      // Provide helpful guidance based on error
      if (error.response.status === 401) {
        console.error('\n🔑 Your SendGrid API key appears to be invalid or unauthorized.');
        console.error('Please check that you\'ve copied the full API key correctly.');
      } else if (error.response.status === 403) {
        console.error('\n⚠️ Your SendGrid account may have sending restrictions.');
        console.error('Please verify your sender identity in the SendGrid dashboard.');
      }
    } else {
      console.error(error.message || error);
    }
  }
}

main(); 