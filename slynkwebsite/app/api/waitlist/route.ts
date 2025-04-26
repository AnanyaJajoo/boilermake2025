import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { addToWaitlist } from '@/lib/google-sheets';

// Fallback to CSV if Google Sheets integration fails
async function appendToWaitlistCsv(email: string) {
  try {
    const waitlistPath = path.join(process.cwd(), 'waitlist.csv');
    const timestamp = new Date().toISOString();
    const entry = `${email},${timestamp}\n`;
    
    // Create file if it doesn't exist and add header
    try {
      await fs.access(waitlistPath);
    } catch {
      await fs.writeFile(waitlistPath, 'email,timestamp\n');
    }
    
    // Append the new entry
    await fs.appendFile(waitlistPath, entry);
    return true;
  } catch (error) {
    console.error('Error saving to waitlist CSV:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Try Google Sheets first, fall back to CSV if it fails
    let success = await addToWaitlist(email);
    
    // If Google Sheets failed, try CSV
    if (!success) {
      console.log('Falling back to CSV storage for waitlist entry');
      success = await appendToWaitlistCsv(email);
    }
    
    if (success) {
      return NextResponse.json(
        { success: true, message: 'Added to waitlist successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to add to waitlist' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 