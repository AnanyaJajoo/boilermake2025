import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mockApi } from "@/lib/mock-api"

interface PersonaBasic {
  id: string;
  name: string;
  userId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const personaId = url.searchParams.get("personaId")
    
    const result: any = {
      timestamp: new Date().toISOString(),
      personaId: personaId || "none-provided"
    }
    
    // Test if mock API is enabled
    const useMockApi = process.env.USE_MOCK_API === "true" || process.env.NODE_ENV === "development"
    result.useMockApi = useMockApi
    
    // Get all personas from mock API
    const mockPersonas = mockApi.getPersonas()
    result.mockPersonasCount = mockPersonas.length
    result.mockPersonas = mockPersonas.map((p: any): PersonaBasic => ({ id: p.id, name: p.name }))
    
    // If a personaId was provided, try to find it in mock API
    if (personaId) {
      const mockPersona = mockApi.getPersonaById(personaId)
      result.mockPersonaFound = !!mockPersona
      if (mockPersona) {
        result.mockPersona = {
          id: mockPersona.id,
          name: mockPersona.name,
          userId: mockPersona.userId
        }
      }
    }
    
    // Try to connect to the database
    let dbConnected = false
    try {
      // Test database connection
      await prisma.$connect()
      dbConnected = true
      
      // Get all personas from the database
      const dbPersonas = await prisma.aIPersona.findMany({
        take: 10
      })
      result.dbPersonasCount = dbPersonas.length
      result.dbPersonas = dbPersonas.map((p: any): PersonaBasic => ({ id: p.id, name: p.name }))
      
      // If a personaId was provided, try to find it in the database
      if (personaId) {
        const dbPersona = await prisma.aIPersona.findUnique({
          where: { id: personaId }
        })
        result.dbPersonaFound = !!dbPersona
        if (dbPersona) {
          result.dbPersona = {
            id: dbPersona.id,
            name: dbPersona.name,
            userId: dbPersona.userId
          }
        }
      }
    } catch (dbError) {
      result.dbError = dbError instanceof Error ? dbError.message : "Unknown database error"
    } finally {
      result.dbConnected = dbConnected
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 