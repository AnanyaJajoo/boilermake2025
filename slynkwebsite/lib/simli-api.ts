/**
 * Simli API client for avatar/agent generation and management
 */

// Default face ID to use when a custom one isn't available
export const DEFAULT_FACE_ID = "tmp9i8bbq7c";

// Default Daily.co domain prefix for your organization
export const DEFAULT_DAILY_DOMAIN = "slynk.daily.co";

// Default Daily.co room to use as fallback
export const DEFAULT_DAILY_ROOM = "boilermake-demo";

/**
 * Helper function to get a valid Daily.co room URL that is known to exist
 * This avoids the "meeting does not exist" error when joining
 */
function getValidDailyRoomUrl(): string {
  // Return a known valid room URL from your Daily.co account
  // This should be a room that's already created in your Daily.co dashboard
  return `https://${DEFAULT_DAILY_DOMAIN}/${DEFAULT_DAILY_ROOM}`;
}

/**
 * Generate a face ID from an uploaded image
 * @param imageFile The image file to use for face generation
 * @param faceName Optional name for the face
 */
export async function generateFaceId(imageFile: File, faceName?: string): Promise<{
  faceId: string;
  isInQueue: boolean;
  originalResponse?: any;
}> {
  try {
    console.log(`Generating face ID for ${faceName || 'unnamed_persona'}, image size: ${Math.round(imageFile.size / 1024)}KB`);
    
    // Check image dimensions to avoid API errors
    const dimensions = await getImageDimensions(imageFile);
    if (dimensions.width < 512 || dimensions.height < 512) {
      throw new Error("Image must be at least 512x512 pixels");
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const apiKey = await getSimliApiKey();
    console.log("Got API key, requesting face generation...");
    
    // Use proper Simli API endpoint with face_name query parameter
    const response = await fetch(`https://api.simli.ai/generateFaceID?face_name=${faceName || 'custom_avatar'}`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        // Try to parse error as JSON if possible
        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
          if (parsedError.detail) {
            errorText = parsedError.detail;
          }
        } catch {
          // If not valid JSON, use the raw text
        }
      } catch (e) {
        errorText = 'No error details available';
      }
      
      console.error(`Face generation failed: ${response.status}`, errorText);
      throw new Error(`Failed to generate face ID: ${response.status} - ${errorText}`);
    }
    
    // Parse successful response
    const data = await response.json();
    console.log("Face generation successful, received:", data);
    
    // Check response format and extract face_id
    if (data.face_id) {
      return {
        faceId: data.face_id,
        isInQueue: false
      };
    }
    
    // Some Simli responses might indicate the face is in a processing queue
    if (data.message && data.message.includes("queue") && data.character_uid) {
      console.log("Face generation added to queue with character_uid:", data.character_uid);
      // CHANGE: Return the character_uid as faceId when in queue instead of DEFAULT_FACE_ID
      return {
        faceId: data.character_uid, // Use character_uid as the faceId
        isInQueue: true,
        originalResponse: data // Include original response for reference
      };
    }
    
    // Fallback if neither expected response format is found
    return {
      faceId: DEFAULT_FACE_ID,
      isInQueue: false,
      originalResponse: data
    };
  } catch (error) {
    console.error('Error generating face ID:', error);
    throw error;
  }
}

/**
 * Helper function to get image dimensions
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check the status of a face generation request
 * @param characterUid The character_uid from face generation
 */
