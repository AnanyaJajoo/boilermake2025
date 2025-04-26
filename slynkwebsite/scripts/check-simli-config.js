#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local if it exists
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from .env.local');
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env.local file found. Make sure your environment variables are set appropriately.');
}

// Check if the Simli API key is set
const simliApiKey = process.env.SIMLI_API_KEY;
if (!simliApiKey) {
  console.error('❌ ERROR: SIMLI_API_KEY is not set in your environment variables');
  console.log('Please create a .env.local file with your Simli API key');
  process.exit(1);
} else {
  console.log('✅ SIMLI_API_KEY is set');
}

// Check API URL
const simliApiUrl = process.env.NEXT_PUBLIC_SIMLI_API_URL || 'https://api.simli.ai';
console.log(`🌐 Using Simli API URL: ${simliApiUrl}`);

// Check AR mode configuration
const arEnabled = process.env.NEXT_PUBLIC_ENABLE_AR === 'true';
console.log(`🥽 AR Mode is ${arEnabled ? 'enabled' : 'disabled'}`);

// Test connection to the Simli API
console.log('🔍 Testing connection to Simli API...');
try {
  // Simple ping to the Simli API
  const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${simliApiUrl}`, { 
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 5000
  });
  
  if (response.toString().trim() === '200') {
    console.log('✅ Successfully connected to Simli API');
  } else {
    console.warn(`⚠️ Received unexpected status code from Simli API: ${response.toString().trim()}`);
  }
} catch (error) {
  console.error('❌ Failed to connect to Simli API. Error:', error.message);
}

console.log('\n📋 Simli Configuration Summary:');
console.log('-----------------------------');
console.log(`API Key: ${simliApiKey ? '********' + simliApiKey.slice(-4) : 'Not set'}`);
console.log(`API URL: ${simliApiUrl}`);
console.log(`AR Mode: ${arEnabled ? 'Enabled' : 'Disabled'}`);
console.log('-----------------------------');

console.log('\n🚀 To start the application, run:');
console.log('npm run dev'); 