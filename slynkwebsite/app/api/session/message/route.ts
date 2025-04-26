import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { mockApi } from "@/lib/mock-api";
import { v4 as uuidv4 } from 'uuid';

// Helper to determine if we should use mock API
const useMockApi = process.env.USE_MOCK_API === "true" || process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
  try {
    console.log("[session/message] Message API called");
    
    // Parse request body
    const reqBody = await req.json();
    const { message, sessionId, simliSessionId, simliToken } = reqBody;
    
    console.log(`[session/message] Message: "${message.substring(0, 20)}...", SessionID: ${sessionId}`);
    console.log(`[session/message] SimliSessionID exists: ${!!simliSessionId}, SimliToken exists: ${!!simliToken}`);
    
    if (!message || !sessionId) {
      console.error("[session/message] Missing required parameters");
      return NextResponse.json({ error: "Message and session ID are required" }, { status: 400 });
    }

    // Check if this is a mock token (it will start with mock-token or fallback-token)
    const isMockToken = simliToken && (
      simliToken.startsWith('mock-token-') || 
      simliToken.startsWith('fallback-token-')
    );
    
    // If we detect a mock token, we should force mock mode
    const forceMockMode = isMockToken === true;
    
    // Determine the effective mode - either configured mock mode or forced mock mode
    const effectiveMockMode = useMockApi || forceMockMode;
    console.log(`[session/message] Using mock mode: ${effectiveMockMode} (forced: ${forceMockMode})`);

    // Use mock API if determined by our logic
    if (effectiveMockMode) {
      console.log("[session/message] Using mock API for messaging");
      
      try {
        // Add user message
        const userMessage = mockApi.addMessage(sessionId, message, true);
        
        // Find the persona associated with this session
        let personaName = "AI Assistant";
        const mockSessions = mockApi.getSessionMessages(sessionId);
        if (mockSessions.length > 0) {
          const persona = mockApi.getSessionPersona(sessionId);
          if (persona) {
            personaName = persona.name;
          }
        }
        
        // Generate AI response
        const aiResponse = mockApi.simulateSimliResponse(message, personaName);
        console.log(`[session/message] Generated mock response: "${aiResponse.substring(0, 20)}..."`);
        
        // Add AI response
        const newMessage = mockApi.addMessage(sessionId, aiResponse, false);
        
        return NextResponse.json({
          success: true,
          message: newMessage
        });
      } catch (mockError) {
        console.error("[session/message] Mock API error:", mockError);
        
        // Even more basic fallback if mock API fails
        return NextResponse.json({
          success: true,
          message: {
            id: `fallback-${Date.now()}`,
            content: "I'm here to help. What else would you like to know?",
            isUser: false,
            createdAt: new Date().toISOString(),
          }
        });
      }
    }

    // Try to get the user session
    let userSession;
    try {
      userSession = await getServerSession(authOptions);
      console.log(`[session/message] User authenticated: ${!!userSession?.user}`);
    } catch (authError) {
      console.error("[session/message] Auth error:", authError);
      // Continue with a null session - we'll provide a fallback response
      userSession = null;
    }

    // Try to fetch the chat session from database
    // Use a try/catch block to handle database errors
    let chatSession = null;
    try {
      if (userSession?.user) {
        chatSession = await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: { persona: true },
        });
        
        console.log(`[session/message] Chat session found: ${!!chatSession}`);
        
        // Check if user has access to this session
        if (chatSession && chatSession.userId !== userSession.user.id) {
          console.error(`[session/message] Unauthorized access - Session user: ${chatSession.userId}, Request user: ${userSession.user.id}`);
          return NextResponse.json({ error: "Unauthorized access to chat session" }, { status: 403 });
        }
        
        // Add user message to the database if we have a valid session
        if (chatSession) {
          try {
            await prisma.chatMessage.create({
              data: {
                content: message,
                isUser: true,
                sessionId,
              },
            });
            console.log("[session/message] User message added to database");
          } catch (dbError) {
            console.error("[session/message] Error saving user message:", dbError);
            // Continue anyway - non-fatal error
          }
        }
      }
    } catch (dbError) {
      console.error("[session/message] Database error:", dbError);
      // Continue with a null chatSession - we'll provide a fallback response
    }

    // Handle Simli integration if we have a simliSessionId and token
    if (simliSessionId && simliToken && !isMockToken) {
      try {
        console.log("[session/message] Sending message to Simli API");
        
        // Send message to Simli API
        const simliResponse = await fetch("https://api.simli.ai/sendE2EMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: simliSessionId,
            apiKey: simliToken,
            message: message,
            returnFullResponse: true
          }),
        });
        
        console.log(`[session/message] Simli API response status: ${simliResponse.status}`);

        if (!simliResponse.ok) {
          let errorData;
          try {
            errorData = await simliResponse.json();
          } catch (e) {
            errorData = await simliResponse.text();
          }
          console.error("[session/message] Simli API error:", errorData);
          throw new Error(`Failed to send message to Simli: ${simliResponse.status}`);
        }

        let simliData;
        try {
          const responseText = await simliResponse.text();
          console.log(`[session/message] Simli API response: ${responseText.substring(0, 100)}...`);
          simliData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[session/message] Error parsing Simli response:", parseError);
          throw new Error("Invalid response from Simli API");
        }
        
        // Check if we got a response message from Simli
        let aiResponseContent = null;
        if (simliData && (simliData.message || simliData.response || simliData.text)) {
          aiResponseContent = simliData.message || simliData.response || simliData.text;
          console.log(`[session/message] Simli response content: "${aiResponseContent.substring(0, 20)}..."`);
        }
        
        if (!aiResponseContent) {
          // If no response message in Simli response, use a fallback
          aiResponseContent = `I've received your message but I'm processing it. Please wait for my response.`;
          console.log("[session/message] Using fallback response content");
        }
        
        // Try to add AI response to the database if we have a valid session
        let newMessage = null;
        if (chatSession && userSession?.user) {
          try {
            newMessage = await prisma.chatMessage.create({
              data: {
                content: aiResponseContent,
                isUser: false,
                sessionId,
              },
            });
            console.log("[session/message] AI response added to database");
          } catch (dbError) {
            console.error("[session/message] Error saving AI response:", dbError);
            // Continue anyway - non-fatal error
          }
        }
        
        // If we couldn't save to the database, create a response object
        if (!newMessage) {
          newMessage = {
            id: `simli-${uuidv4()}`,
            content: aiResponseContent,
            isUser: false,
            createdAt: new Date().toISOString(),
            sessionId
          };
        }

        return NextResponse.json({
          success: true,
          message: newMessage,
          simliData
        });
      } catch (simliError) {
        console.error("[session/message] Simli API error:", simliError);
        
        // Fallback to a generic response if Simli API fails
        const fallbackResponse = "I apologize, but I'm having trouble processing your request right now. Please try asking a different question.";
        console.log("[session/message] Using fallback response due to Simli error");
        
        // Try to add AI response to the database if we have a valid session
        let newMessage = null;
        if (chatSession && userSession?.user) {
          try {
            newMessage = await prisma.chatMessage.create({
              data: {
                content: fallbackResponse,
                isUser: false,
                sessionId,
              },
            });
          } catch (dbError) {
            console.error("[session/message] Error saving fallback response:", dbError);
            // Continue anyway - non-fatal error
          }
        }
        
        // If we couldn't save to the database, create a response object
        if (!newMessage) {
          newMessage = {
            id: `fallback-${uuidv4()}`,
            content: fallbackResponse,
            isUser: false,
            createdAt: new Date().toISOString(),
            sessionId
          };
        }

        return NextResponse.json({
          success: true,
          message: newMessage,
          error: "Simli API error, using fallback response"
        });
      }
    } else {
      // No valid Simli integration available, use a fallback response
      console.log("[session/message] No valid Simli integration, using fallback");
      
      let personaName = "AI Assistant";
      
      // Try to get the persona name
      if (chatSession?.persona) {
        personaName = chatSession.persona.name;
      }
      
      // Generate a more diverse set of responses based on the message
      let aiResponse;
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        aiResponse = `Hello! I'm ${personaName}. How can I assist you today?`;
      } else if (lowerMessage.includes("help") || lowerMessage.includes("can you")) {
        aiResponse = `I'd be happy to help with that. As ${personaName}, I'm here to assist you with any questions you might have.`;
      } else if (lowerMessage.includes("thank")) {
        aiResponse = `You're welcome! Is there anything else I can help you with?`;
      } else if (lowerMessage.includes("who are you") || lowerMessage.includes("tell me about yourself")) {
        aiResponse = `I'm ${personaName}, your AI assistant. I'm here to provide information and answer questions on topics I've been trained to discuss.`;
      } else if (lowerMessage.includes("what can you do") || lowerMessage.includes("your capabilities")) {
        aiResponse = `As ${personaName}, I can answer questions, provide information, and engage in conversations about various topics. How can I assist you today?`;
      } else {
        // More varied fallback responses
        const fallbackResponses = [
          `Thank you for your message. As ${personaName}, I'm here to help with any questions or information you need.`,
          `I understand you're asking about that. Could you provide more details so I can give you a better response?`,
          `That's an interesting question. Let me address that for you from my perspective as ${personaName}.`,
          `As ${personaName}, I'd be happy to discuss this topic with you. What specific aspects are you interested in?`
        ];
        aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      // Try to add AI response to the database if we have a valid session
      let newMessage = null;
      if (chatSession && userSession?.user) {
        try {
          newMessage = await prisma.chatMessage.create({
            data: {
              content: aiResponse,
              isUser: false,
              sessionId,
            },
          });
        } catch (dbError) {
          console.error("[session/message] Error saving fallback response:", dbError);
          // Continue anyway - non-fatal error
        }
      }
      
      // If we couldn't save to the database, create a response object
      if (!newMessage) {
        newMessage = {
          id: `fallback-${uuidv4()}`,
          content: aiResponse,
          isUser: false,
          createdAt: new Date().toISOString(),
          sessionId
        };
      }

      return NextResponse.json({
        success: true,
        message: newMessage,
      });
    }
  } catch (error) {
    console.error("[session/message] Unhandled error:", error);
    
    // Provide a fallback response in all cases
    return NextResponse.json({
      success: true, // Return success anyway to prevent UI errors
      message: {
        id: `error-${Date.now()}`,
        content: "I'm having trouble processing your request. Let's try a different question.",
        isUser: false,
        createdAt: new Date().toISOString(),
      },
      error: "Unhandled error in message processing"
    });
  }
} 