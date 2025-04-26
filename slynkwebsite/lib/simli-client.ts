// Simli API client-side utilities

import { v4 as uuidv4 } from 'uuid';

interface SimliPlayerOptions {
  container: HTMLElement;
  sessionId: string;
  sessionToken: string;
  mode?: 'default' | 'ar';
  onMessage?: (message: { text: string }) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
}

interface SimliPlayer {
  destroy: () => void;
  sendMessage: (message: string) => Promise<void>;
}

declare global {
  interface Window {
    SimliPlayer?: {
      new(options: SimliPlayerOptions): SimliPlayer;
    };
  }
}

/**
 * Load the Simli SDK script
 * This will add the Simli SDK script to the page if it's not already loaded
 */
export const loadSimliSDK = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If the SDK is already loaded, resolve immediately
    if (typeof window !== 'undefined' && window.SimliPlayer) {
      console.log('Simli SDK already loaded');
      resolve(true);
      return;
    }

    // If we're in a non-browser environment, resolve with false
    if (typeof window === 'undefined') {
      console.log('Simli SDK cannot be loaded in non-browser environment');
      resolve(false);
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://cdn.simli.ai/player/latest/simli.js';
    script.async = true;
    script.onload = () => {
      console.log('Simli SDK loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Simli SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Request media permissions (camera and microphone)
 * This is needed for the Simli Player to work correctly
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    console.log('Media devices API not available');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // Stop all tracks to release the camera and microphone
    stream.getTracks().forEach((track) => track.stop());
    console.log('Media permissions granted');
    return true;
  } catch (error) {
    console.error('Media permissions denied:', error);
    return false;
  }
};

/**
 * Initialize the Simli Player
 * @param config Configuration for the Simli Player
 * @returns The Simli Player instance or null if it could not be initialized
 */
export const initSimliPlayer = async (config: {
  container: HTMLElement;
  sessionId: string;
  sessionToken: string;
  mode?: string;
  onMessage?: (message: { text: string }) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
}): Promise<any> => {
  // Check if SDK is loaded
  if (typeof window === 'undefined' || !window.SimliPlayer) {
    console.error('Simli SDK not loaded');
    if (config.onError) config.onError(new Error('Simli SDK not loaded'));
    return null;
  }

  try {
    console.log(`Initializing Simli Player with session ID: ${config.sessionId}`);
    
    // Create a timeout to ensure we don't wait forever for initialization
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Simli Player initialization timed out after 15 seconds'));
      }, 15000); // 15 second timeout
    });
    
    // Convert the sessionToken parameter to apiKey as per the updated API
    const playerConfig = {
      container: config.container,
      sessionId: config.sessionId,
      apiKey: config.sessionToken, // Updated from sessionToken to apiKey
      mode: config.mode || 'chat',
      onMessage: config.onMessage || (() => {}),
      onError: (error: Error) => {
        console.error('[SimliClient] Player error:', error);
        if (config.onError) config.onError(error);
      },
      onReady: () => {
        console.log('[SimliClient] Player ready');
        if (config.onReady) config.onReady();
      },
    };

    // Use a promise that resolves when the player is created
    const playerPromise = new Promise<any>((resolve) => {
      try {
        // Create new Simli Player instance
        // @ts-ignore - SimliPlayer may not be in the types
        const player = new window.SimliPlayer(playerConfig);
        
        console.log('[SimliClient] Player instance created');
        
        // Add a custom sendMessage method with error handling
        const originalSendMessage = player.sendMessage;
        player.sendMessage = async (message: string) => {
          try {
            console.log(`[SimliClient] Sending message: "${message.substring(0, 20)}..."`);
            await originalSendMessage.call(player, message);
            console.log('[SimliClient] Message sent successfully');
          } catch (error) {
            console.error('[SimliClient] Error sending message:', error);
            throw error;
          }
        };
        
        resolve(player);
      } catch (err) {
        console.error('[SimliClient] Error creating player instance:', err);
        resolve(null);
      }
    });

    // Race between the player creation and the timeout
    // This ensures we don't hang if there's an issue
    return Promise.race([playerPromise, timeoutPromise])
      .catch(error => {
        console.error('[SimliClient] Player initialization failed:', error);
        if (config.onError) config.onError(error instanceof Error ? error : new Error('Player initialization failed'));
        return null;
      });
  } catch (error) {
    console.error('[SimliClient] Failed to initialize Simli Player:', error);
    if (config.onError) config.onError(error instanceof Error ? error : new Error('Failed to initialize Simli Player'));
    return null;
  }
};

/**
 * Checks if a session token appears to be valid
 * @param token The session token to validate
 * @returns True if the token appears valid, false otherwise
 */
export const isValidSimliToken = (token: string | null | undefined): boolean => {
  if (!token) return false;
  
  // Check if it's a mock token
  if (token.startsWith('mock-token-') || token.startsWith('fallback-token-')) {
    return false;
  }
  
  // Basic check for Simli token format
  // Real Simli tokens should be reasonably long
  return token.length >= 32;
}; 