export async function checkFaceGenerationStatus(characterUid: string): Promise<{
  status: string;
  isReady: boolean;
  faceId?: string;
  message?: string;
  failed?: boolean;
}> {
  try {
    console.log(`Checking face generation status for character_uid: ${characterUid}`);
    const apiKey = await getSimliApiKey();
    
    // For character_uid format, we need to use a different endpoint
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(characterUid);
    
    if (!isUuid) {
      console.log("Not a character_uid format, assuming face is ready");
      return {
        status: "ready",
        isReady: true,
        faceId: characterUid,
        message: "Face ID is ready to use"
      };
    }
    
    // Use the getRequestStatus endpoint with character_uid parameter
    // Note: The API appears to ignore the character_uid and returns the latest request status
    const response = await fetch(`https://api.simli.ai/getRequestStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        character_uid: characterUid
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to check face status: ${response.status}`, errorText);
      
      // If we get here, assume the face is still processing
      return {
        status: "processing",
        isReady: false,
        faceId: characterUid, // Keep the character_uid as the faceId
        message: "Face generation is being processed. This typically takes 1-3 minutes."
      };
    }
    
    const data = await response.json();
    console.log("Face generation status:", data);
    
    // Extract relevant status information
    const status = data.status || "processing";
    // Check if the status indicates a failure
    const failed = status === "failed";
    // A face is ready only if completed/ready and not failed
    const isReady = (status === "completed" || status === "ready") && !failed;
    
    // Check if the face_id in the response matches our character_uid
    // If not, we'll still use the character_uid since the API might return the most recent request
    let faceId = data.face_id;
    
    // If status is completed but the face_id doesn't match our character_uid,
    // this might be a response for a different request
    if (faceId && faceId !== characterUid && isReady) {
      console.log(`API returned face_id ${faceId} which differs from our character_uid ${characterUid}`);
      
      // If we want to be cautious, we could go with the API-provided ID
      faceId = data.face_id;
    } else if (!faceId && isReady) {
      // If no face_id is provided but status is ready, use our characterUid
      faceId = characterUid;
    } else {
      // Default case - either not ready or the IDs match
      faceId = data.face_id || characterUid;
    }
    
    return {
      status,
      isReady,
      faceId,
      failed,
      message: failed ? 
        "Face generation failed. You can try again with a different image." : 
        (data.message || `Face generation ${status}`)
    };
  } catch (error) {
    console.error('Error checking face status:', error);
    
    // Even if there's an error, we don't want to break the UI flow
    // Return a sensible default that keeps the character_uid
    return {
      status: "processing",
      isReady: false,
      faceId: characterUid,
      message: "Checking face status... Please wait while your face is being processed."
    };
  }
}

/**
 * Create a Simli agent with customized settings
 * This uses the official Simli /agent endpoint
 * @param agentData The agent data and configuration
 */
