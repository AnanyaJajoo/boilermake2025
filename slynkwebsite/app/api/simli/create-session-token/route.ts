import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint for creating a Simli session token
 * We use their API key from environment variables for authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("[create-session-token] Unauthorized attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Simli API key from environment variables
    const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
    
    // Check if we have a valid API key
    if (!SIMLI_API_KEY || SIMLI_API_KEY === "YOUR_SIMLI_API_KEY") {
      console.warn("[create-session-token] Using mock token due to missing API key");
      // Return a mock token for development
      return NextResponse.json({ 
        sessionToken: `mock-token-${uuidv4()}`,
        isMock: true 
      });
        }
    
    // For production, return the actual API key as the session token
    // This is sufficient for the startE2ESession endpoint
          return NextResponse.json({
      sessionToken: SIMLI_API_KEY,
      isMock: false
    });

  } catch (error) {
    console.error("[create-session-token] Error:", error);
    return NextResponse.json(
      { error: "Failed to create session token" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for client-side access to the Simli API key
 * This is used by the simli-api.ts client
 */
export async function GET() {
  try {
    // Check if user is authenticated (optional for GET)
    const session = await getServerSession(authOptions);
    
    // Get Simli API key from environment variables
    const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
    
    // Check if we have a valid API key
    if (!SIMLI_API_KEY || SIMLI_API_KEY === "YOUR_SIMLI_API_KEY") {
      console.warn("[create-session-token] Using mock key for client-side");
      // Return a mock token for development
      return NextResponse.json({ 
        simliApiKey: `mock-token-${uuidv4()}`,
        isMock: true 
      });
    }
    
    // Return the actual API key for client-side use
    return NextResponse.json({
      simliApiKey: SIMLI_API_KEY,
      isMock: false
    });
  } catch (error) {
    console.error("[create-session-token] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve Simli API key" },
      { status: 500 }
    );
  }
} 