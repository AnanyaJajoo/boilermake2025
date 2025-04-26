import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { mockApi } from "@/lib/mock-api";
import { createSimliAgent } from "@/lib/simli-api";

// Helper to determine if we should use mock API
const useMockApi = process.env.USE_MOCK_API === "true" || process.env.NODE_ENV === "development" && !process.env.SIMLI_API_KEY;

// Get all AI personas for the current user
export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "You must be logged in to view personas" },
      { status: 401 }
    );
    }

  try {
    const personas = await prisma.aIPersona.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ personas });
  } catch (error) {
    console.error("Error fetching personas:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}

// Create a new AI persona
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore - NextAuth types issue
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID is missing from session" }, { status: 400 });
    }
    
    // Check if the user exists in the database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      // Create the user if they don't exist
      try {
        await prisma.user.create({
          data: {
            id: userId,
            name: session.user.name || "User",
            email: session.user.email || "unknown@example.com",
            image: session.user.image || null,
          },
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }
    }
    
    // Get JSON data
    const data = await req.json();

    // First create the AI persona in our database
    const persona = await prisma.aIPersona.create({
      data: {
        name: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt,
        firstMessage: data.firstMessage,
        faceId: data.faceId || "tmp9i8bbq7c", // Default face ID as fallback
        isCustomFaceInQueue: data.isCustomFaceInQueue || false,
        metadata: data.originalCharacterId ? {
          originalCharacterId: data.originalCharacterId,
          customFaceInProgress: true
        } : undefined,
        userId,
      },
    });

    // Check if we should also create a Simli Agent through their API
    if (!useMockApi && process.env.SIMLI_ENABLE_AGENT_CREATION === "true") {
      try {
        // Create the agent in Simli using improved agent creation function
        const simliAgent = await createSimliAgent({
          faceId: data.faceId || "tmp9i8bbq7c",
          name: data.name,
          firstMessage: data.firstMessage,
          prompt: data.systemPrompt,
          voiceProvider: "cartesia", // Default to Cartesia for better compatibility
          voiceId: data.voice, // Pass the voice ID from request data
          language: "en" // Default to English
        });

        // Update our persona record with the Simli agent ID
        await prisma.aIPersona.update({
          where: { id: persona.id },
          data: { 
            simliAgentId: simliAgent.id,
            // Store additional metadata if needed
            metadata: {
              simliAgentCreated: true,
              simliAgentDetails: JSON.stringify(simliAgent)
            }
          }
        });

        console.log(`Created Simli agent with ID ${simliAgent.id} for persona ${persona.id}`);
      } catch (error) {
        // Log but don't fail if agent creation has issues
        console.error("Error creating Simli agent:", error);
      }
    }

    return NextResponse.json({ id: persona.id });
  } catch (error) {
    console.error("Error creating AI persona:", error);
    return NextResponse.json({ error: "Failed to create AI persona" }, { status: 500 });
  }
} 