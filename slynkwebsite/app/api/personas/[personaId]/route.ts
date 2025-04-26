import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { mockApi } from "@/lib/mock-api"
import { Prisma } from "@prisma/client"

// Helper to determine if we should use mock API
const useMockApi = process.env.USE_MOCK_API === "true" || process.env.NODE_ENV === "development";

export async function GET(
  request: NextRequest,
  context: { params: { personaId: string } }
) {
  try {
    // Get the personaId from the URL params - await params before accessing
    const { personaId } = await context.params;
    console.log(`GET persona - ID: ${personaId}, useMockApi: ${useMockApi}`);
    
    // Use mock API in development or if specified
    if (useMockApi) {
      console.log("Using mock API to fetch persona");
      const persona = mockApi.getPersonaById(personaId);
      console.log("Mock API result:", persona ? "Found" : "Not found");
      
      if (!persona) {
        // Check if any mock personas exist
        const allPersonas = mockApi.getPersonas();
        console.log(`Total mock personas: ${allPersonas.length}`);
        if (allPersonas.length > 0) {
          console.log("Available persona IDs:", allPersonas.map(p => p.id).join(", "));
        }
        
        return NextResponse.json({ error: "Persona not found" }, { status: 404 });
      }
      return NextResponse.json(persona);
    }
    
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log("Authentication status:", session ? "Authenticated" : "Not authenticated");
    
    // Fetch the persona with QA pairs
    console.log("Fetching persona from database");
    const persona = await prisma.aIPersona.findUnique({
      where: { id: personaId },
      include: {
        qaPairs: true,
      },
    })
    
    console.log("Database query result:", persona ? "Found" : "Not found");
    
    if (!persona) {
      // If not found in database but we're in development, try fallback to mock
      if (process.env.NODE_ENV === "development") {
        console.log("Persona not found in database, trying mock API as fallback");
        const mockPersona = mockApi.getPersonaById(personaId);
        if (mockPersona) {
          console.log("Found in mock API, returning mock persona");
          return NextResponse.json(mockPersona);
        }
      }
      
      return NextResponse.json({ error: "Persona not found" }, { status: 404 })
    }
    
    // Check if user has access to this persona (skip if no user session)
    // @ts-ignore - NextAuth types issue
    if (session?.user && persona.userId !== session.user.id) {
      console.log(`Unauthorized access - Persona user ID: ${persona.userId}, Session user ID: ${session.user.id}`);
      return NextResponse.json({ error: "Unauthorized access to persona" }, { status: 403 })
    }
    
    return NextResponse.json(persona)
  } catch (error) {
    console.error("Error fetching persona:", error)
    
    // Fallback to mock API if database connection fails
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock API as fallback for persona details");
      try {
        const personaId = await context.params.personaId;
        const persona = mockApi.getPersonaById(personaId);
        if (persona) {
          return NextResponse.json(persona);
        }
      } catch (fallbackError) {
        console.error("Mock API fallback failed:", fallbackError);
      }
    }
    
    return NextResponse.json({ error: "Failed to fetch persona" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { personaId: string } }
) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "You must be logged in to update personas" },
      { status: 401 }
    )
  }

  const { personaId } = params
  const data = await request.json()

  try {
    // First check if persona belongs to this user
    const persona = await prisma.aIPersona.findUnique({
      where: {
        id: personaId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found or not authorized" },
        { status: 404 }
      )
    }

    // Update the persona with provided data
    const updatedPersona = await prisma.aIPersona.update({
      where: {
        id: personaId
      },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        faceId: data.faceId,
        voiceId: data.voiceId,
        settings: data.settings,
        // Only update fields that are provided
        ...Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined)
        )
      }
    })

    return NextResponse.json({ persona: updatedPersona })
  } catch (error) {
    console.error("Error updating persona:", error)
    return NextResponse.json(
      { error: "Failed to update persona" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { personaId: string } }
) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "You must be logged in to delete personas" },
      { status: 401 }
    )
  }

  const { personaId } = params

  try {
    // First check if persona belongs to this user
    const persona = await prisma.aIPersona.findUnique({
      where: {
        id: personaId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found or not authorized" },
        { status: 404 }
      )
    }

    // Delete the persona
    await prisma.aIPersona.delete({
      where: {
        id: personaId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting persona:", error)
    return NextResponse.json(
      { error: "Failed to delete persona" },
      { status: 500 }
    )
  }
} 