export async function createSimliAgent(agentData: {
  faceId: string;
  name: string;
  firstMessage?: string;
  prompt?: string;
  voiceProvider?: 'elevenlabs' | 'cartesia';
  voiceId?: string;
  voiceModel?: string;
  language?: string;
  llmModel?: string;
  llmEndpoint?: string;
  maxIdleTime?: number;
  maxSessionLength?: number;
}): Promise<{
  id: string;
  faceId: string;
  name: string;
  [key: string]: any;
}> {
  try {
    console.log(`Creating Simli agent for ${agentData.name} with face ID: ${agentData.faceId}`);
    const apiKey = await getSimliApiKey();
    
    // Check if the faceId is a UUID (character_uid format from queue)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentData.faceId);
    
    if (isUuid) {
      console.log(`Using character_uid directly for agent creation: ${agentData.faceId}`);
    }
    
    // Prepare the request body using Simli's API schema
    const requestBody = {
      // When using a character_uid, use the character_uid parameter instead of face_id
      ...(isUuid ? { character_uid: agentData.faceId } : { face_id: agentData.faceId }),
      name: agentData.name,
      first_message: agentData.firstMessage || `Hello, I'm ${agentData.name}. How can I help you today?`,
      prompt: agentData.prompt || `You are a helpful assistant named ${agentData.name}.`,
      voice_provider: agentData.voiceProvider || 'cartesia',
      voice_id: agentData.voiceId,
      voice_model: agentData.voiceModel || 'sonic-english',
      language: agentData.language || 'en',
      llm_model: agentData.llmModel || 'gpt-4o-mini',
      llm_endpoint: agentData.llmEndpoint,
      max_idle_time: agentData.maxIdleTime || 300,
      max_session_length: agentData.maxSessionLength || 3600
    };
    
    console.log("Agent creation request:", JSON.stringify(requestBody));
    
    const response = await fetch('https://api.simli.ai/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-simli-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agent creation failed: ${response.status}`, errorText);
      
      // If we got an error with a character_uid, try the alternative character agent endpoint
      if (isUuid) {
        console.log("Attempting alternative agent creation approach for character_uid...");
        
        const characterAgentResponse = await fetch('https://api.simli.ai/character-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-simli-api-key': apiKey,
          },
          body: JSON.stringify({
            character_uid: agentData.faceId,
            name: agentData.name,
            first_message: agentData.firstMessage || `Hello, I'm ${agentData.name}. How can I help you today?`,
            prompt: agentData.prompt || `You are a helpful assistant named ${agentData.name}.`,
            voice_provider: agentData.voiceProvider || 'cartesia',
            voice_id: agentData.voiceId,
            voice_model: agentData.voiceModel || 'sonic-english',
            language: agentData.language || 'en',
            llm_model: agentData.llmModel || 'gpt-4o-mini',
          }),
        });
        
        if (!characterAgentResponse.ok) {
          const altErrorText = await characterAgentResponse.text();
          console.error(`Alternative agent creation failed: ${characterAgentResponse.status}`, altErrorText);
          throw new Error(`Failed to create agent: ${response.status} - ${errorText}`);
        }
        
        const altData = await characterAgentResponse.json();
        console.log("Character agent created successfully:", altData);
        return {
          ...altData,
          originalCharacterId: agentData.faceId
        };
      }
      
      throw new Error(`Failed to create agent: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Agent created successfully:", data);
    
    // Store original character_uid for reference if this was created with a character_uid
    if (isUuid) {
      data.originalCharacterId = agentData.faceId;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
}

/**
 * Generate a preview video of the agent speaking
 * @param text The text for the agent to speak
 * @param faceId The face ID to use
 * @param voiceId Optional voice ID to use (ElevenLabs voice ID)
 * @param ttsAPIKey Optional ElevenLabs API key for voice customization
 */
export async function generateVideoPreview(text: string, faceId: string, voiceId?: string, ttsAPIKey?: string): Promise<{
  hlsUrl: string;
  mp4Url: string;
}> {
  try {
    console.log(`Generating video preview for face ID: ${faceId}, text: "${text.substring(0, 30)}..."${voiceId ? `, ElevenLabs voice: ${voiceId}` : ''}${ttsAPIKey ? ', with ElevenLabs API key' : ''}`);
    const apiKey = await getSimliApiKey();
    
    // Check if the faceId is a UUID (character_uid format from queue)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(faceId);
    
    if (isUuid) {
      console.log(`Using character_uid directly for preview generation: ${faceId}`);
    }
    
    // Based on Simli API documentation, for ElevenLabs we use different parameters
    const requestBody = {
      simliAPIKey: apiKey,
      faceId: faceId,
      // Include ElevenLabs API key if provided
      ...(ttsAPIKey ? { ttsAPIKey: ttsAPIKey } : {}),
      requestBody: {
        audioProvider: 'ElevenLabs', // Use ElevenLabs instead of Cartesia
        text: text,
        // If we have a voiceId, use it as voiceName for ElevenLabs
        ...(voiceId ? { 
          voiceName: voiceId,
          model_id: "eleven_turbo_v2" // Use the latest model from ElevenLabs
        } : {})
      }
    };
    
    console.log("Video preview request:", JSON.stringify(requestBody));
    
    try {
      const response = await fetch('https://api.simli.ai/textToVideoStream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Video preview generated successfully:", data);
        return {
          hlsUrl: data.hls_url,
          mp4Url: data.mp4_url,
        };
      }
      
      // If the first request fails, try with character_uid endpoint for UUID faces
      if (isUuid) {
        console.log("Attempting alternative video generation approach for character_uid...");
        
        const altRequestBody = {
          simliAPIKey: apiKey,
          character_uid: faceId,
          // Include ElevenLabs API key if provided
          ...(ttsAPIKey ? { ttsAPIKey: ttsAPIKey } : {}),
          requestBody: {
            audioProvider: 'ElevenLabs', // Use ElevenLabs
            text: text,
            ...(voiceId ? { 
              voiceName: voiceId,
              model_id: "eleven_turbo_v2"
            } : {})
          }
        };
        
        console.log("Alternative request:", JSON.stringify(altRequestBody));
        
        const altResponse = await fetch('https://api.simli.ai/characterToVideoStream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(altRequestBody),
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log("Alternative video preview generated successfully:", altData);
          return {
            hlsUrl: altData.hls_url,
            mp4Url: altData.mp4_url,
          };
        }
        
        const altErrorText = await altResponse.text();
        console.error(`Alternative video generation failed: ${altResponse.status}`, altErrorText);
        
        // If both approaches fail, try once more without voice ID as a last resort
        console.log("Trying one last time without voice specification");
        
        const fallbackRequestBody = {
          simliAPIKey: apiKey,
          character_uid: faceId,
          requestBody: {
            audioProvider: 'Cartesia', // Fall back to Cartesia as last resort
            text: text
          }
        };
        
        console.log("Fallback request:", JSON.stringify(fallbackRequestBody));
        
        const fallbackResponse = await fetch('https://api.simli.ai/characterToVideoStream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackRequestBody),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log("Fallback video preview generated successfully (without voice):", fallbackData);
          console.log("Note: Voice selection was ignored due to API limitations");
          return {
            hlsUrl: fallbackData.hls_url,
            mp4Url: fallbackData.mp4_url,
          };
        }
        
        const fallbackErrorText = await fallbackResponse.text();
        console.error(`All attempts failed. Final error: ${fallbackResponse.status}`, fallbackErrorText);
        throw new Error(`Failed to generate video preview: ${altResponse.status} - ${altErrorText}`);
      }
      
      // For non-UUID faces, if the first attempt fails, try without voice
      const errorText = await response.text();
      console.error(`Video preview generation failed: ${response.status}`, errorText);
      
      if (voiceId) {
        console.log("Trying without voice specification as fallback");
        
        const fallbackRequestBody = {
          simliAPIKey: apiKey,
          faceId: faceId,
          requestBody: {
            audioProvider: 'Cartesia', // Fall back to Cartesia
            text: text
          }
        };
        
        console.log("Fallback request:", JSON.stringify(fallbackRequestBody));
        
        const fallbackResponse = await fetch('https://api.simli.ai/textToVideoStream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackRequestBody),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log("Fallback video preview generated successfully (without voice):", fallbackData);
          console.log("Note: Voice selection was ignored due to API limitations");
          return {
            hlsUrl: fallbackData.hls_url,
            mp4Url: fallbackData.mp4_url,
          };
        }
        
        const fallbackErrorText = await fallbackResponse.text();
        console.error(`Fallback attempt failed: ${fallbackResponse.status}`, fallbackErrorText);
      }
      
      throw new Error(`Failed to generate video preview: ${response.status} - ${errorText}`);
    } catch (error) {
      console.error('Error in video preview request:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating video preview:', error);
    throw error;
  }
}

/**
 * Start a live E2E session with the agent
 * @param config Session configuration
 */
export async function startE2ESession(config: {
  apiKey: string;
  faceId: string;
  systemPrompt: string;
  firstMessage: string;
}): Promise<{
  roomUrl: string;
  sessionId: string;
}> {
  try {
    console.log(`Starting E2E session with face ID: ${config.faceId}`);
    console.log(`System prompt: "${config.systemPrompt.substring(0, 50)}..."`);
    console.log(`First message: "${config.firstMessage}"`);
    
    // Check if we have a valid API key - if not, return a mock session
    if (!config.apiKey || config.apiKey.startsWith('mock-token-') || config.apiKey.startsWith('fallback-token-')) {
      console.log("Using mock session data due to missing or invalid API key");
      // Use a valid Daily.co room URL that is known to exist
      return {
        roomUrl: getValidDailyRoomUrl(),
        sessionId: `mock-session-${Date.now()}`
      };
    }
    
    const requestBody = {
      apiKey: config.apiKey,
      faceId: config.faceId,
      systemPrompt: config.systemPrompt,
      firstMessage: config.firstMessage,
      createTranscript: true,
      ttsProvider: "Cartesia", // Ensure we specify a TTS provider
      ttsModel: "sonic-turbo-2025-03-07", // Use a specific newer model
      voiceId: "a167e0f3-df7e-4d52-a9c3-f949145efdab", // Specific voice ID
      language: "en", // Specify language
      llmModel: "gpt-4o-mini" // Specify LLM model
    };
    
    const response = await fetch('https://api.simli.ai/startE2ESession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to start session: ${response.status} - ${errorText}`);
      
      // Return a working Daily.co URL in case of API error
      return {
        roomUrl: getValidDailyRoomUrl(),
        sessionId: `error-session-${Date.now()}`
      };
    }
    
    const data = await response.json();
    console.log("Simli E2E session response:", data);
    
    // Check for roomUrl (camelCase) or room_url (snake_case)
    const roomUrl = data.roomUrl || data.room_url;
    const sessionId = data.sessionId || data.session_id;
    
    // Validate the response shape and provide fallbacks with working Daily.co URLs
    if (!roomUrl || !roomUrl.includes('daily.co')) {
      console.warn("Invalid or missing room URL in Simli response, using fallback Daily.co URL");
      return {
        roomUrl: getValidDailyRoomUrl(),
        sessionId: sessionId || `fallback-session-${Date.now()}`,
      };
    }
    
    // Verify this room actually exists - this could be done better with a Daily.co API call
    // but for simplicity we'll use the URL directly if it appears to be valid
    return {
      roomUrl: roomUrl,
      sessionId: sessionId || `session-${Date.now()}`,
    };
  } catch (error) {
    console.error('Error starting E2E session:', error);
    
    // Return a working Daily.co URL in case of any error
    return {
      roomUrl: getValidDailyRoomUrl(),
      sessionId: `exception-session-${Date.now()}`
    };
  }
}

