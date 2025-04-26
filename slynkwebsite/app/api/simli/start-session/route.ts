import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockApi } from "@/lib/mock-api";
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint for starting a Simli E2E session
 * This will use the persona data to create an interactive AI session
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("[start-session] Unauthorized attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { personaId, sessionToken } = body;
    
    console.log(`[start-session] Starting session for persona: ${personaId}`);

    if (!personaId) {
      console.error("[start-session] Missing personaId");
      return NextResponse.json(
        { error: "Persona ID is required" },
        { status: 400 }
      );
    }

    if (!sessionToken) {
      console.error("[start-session] Missing sessionToken");
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 400 }
      );
    }
    
    console.log(`[start-session] Using session token: ${sessionToken.substring(0, 10)}...`);

    // Check if we should force the real API regardless of environment
    const forceRealApi = process.env.FORCE_REAL_API === "true";
    
    // Check if mock API should be used in development
    const useMockApi = forceRealApi 
      ? false 
      : (process.env.USE_MOCK_API === "true" || process.env.NODE_ENV === "development");
    
    console.log(`[start-session] Using mock API: ${useMockApi} (force real API: ${forceRealApi})`);
    
    // Extra check to identify if we're using a mock token (it will start with mock-token or fallback-token)
    const isMockToken = sessionToken.startsWith('mock-token-') || sessionToken.startsWith('fallback-token-');
    if (isMockToken) {
      console.log(`[start-session] Detected mock token usage`);
    }
    
    // If we detect a mock token but useMockApi is false, we should force mock mode
    const forceMockMode = isMockToken && !useMockApi;
    if (forceMockMode) {
      console.log(`[start-session] Forcing mock mode due to mock token usage`);
    }
    
    // Determine the effective mode - either configured mock mode or forced mock mode
    const effectiveMockMode = useMockApi || forceMockMode;

    // Get Simli API key from environment variables (only needed for real API)
    let SIMLI_API_KEY = null;
    if (!effectiveMockMode) {
      SIMLI_API_KEY = process.env.SIMLI_API_KEY;
      if (!SIMLI_API_KEY) {
        console.error("[start-session] Simli API key missing");
        return NextResponse.json(
          { error: "Simli API key not configured" },
          { status: 500 }
        );
      }
    }
    
    // Find the persona in the database or mock data
    let persona;
    
    try {
      if (effectiveMockMode) {
        console.log(`[start-session] Using mock API to find persona: ${personaId}`);
        persona = mockApi.getPersonaById(personaId);
        
        if (persona) {
          // Add empty QA pairs array if needed for mock data
          persona.qaPairs = persona.qaPairs || [];
        }
      } else {
        console.log(`[start-session] Finding persona in database: ${personaId}`);
        
        // Check for DB connection
        if (!prisma) {
          console.error("[start-session] Prisma client not initialized");
        }
        
        try {
          persona = await prisma.aIPersona.findUnique({
            where: { id: personaId },
            include: { qaPairs: true },
          });
          
          // Log database retrieval result
          console.log(`[start-session] DB retrieval success: ${!!persona}`);
          console.log(`[start-session] Persona data: name=${persona?.name || "MISSING"}, desc=${persona?.description?.substring(0, 30) || "MISSING"}`)
        } catch (innerDbError) {
          console.error("[start-session] Inner database error:", innerDbError);
          throw innerDbError; // Pass to outer catch
        }
      }
    } catch (dbError) {
      console.error("[start-session] Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }
    
    console.log(`[start-session] Persona found: ${!!persona}`);

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 404 }
      );
    }

    // Verify that the persona belongs to the current user (skip in mock mode)
    if (!effectiveMockMode && persona.userId !== session.user.id) {
      console.error(`[start-session] Unauthorized access. Persona user ID: ${persona.userId}, session user ID: ${session.user.id}`);
      return NextResponse.json(
        { error: "Unauthorized to access this persona" },
        { status: 403 }
      );
    }

    // Create a system prompt from the persona data and Q&A pairs
    let systemPrompt = `You are a virtual spokesperson for ${persona.name}. `;
    systemPrompt += `Here's important information about ${persona.name}: ${persona.description}. `;
    
    // Add Q&A knowledge
    if (persona.qaPairs && persona.qaPairs.length > 0) {
      systemPrompt += "Here are some specific questions and answers you should know: ";
      
      persona.qaPairs.forEach((pair: { question: string; answer: string }) => {
        systemPrompt += `Q: ${pair.question} A: ${pair.answer} `;
      });
    }

    // Optional page link
    if (persona.pageLink) {
      systemPrompt += `You can refer users to this link for more information: ${persona.pageLink}. `;
    }

    systemPrompt += "Keep your responses friendly, helpful, and concise.";
    
    console.log(`[start-session] Prepared system prompt (length: ${systemPrompt.length})`);

    // For development or if mock API is enabled, return mock session data
    if (effectiveMockMode) {
      console.log("[start-session] Using mock session data");
      const mockSessionId = `mock-session-${Date.now()}`;
      
      try {
        // Create a chat session in the database or mock storage
        const chatSession = await (async () => {
          if (useMockApi) {
            // Use the mock API's createChatSession
            return {
              id: `chat-${Date.now()}`,
              personaId,
              userId: session.user.id,
              messages: [{
                id: `msg-${Date.now()}`,
                content: "Hello! How can I help you today?",
                isUser: false,
                createdAt: new Date().toISOString()
              }]
            };
          } else {
            // Use the real database but with mock session data
            try {
              return await prisma.chatSession.create({
                data: {
                  personaId,
                  userId: session.user.id,
                  messages: {
                    create: {
                      content: "Hello! How can I help you today?",
                      isUser: false,
                    },
                  },
                },
                include: {
                  messages: true,
                },
              });
            } catch (dbError) {
              console.error("[start-session] Database error in mock mode:", dbError);
              // Fallback to in-memory mock session
              return {
                id: `chat-fallback-${uuidv4()}`,
                personaId,
                userId: session.user.id,
                messages: [{
                  id: `msg-${Date.now()}`,
                  content: "Hello! How can I help you today?",
                  isUser: false,
                  createdAt: new Date().toISOString()
                }]
              };
            }
          }
        })();
        
        // Update the persona with the mock Simli session ID (if using real database)
        if (!useMockApi && persona.id) {
          try {
            await prisma.aIPersona.update({
              where: { id: personaId },
              data: { simliSessionId: mockSessionId },
            });
            console.log(`[start-session] Updated persona with mock Simli session ID: ${mockSessionId}`);
          } catch (updateError) {
            console.error("[start-session] Error updating persona with mock session ID:", updateError);
            // This is non-fatal, so continue
          }
        }
        
        console.log("[start-session] Returning mock session data");
        
        return NextResponse.json({
          sessionId: chatSession.id,
          simliSessionId: mockSessionId,
          success: true
        });
      } catch (mockError) {
        console.error("[start-session] Error creating mock session:", mockError);
        return NextResponse.json(
          { error: "Failed to create mock session" },
          { status: 500 }
        );
      }
    }

    // If we reach here, we're using the real Simli API
    
    // Prepare the request body for Simli API based on latest documentation
    const simliRequestBody = {
      apiKey: sessionToken, // Send session token as apiKey as required in the body
      faceId: persona.faceId || "tmp9i8bbq7c",
      ttsProvider: "Cartesia", // Using Cartesia as default
      ttsModel: "sonic-turbo-2025-03-07", // Latest model from API docs
      voiceId: "a167e0f3-df7e-4d52-a9c3-f949145efdab", // Default voice ID
      systemPrompt: systemPrompt,
      firstMessage: "Hello! How can I help you today?",
      maxSessionLength: 3600, // 1 hour
      maxIdleTime: 300, // 5 minutes
      language: "en",
      createTranscript: true
    };
    
    console.log(`[start-session] Calling Simli API to start E2E session with face ID: ${simliRequestBody.faceId}`);

    // Call the Simli API to start a session with error logging
    let response;
    try {
      console.log("[start-session] Simli request body:", JSON.stringify({
        ...simliRequestBody,
        apiKey: "REDACTED" // Don't log the API key/token
      }, null, 2));
      
      response = await fetch("https://api.simli.ai/startE2ESession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simliRequestBody),
      });
      
      console.log(`[start-session] Simli API response status: ${response.status}`);
    } catch (fetchError) {
      console.error("[start-session] Network error calling Simli API:", fetchError);
      return NextResponse.json(
        { error: "Network error connecting to Simli", details: fetchError instanceof Error ? fetchError.message : String(fetchError) },
        { status: 500 }
      );
    }

    // Handle non-OK responses with detailed logging
    if (!response.ok) {
      let errorData;
      let errorText;
      
      try {
        errorText = await response.text();
        console.error(`[start-session] Simli API error response: ${errorText}`);
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
      } catch {
        errorData = { message: `HTTP Error ${response.status}` };
      }
      
      console.error("[start-session] Simli API error:", errorData, "Status:", response.status);
      
      // If we're in development, fallback to mock mode as a last resort
      if (process.env.NODE_ENV === "development") {
        console.log("[start-session] Development mode - falling back to mock session after API error");
        
        const mockSessionId = `mock-fallback-${uuidv4()}`;
        const chatSession = {
          id: `chat-fallback-${uuidv4()}`,
          personaId,
          userId: session.user.id
        };
        
        return NextResponse.json({
          sessionId: chatSession.id,
          simliSessionId: mockSessionId,
          success: true,
          fallback: true,
          error: "Using fallback mock session due to Simli API error"
        });
      }
      
      // Otherwise return the error
      return NextResponse.json(
        { error: "Failed to start Simli session", details: errorData },
        { status: response.status }
      );
    }

    // Get the session data from Simli
    let sessionData;
    try {
      const responseText = await response.text();
      console.log(`[start-session] Simli API response: ${responseText}`);
      
      sessionData = JSON.parse(responseText);
      
      // Check if the response contains a sessionId
      if (!sessionData.sessionId) {
        console.error("[start-session] No sessionId in Simli response");
        
        // In development, generate a mock session ID
        if (process.env.NODE_ENV === "development") {
          sessionData.sessionId = `mock-generated-${uuidv4()}`;
          console.log(`[start-session] Generated mock sessionId: ${sessionData.sessionId}`);
        } else {
          return NextResponse.json(
            { error: "Invalid response from Simli API: No sessionId provided" },
            { status: 500 }
          );
        }
      }
      
      console.log(`[start-session] Simli session created: ${sessionData.sessionId}`);
    } catch (jsonError) {
      console.error("[start-session] Failed to parse Simli response:", jsonError);
      
      // In development, use a mock session as fallback
      if (process.env.NODE_ENV === "development") {
        console.log("[start-session] Development mode - using mock session due to parse error");
        sessionData = { sessionId: `mock-parse-error-${uuidv4()}` };
      } else {
        return NextResponse.json(
          { error: "Invalid response from Simli API" },
          { status: 500 }
        );
      }
    }

    try {
      // Create a new chat session in the database
      const chatSession = await prisma.chatSession.create({
        data: {
          personaId,
          userId: session.user.id,
          messages: {
            create: {
              content: "Hello! How can I help you today?",
              isUser: false,
            },
          },
        },
        include: {
          messages: true,
        },
      });
      
      console.log(`[start-session] Chat session created in database: ${chatSession.id}`);

      // Update the persona with the Simli session ID
      await prisma.aIPersona.update({
        where: { id: personaId },
        data: { simliSessionId: sessionData.sessionId || null },
      });
      
      console.log(`[start-session] Updated persona with Simli session ID: ${sessionData.sessionId}`);

      // Return the session data to the client
      return NextResponse.json({
        sessionId: chatSession.id,
        simliSessionId: sessionData.sessionId,
        success: true
      });
    } catch (dbError) {
      console.error("[start-session] Database error saving session:", dbError);
      
      // Generate a fallback response in development mode
      if (process.env.NODE_ENV === "development") {
        const fallbackId = `db-error-${uuidv4()}`;
        console.log(`[start-session] Using fallback chat session ID: ${fallbackId}`);
        
        return NextResponse.json({
          sessionId: fallbackId,
          simliSessionId: sessionData.sessionId,
          success: true,
          fallback: true
        });
      }
      
      return NextResponse.json(
        { error: "Failed to save chat session", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[start-session] Unhandled error:", error);
    
    // Generate a fallback response in development mode
    if (process.env.NODE_ENV === "development") {
      const fallbackChatId = `error-fallback-${uuidv4()}`;
      const fallbackSessionId = `error-simli-${uuidv4()}`;
      
      console.log(`[start-session] Using emergency fallback due to unhandled error`);
      console.log(`[start-session] Fallback chat ID: ${fallbackChatId}`);
      console.log(`[start-session] Fallback Simli session ID: ${fallbackSessionId}`);
      
      return NextResponse.json({
        sessionId: fallbackChatId,
        simliSessionId: fallbackSessionId,
        success: true,
        fallback: true,
        fallbackReason: "Unhandled error" 
      });
    }
    
    return NextResponse.json(
      { error: "Failed to start Simli session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 