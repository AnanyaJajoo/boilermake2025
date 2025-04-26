import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint for generating a greeting video from a Simli avatar
 * This will take a personaId and generate a video of the avatar saying "Hello, how are you?"
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("Unauthorized attempt to generate greeting video");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { personaId, sessionToken } = body;

    if (!personaId) {
      return NextResponse.json(
        { error: "Persona ID is required" },
        { status: 400 }
      );
    }

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 400 }
      );
    }

    // Get Simli API key from environment variables
    const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
    if (!SIMLI_API_KEY) {
      console.error("Simli API key not configured in environment variables");
      return NextResponse.json(
        { error: "Simli API key not configured", details: "Please add SIMLI_API_KEY to your environment variables" },
        { status: 500 }
      );
    }

    // Find the persona in the database
    const persona = await prisma.aIPersona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 404 }
      );
    }

    // Verify that the persona belongs to the current user
    if (persona.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to access this persona" },
        { status: 403 }
      );
    }

    console.log(`Generating greeting video for persona: ${persona.name}`);

    // Call the Simli API to generate a greeting
    try {
      // Use the session token to send a message to the avatar
      const greetingResponse = await fetch("https://api.simli.ai/sendE2EMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: persona.simliSessionId,
          sessionToken: sessionToken,
          message: "Please say 'Hello, how are you?' directly to the camera"
        }),
      });

      if (!greetingResponse.ok) {
        const errorData = await greetingResponse.json();
        console.error("Simli API error:", errorData);
        throw new Error(`Failed to generate greeting: ${greetingResponse.status}`);
      }

      const greetingData = await greetingResponse.json();
      
      return NextResponse.json({
        success: true,
        personaId,
        greeting: true,
        message: "Greeting video generation initiated",
        simliData: greetingData
      });
    } catch (error) {
      console.error("Error generating greeting video:", error);
      return NextResponse.json(
        { error: "Failed to generate greeting video", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in generate-greeting API:", error);
    return NextResponse.json(
      { error: "Failed to process greeting video request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 