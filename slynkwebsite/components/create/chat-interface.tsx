"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, ImageIcon, Mic, Bot, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { loadSimliSDK, initSimliPlayer, requestMediaPermissions } from "@/lib/simli-client"
import { ARModeToggle } from "@/components/create/ar-mode-toggle"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatInterfaceProps {
  personaId: string
  personaName: string
}

export function ChatInterface({ personaId, personaName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simliData, setSimliData] = useState<any>(null)
  const [simliToken, setSimliToken] = useState<string | null>(null)
  const [simliPlayer, setSimliPlayer] = useState<any>(null)
  const [isARMode, setIsARMode] = useState(false)
  const [arSupported, setArSupported] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Start chat session on component mount
  useEffect(() => {
    // Add debug info
    console.log("[Chat] Starting chat for persona:", personaId, personaName);
    
    // Load Simli SDK
    loadSimliSDK()
      .then(loaded => {
        console.log("[Chat] Simli SDK loaded:", loaded);
        // Request media permissions
        return requestMediaPermissions();
      })
      .then(hasPermissions => {
        console.log("[Chat] Media permissions granted:", hasPermissions);
        startChatSession();
      })
      .catch(err => {
        console.error("[Chat] Error during initialization:", err);
        setError("Failed to initialize chat: " + (err.message || "Unknown error"));
        setLoading(false);
      });
    
    // Cleanup on unmount
    return () => {
      if (simliPlayer) {
        console.log("[Chat] Destroying Simli player");
        simliPlayer.destroy();
      }
    }
  }, [personaId]);

  const startChatSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("[Chat] Starting chat session for persona:", personaId);
      
      // First, get a Simli session token with retries
      console.log("[Chat] Requesting Simli session token");
      let tokenData;
      let tokenError = null;
      
      // Try up to 3 times to get a token
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const tokenResponse = await fetch("/api/simli/create-session-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            }
          });
          
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error(`[Chat] Failed to create Simli session token (attempt ${attempt}/3):`, tokenResponse.status, errorText);
            
            if (attempt === 3) {
              tokenError = `Failed to create session token: ${tokenResponse.status}`;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
            continue;
          }
          
          tokenData = await tokenResponse.json();
          console.log("[Chat] Received session token:", tokenData.sessionToken ? "✅ (token received)" : "❌ (no token)");
          
          // Break out of retry loop if successful
          if (tokenData.sessionToken) {
            tokenError = null;
            break;
          } else {
            tokenError = "Failed to get Simli session token - empty response";
          }
        } catch (err) {
          console.error(`[Chat] Error creating session token (attempt ${attempt}/3):`, err);
          tokenError = err instanceof Error ? err.message : "Unknown error creating session token";
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }
      
      // Check if we eventually got a token
      if (!tokenData?.sessionToken) {
        throw new Error(tokenError || "Failed to get Simli session token after multiple attempts");
      }
      
      setSimliToken(tokenData.sessionToken);
      
      const isMockToken = tokenData.sessionToken && (
        tokenData.sessionToken.startsWith('mock-token-') || 
        tokenData.sessionToken.startsWith('fallback-token-')
      );
      
      if (isMockToken) {
        console.log("[Chat] Using mock token for session");
      }
      
      // Start the chat session with the persona
      console.log("[Chat] Starting Simli session with token");
      let sessionData;
      let sessionError = null;
      
      // Try up to 3 times to start the session
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await fetch("/api/simli/start-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              personaId,
              sessionToken: tokenData.sessionToken
            }),
          });
          
          const responseText = await response.text();
          console.log(`[Chat] Session start response (attempt ${attempt}/3):`, response.status, responseText.substring(0, 100));
          
          if (!response.ok) {
            if (attempt === 3) {
              sessionError = `Failed to start chat session: ${response.status} - ${responseText}`;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
            continue;
          }
          
          try {
            sessionData = JSON.parse(responseText);
            console.log("[Chat] Session data:", sessionData);
            
            // Break out of retry loop if successful
            if (sessionData.sessionId) {
              sessionError = null;
              break;
            } else {
              sessionError = "Failed to start chat session - missing sessionId";
            }
          } catch (e) {
            console.error(`[Chat] Error parsing JSON response (attempt ${attempt}/3):`, e);
            sessionError = "Invalid response from server - not valid JSON";
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, attempt * 500));
          }
        } catch (err) {
          console.error(`[Chat] Error starting session (attempt ${attempt}/3):`, err);
          sessionError = err instanceof Error ? err.message : "Unknown error starting session";
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
        }
      }
      
      // Check if we eventually got a session
      if (!sessionData?.sessionId) {
        throw new Error(sessionError || "Failed to start chat session after multiple attempts");
      }
      
      // Check if this is a fallback session
      const isFallbackSession = sessionData.fallback === true;
      if (isFallbackSession) {
        console.log("[Chat] Using fallback session mode");
      }
      
      setSessionId(sessionData.sessionId);
      setSimliData(sessionData);
      
      // Add the first message from the AI
      let greetingMessage = "Hello! How can I help you today?";
      
      // Use personalized greeting if available
      if (sessionData.greeting) {
        greetingMessage = sessionData.greeting;
      }
      
      setMessages([
        {
          id: "1",
          content: greetingMessage,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      
      // Initialize the Simli player only if we're not in a fallback session and not using a mock token
      if (!isFallbackSession && !isMockToken && containerRef.current && typeof window !== 'undefined' && window.SimliPlayer) {
        console.log("[Chat] Initializing Simli player with session ID:", sessionData.simliSessionId);
        
        const playerConfig = {
          container: containerRef.current,
          sessionId: sessionData.simliSessionId,
          sessionToken: tokenData.sessionToken,
          onMessage: (message: { text: string; }) => {
            console.log("[Chat] Received message from Simli:", message);
            // Add AI response when received from Simli
            const aiMessage: Message = {
              id: Date.now().toString(),
              content: message.text,
              sender: "ai" as const,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiMessage])
          },
          onError: (error: Error) => {
            console.error("[Chat] Simli player error:", error);
            // Don't show error to user, just log it - we'll fall back to API-based chat
            console.log("[Chat] Falling back to API-based chat due to player error");
          },
          onReady: () => {
            console.log("[Chat] Simli player ready");
            setLoading(false);
          }
        };
        
        console.log("[Chat] Player config:", {
          sessionId: sessionData.simliSessionId,
          hasToken: !!tokenData.sessionToken,
          hasContainer: !!containerRef.current
        });
        
        try {
          const player = await initSimliPlayer(playerConfig);
          
          if (player) {
            console.log("[Chat] Simli player initialized successfully");
            setSimliPlayer(player);
          } else {
            console.log("[Chat] Failed to initialize Simli player, using fallback");
            // Set loading to false since the Simli player won't trigger onReady
            setLoading(false);
          }
        } catch (playerError) {
          console.error("[Chat] Error initializing Simli player:", playerError);
          // Set loading to false since the Simli player won't trigger onReady
          setLoading(false);
        }
      } else {
        // We're not using the Simli player (fallback session, mock token, or missing dependencies)
        console.log("[Chat] Not initializing Simli player - using API-based chat instead");
        setLoading(false);
      }
    } catch (error) {
      console.error("[Chat] Error starting chat session:", error);
      setError("Failed to start chat session. Please try again.");
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    
    const currentInput = input
    setInput("")
    
    try {
      // If we have the Simli player and it's working, send directly to it
      if (simliPlayer) {
        try {
          setLoading(true)
          await simliPlayer.sendMessage(currentInput)
          setLoading(false)
          return // Success, exit early
        } catch (playerError) {
          console.error("[Chat] Error sending message to Simli player:", playerError);
          console.log("[Chat] Falling back to API approach");
          // Continue to API fallback
        }
      }
      
      // Fallback to the API approach
      setLoading(true)
      
      // Send message to API
      const response = await fetch("/api/session/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId,
          simliSessionId: simliData?.simliSessionId,
          simliToken
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }
      
      // Parse the response
      let data;
      try {
        const responseText = await response.text();
        console.log(`[Chat] Message API raw response: ${responseText.substring(0, 100)}...`);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[Chat] Error parsing API response:", parseError);
        throw new Error("Invalid JSON response from server");
      }
      
      console.log("[Chat] Message API response data:", data);
      
      // Extract message content from the response
      // This handles all possible message formats returned by the API
      let responseContent = "";
      
      if (data.message && typeof data.message === 'object' && data.message.content) {
        // Handle structure where message is an object with content field
        responseContent = data.message.content;
        console.log(`[Chat] Found response in data.message.content: "${responseContent.substring(0, 30)}..."`);
      } else if (data.content) {
        // Handle structure where content is directly in the data
        responseContent = data.content;
        console.log(`[Chat] Found response in data.content: "${responseContent.substring(0, 30)}..."`);
      } else if (data.simliData && (data.simliData.message || data.simliData.response || data.simliData.text)) {
        // Try to extract from simliData if present
        responseContent = data.simliData.message || data.simliData.response || data.simliData.text;
        console.log(`[Chat] Found response in data.simliData: "${responseContent.substring(0, 30)}..."`);
      } else if (typeof data.message === 'string') {
        // Handle case where message is a simple string
        responseContent = data.message;
        console.log(`[Chat] Found response in data.message (string): "${responseContent.substring(0, 30)}..."`);
      }
      
      // If no valid response content found, use a fallback
      if (!responseContent) {
        responseContent = "I've received your message. How can I assist you further?";
        console.log("[Chat] No valid response found, using fallback content");
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responseContent,
        sender: "ai",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("[Chat] Error sending message:", error)
      
      // Add a graceful error response from the AI
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm having trouble processing your message right now. Could you try again?",
        sender: "ai",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleARModeToggle = (enabled: boolean) => {
    if (enabled && containerRef.current && simliToken && simliData) {
      // Check if AR is enabled in environment
      const arEnabled = process.env.NEXT_PUBLIC_ENABLE_AR === 'true';
      
      if (!arEnabled) {
        // Show a message if AR is disabled in config
        setError("AR mode is disabled in the current environment configuration");
        return;
      }
      
      // In a real implementation, we would initialize AR mode with Simli
      // This would involve using device camera and AR capabilities
      
      // For demo purposes, just toggle the state
      setIsARMode(enabled);
      
      // Optional: You would reinitialize the Simli player with AR mode
      if (simliPlayer) {
        // First destroy existing player
        simliPlayer.destroy();
        
        // Then initialize in AR mode
        initSimliPlayer({
          container: containerRef.current,
          sessionId: simliData.sessionId,
          sessionToken: simliToken,
          mode: 'ar', // This would be the AR mode setting in a real implementation
          onMessage: (message: { text: string; }) => {
            // Add AI response when received from Simli
            const aiMessage: Message = {
              id: Date.now().toString(),
              content: message.text,
              sender: "ai" as const,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiMessage]);
          },
          onError: (error: Error) => {
            console.error("Simli AR player error:", error);
            setError("Error connecting to AR mode. Please try again.");
            setIsARMode(false);
          },
          onReady: () => {
            setLoading(false);
          }
        }).then(player => {
          if (player) {
            setSimliPlayer(player);
          } else {
            setError("Failed to initialize AR mode");
            setIsARMode(false);
          }
        });
      }
    } else {
      setIsARMode(false);
      
      // If we're switching back from AR mode, reinitialize the normal player
      if (simliPlayer && containerRef.current && simliToken && simliData) {
        // Destroy existing AR player
        simliPlayer.destroy();
        
        // Initialize regular player
        initSimliPlayer({
          container: containerRef.current,
          sessionId: simliData.sessionId,
          sessionToken: simliToken,
          onMessage: (message: { text: string; }) => {
            // Add AI response when received from Simli
            const aiMessage: Message = {
              id: Date.now().toString(),
              content: message.text,
              sender: "ai" as const,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiMessage]);
          },
          onError: (error: Error) => {
            console.error("Simli player error:", error);
            setError("Error connecting to AI avatar. Please try again.");
          },
          onReady: () => {
            setLoading(false);
          }
        }).then(player => setSimliPlayer(player));
      }
    }
  }
  
  // Check if AR is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator) {
      // @ts-ignore - XR API might not be fully typed
      navigator.xr?.isSessionSupported('immersive-ar')
        .then((supported: boolean) => setArSupported(supported))
        .catch(() => setArSupported(false))
    } else {
      setArSupported(false)
    }
  }, [])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={startChatSession} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Chat header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-xl font-semibold">Chat with {personaName}</h1>
        <p className="text-sm text-gray-500">AI-powered virtual spokesperson</p>
        
        <div className="mt-3">
          <ARModeToggle 
            isARMode={isARMode}
            onToggle={handleARModeToggle}
            disabled={!arSupported || loading}
          />
          {arSupported === false && (
            <p className="mt-1 text-xs text-amber-600">
              AR mode isn't supported on this device or browser.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area - For Simli avatar */}
        <div className={`${isARMode ? 'w-full' : 'w-1/2'} bg-gray-900 p-4 relative`}>
          {loading && !messages.length ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              <p className="ml-2 text-white">Loading avatar...</p>
            </div>
          ) : (
            <div 
              ref={containerRef} 
              className="h-full w-full rounded-lg bg-black"
            >
              {/* Add mock/fallback avatar when Simli Player isn't available */}
              {!simliPlayer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 mb-4 flex items-center justify-center">
                    <Bot size={64} className="text-white" />
                  </div>
                  <p className="text-white text-lg font-medium">{personaName}</p>
                  <p className="text-gray-300 text-sm mt-2">Chat mode active</p>
                  <p className="text-gray-400 text-xs mt-4 max-w-xs text-center">
                    The 3D avatar couldn't be loaded, but you can still chat with this AI assistant.
                  </p>
                </div>
              )}
              
              {isARMode && (
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black bg-opacity-50 p-3">
                  <p className="text-center text-sm text-white">
                    AR Mode {arSupported ? 'Active' : 'Not Supported'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className={`flex ${isARMode ? 'hidden' : 'w-1/2'} flex-col`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-pink-400 to-pink-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="mb-2 flex items-center gap-2">
                      <Bot size={16} className="text-pink-500" />
                      <span className="text-xs font-medium text-pink-500">{personaName}</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-right text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="min-h-[60px] resize-none border-gray-200 focus:border-pink-300 focus:ring-pink-300"
                  rows={1}
                  disabled={loading || !sessionId}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full" disabled={loading || !sessionId}>
                  <Paperclip size={18} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" disabled={loading || !sessionId}>
                  <ImageIcon size={18} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" disabled={loading || !sessionId}>
                  <Mic size={18} />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !sessionId}
                  className="rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:opacity-90"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
