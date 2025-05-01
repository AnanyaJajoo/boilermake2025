import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Check authentication (optional - you can remove this if the key is public)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the ElevenLabs API key from environment variables
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    
    // If we don't have an ElevenLabs API key, return a helpful error
    if (!elevenLabsApiKey) {
      console.log("No ElevenLabs API key found in environment variables");
      return NextResponse.json({ 
        error: "ElevenLabs API key not configured",
        message: "Voice customization may be limited"
      }, { status: 404 });
    }
    
    // Return the ElevenLabs API key
    return NextResponse.json({ 
      ttsAPIKey: elevenLabsApiKey, // Use ttsAPIKey as the parameter name for consistency with Simli API
      message: "ElevenLabs API key retrieved successfully" 
    });
  } catch (error) {
    console.error("Error retrieving ElevenLabs API key:", error);
    return NextResponse.json(
      { error: "Failed to retrieve ElevenLabs API key" },
      { status: 500 }
    );
  }
} 