#!/usr/bin/env node

/**
 * Email Authentication Diagnosis Script
 * 
 * This script checks your SendGrid configuration and diagnoses common issues.
 */

const sgMail = require('@sendgrid/mail');
require('dotenv').config({ path: '.env.local' });
if (!process.env.SENDGRID_API_KEY) {
  // Try other env files if .env.local doesn't have the values
  require('dotenv').config({ path: '.env.production' });
  if (!process.env.SENDGRID_API_KEY) {
    require('dotenv').config();
  }
}

// Get test email from command line or use default
const testEmail = process.argv[2] || 'test@example.com';

async function diagnose() {
  console.log('📧 Email Authentication Diagnosis Tool');
  console.log('=====================================\n');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  
  if (!apiKey) {
    console.error('❌ SENDGRID_API_KEY is not set in your environment variables.');
    console.log('   Please add this to your .env.local or .env.production file.');
    console.log('   Format: SENDGRID_API_KEY="SG.xxxxx.xxxxx"\n');
    return;
  } else {
    console.log('✅ SENDGRID_API_KEY is set.');
    if (!apiKey.startsWith('SG.')) {
      console.warn('⚠️  Warning: Your API key does not start with "SG." - this may indicate an invalid key format.');
    }
  }
  
  if (!fromEmail) {
    console.error('❌ EMAIL_FROM is not set in your environment variables.');
    console.log('   Please add this to your .env.local or .env.production file.');
    console.log('   Format: EMAIL_FROM="verified@yourdomain.com"\n');
    return;
  } else {
    console.log('✅ EMAIL_FROM is set to:', fromEmail);
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      console.error('❌ EMAIL_FROM does not appear to be a valid email address.');
      return;
    }
  }
  
  console.log('\n2. Testing SendGrid API connection...');
  
  try {
    // Set API key
    sgMail.setApiKey(apiKey);
    console.log('✅ API key set successfully.');
    
    // Try to send a test email
    console.log(`\n3. Attempting to send a test email to ${testEmail}...`);
    
    const msg = {
      to: testEmail,
      from: fromEmail,
      subject: 'SendGrid Diagnosis Test',
      text: 'This is a test email to diagnose your SendGrid configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4a154b;">SendGrid Configuration Test</h2>
          <p>This email confirms your SendGrid configuration is working correctly! 🎉</p>
          <p>Diagnosis timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    };
    
    try {
      const [response] = await sgMail.send(msg);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log('✅ Success! Test email sent successfully.');
        console.log(`   Status code: ${response.statusCode}`);
        console.log(`\n📬 Please check ${testEmail} inbox (including spam folder) for the test email.`);
      } else {
        console.error(`❌ Unexpected status code: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('❌ Failed to send email.');
      
      if (error.response) {
        console.error(`   Status code: ${error.response.status}`);
        console.error('   Error details:', error.response.body);
        
        // Provide helpful guidance based on common error codes
        if (error.response.status === 401) {
          console.log('\n👉 Your SendGrid API key appears to be invalid or unauthorized.');
          console.log('   - Check that you\'ve copied the full API key correctly');
          console.log('   - Try regenerating a new API key in the SendGrid dashboard');
        } 
        else if (error.response.status === 403) {
          console.log('\n👉 Forbidden error (403) indicates:');
          console.log('   - Your SendGrid account may have sending restrictions');
          console.log('   - The sender email address is not verified in SendGrid');
          console.log('   - Your API key may not have "Mail Send" permission');
          console.log('\n   Verify your sender identity in the SendGrid dashboard:');
          console.log('   https://app.sendgrid.com/settings/sender_auth');
        }
      } else {
        console.error('   Error:', error.message || error);
      }
    }
  } catch (error) {
    console.error('❌ Failed to configure SendGrid:', error.message || error);
  }
  
  console.log('\n4. Next steps:');
  console.log('   - If tests failed, fix the issues noted above');
  console.log('   - Ensure your SendGrid account is fully verified');
  console.log('   - Check that your sender identity is verified in SendGrid');
  console.log('   - Make sure your API key has "Mail Send" permissions');
}

diagnose(); 