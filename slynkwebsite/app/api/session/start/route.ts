import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { mockApi } from "@/lib/mock-api";

// Helper to determine if we should use mock API
const useMockApi = process.env.USE_MOCK_API === "true" || process.env.NODE_ENV === "development";

/**
 * API handler for starting a new chat session
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get persona ID from the request
    const body = await req.json();
    const { personaId } = body;

    if (!personaId) {
      return NextResponse.json(
        { error: "Persona ID is required" },
        { status: 400 }
      );
    }

    // Find the persona in the database
    const persona = await prisma.aIPersona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found", personaId },
        { status: 404 }
      );
    }

    // Check if Simli session ID exists for this persona
    if (!persona.simliSessionId) {
      return NextResponse.json(
        { error: "Simli session not configured for this persona" },
        { status: 400 }
      );
    }

    // Get Simli API key from environment variables
    const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
    if (!SIMLI_API_KEY) {
      console.error("Simli API key not configured in environment variables");
      return NextResponse.json(
        { error: "Simli API configuration missing" },
        { status: 500 }
      );
    }

    try {
      // Create a session token using the Simli API
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SIMLI_API_URL || 'https://api.simli.ai'}/createToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SIMLI_API_KEY,
        },
        body: JSON.stringify({
          sessionId: persona.simliSessionId,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Simli token creation error:", errorData);
        throw new Error(`Failed to create Simli token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Generate a welcome message using the new session token
      const greetingResponse = await fetch(`${process.env.NEXT_PUBLIC_SIMLI_API_URL || 'https://api.simli.ai'}/sendE2EMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: persona.simliSessionId,
          sessionToken: tokenData.sessionToken,
          message: "Please say 'Hello, how are you?' directly to the camera"
        }),
      });

      if (!greetingResponse.ok) {
        console.log("Warning: Failed to generate greeting, but continuing with session");
      }

      // Create or update the chat session in the database
      const chatSession = await prisma.chatSession.upsert({
        where: {
          userId_personaId: {
            userId: session.user.id,
            personaId: persona.id,
          },
        },
        update: {
          simliSessionToken: tokenData.sessionToken,
          updatedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          personaId: persona.id,
          simliSessionToken: tokenData.sessionToken,
        },
      });

      // Return success response with the new session token
      return NextResponse.json({
        success: true,
        personaId,
        sessionId: chatSession.id,
        simliSessionId: persona.simliSessionId,
        simliSessionToken: tokenData.sessionToken,
        enableAR: process.env.NEXT_PUBLIC_ENABLE_AR === "true",
      });
    } catch (error) {
      console.error("Error starting chat session:", error);
      return NextResponse.json(
        { error: "Failed to start chat session", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in session start API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 