/**
 * Get available faces from the Simli API
 */
export async function getAvailableFaces(): Promise<string[]> {
  // This is a placeholder - Simli currently doesn't have a public API to list faces
  // In practice, you'd store faces that your users have generated
  return [
    DEFAULT_FACE_ID,
    // Add other face IDs here
  ];
}

/**
 * Get the Simli API key from environment variables
 */
async function getSimliApiKey(): Promise<string> {
  // On the server side, we can access the environment variable directly
  if (typeof window === 'undefined' && process.env.SIMLI_API_KEY) {
    return process.env.SIMLI_API_KEY;
  }
  
  // On the client side, we need to fetch it from the API
  try {
    console.log("Fetching Simli API key from server...");
    const response = await fetch('/api/simli/create-session-token');
    if (!response.ok) {
      throw new Error(`Failed to get API key: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.simliApiKey) {
      console.log("Successfully retrieved Simli API key");
      return data.simliApiKey;
    }
    
    if (data.sessionToken) { // Backwards compatibility
      console.log("Retrieved session token (legacy format)");
      return data.sessionToken;
    }
    
    throw new Error("API key not found in response");
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw new Error('No Simli API key available');
  }
}

// Legacy function for backward compatibility
export async function createAgent(agentData: {
  faceId: string;
  name: string;
  firstMessage: string;
  prompt: string;
  voiceProvider?: 'elevenlabs' | 'cartesia';
  voiceId?: string;
}): Promise<string> {
  try {
    // Use the new createSimliAgent function
    const agent = await createSimliAgent(agentData);
    return agent.id;
  } catch (error) {
    console.error('Error in legacy createAgent:', error);
    throw error;
  }
} 