# Google Sheets Waitlist Integration Setup

This guide walks you through setting up Google Sheets integration for the waitlist feature.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API for your project

## Step 2: Create a Service Account

1. In your project, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "slynk-waitlist"
4. Grant it the "Editor" role
5. Click "Create Key" and select JSON format
6. Save the JSON key file securely (don't share or commit to git)

## Step 3: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new sheet
3. Share the sheet with the service account email from your JSON key file (with Editor permissions)
4. Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## Step 4: Set Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Service account email from the JSON key file
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Private key from the JSON key file (make sure to keep quotation marks and replace newlines with \n)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Google Spreadsheet ID (from the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)
GOOGLE_SPREADSHEET_ID=your-google-sheet-id-here
```

## Accessing Waitlist Data

Once set up, all emails submitted through the waitlist form will be automatically added to your Google Sheet. The sheet will have two columns:
- Email: The submitted email address
- Timestamp: The date and time when the submission was received

You can access this sheet directly through Google Sheets, share it with team members, and export the data as needed.

## Notes

- For development without Google Sheets set up, the system will fall back to storing emails in a local CSV file
- Make sure not to expose your private key in public repositories 