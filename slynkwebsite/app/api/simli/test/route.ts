import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * API endpoint to test the Simli API configuration
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("[simli-test] Unauthorized attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get Simli API key from environment variables
    const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
    
    // Check if we have a valid API key
    if (!SIMLI_API_KEY || SIMLI_API_KEY === "YOUR_SIMLI_API_KEY_HERE") {
      return NextResponse.json({ 
        status: "error",
        message: "Missing or invalid Simli API key in environment variables",
        configured: false
      });
    }
    
    // Test a basic API call to Simli (just getting available faces)
    try {
      const response = await fetch("https://api.simli.ai/getFaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: SIMLI_API_KEY
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ 
          status: "error",
          message: `API call failed: ${response.status}`,
          error: errorText,
          configured: false
        });
      }
      
      const data = await response.json();
      return NextResponse.json({ 
        status: "success",
        message: "Simli API key is valid and working",
        availableFaces: data.faces || [],
        configured: true
      });
      
    } catch (error) {
      return NextResponse.json({ 
        status: "error",
        message: "Failed to connect to Simli API",
        error: error instanceof Error ? error.message : "Unknown error",
        configured: false
      });
    }

  } catch (error) {
    console.error("[simli-test] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 