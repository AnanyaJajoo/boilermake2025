import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// For production, use environment variables
// Instructions for setup:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project
// 3. Enable Google Sheets API
// 4. Create a service account with Editor permissions
// 5. Create a key for the service account (JSON format)
// 6. Create a Google Sheet and share it with the service account email

// Replace these with your own values from your Google service account
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';

// If we're in development mode and don't have Google credentials,
// provide a mock implementation for easier local development
const isMockMode = !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !SPREADSHEET_ID;

export async function addToWaitlist(email: string): Promise<boolean> {
  try {
    if (isMockMode) {
      console.log('Mock mode: Would add email to Google Sheets:', email);
      return true;
    }

    // Create JWT client
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); // loads document properties and worksheets

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Optional: Add headers if sheet is empty
    const rowCount = sheet.rowCount;
    if (rowCount <= 1) {
      await sheet.setHeaderRow(['Email', 'Timestamp']);
    }
    
    // Append the row
    await sheet.addRow({
      Email: email,
      Timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error adding email to waitlist spreadsheet:', error);
    return false;
  }
} 