import React, { useRef, useState, useEffect, KeyboardEvent } from "react";
import { DailyProvider, useDaily } from "@daily-co/daily-react";
import Daily, { DailyCall } from "@daily-co/daily-js";
import { RecoilRoot } from "recoil";
import VideoBox from "@/components/ui/VideoBox";
import { cn } from "@/lib/utils";
import { DEFAULT_FACE_ID, startE2ESession } from "@/lib/simli-api";
import { Mic, MicOff, Send, Volume2, VolumeX, RefreshCw } from "lucide-react";

// Global reference to prevent duplicate instances
let globalCallObject: DailyCall | null = null;

// Setup Speech Recognition with browser compatibility - using type assertions to avoid TypeScript errors
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SpeechGrammarListAPI = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;

// Add this Hark audio detection library (inlined to avoid dependencies)
const hark = function(stream: MediaStream, options: any) {
  const analyser = (window as any).audioContext.createAnalyser();
  const streamNode = (window as any).audioContext.createMediaStreamSource(stream);
  streamNode.connect(analyser);
  
  options = options || {};
  
  const harker = {
    speaking: false,
    state: 'stopped',
    threshold: options.threshold || -65,
    interval: options.interval || 100,
    events: {},
    speakingHistory: [],
    start: function() {
      harker.state = 'running';
      harker.looper();
      return harker;
    },
    stop: function() {
      harker.state = 'stopped';
      return harker;
    },
    on: function(event: string, callback: Function) {
      harker.events[event] = callback;
      return harker;
    },
    off: function(event: string) {
      delete harker.events[event];
      return harker;
    },
    looper: function() {
      if (harker.state === 'stopped') return;
      
      setTimeout(() => {
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] - 128) / 128;
          sumSquares += val * val;
        }
        
        const rms = Math.sqrt(sumSquares / bufferLength);
        const db = 20 * Math.log10(rms);
        
        // Update speaking history
        harker.speakingHistory.push(db);
        if (harker.speakingHistory.length > 10) {
          harker.speakingHistory.shift();
        }
        
        // Get average volume
        const avgDb = harker.speakingHistory.reduce((a, b) => a + b, 0) / harker.speakingHistory.length;
        
        // Check if speaking
        const speaking = avgDb > harker.threshold;
        
        if (speaking && !harker.speaking) {
          harker.speaking = true;
          if (harker.events.speaking) harker.events.speaking(stream, avgDb);
        } else if (!speaking && harker.speaking) {
          harker.speaking = false;
          if (harker.events.stopped_speaking) harker.events.stopped_speaking(stream, avgDb);
        }
        
        if (harker.events.volume_change) harker.events.volume_change(avgDb, harker.threshold);
        
        harker.looper();
      }, harker.interval);
    }
  };
  
  return harker.start();
};

interface SimliAgentProps {
  personaId: string;
  personaData: {
    name: string;
    systemPrompt: string;
    firstMessage: string;
    faceId?: string; // Optional face ID from the persona
  };
  onStart?: () => void;
  onClose?: () => void;
}

// Component to handle video rendering with Daily context
const VideoComponent = ({ id, name }: { id: string; name: string }) => {
  const daily = useDaily();
  
  useEffect(() => {
    console.log("VideoComponent mounted for ID:", id);
    console.log("Daily object available:", !!daily);
    
    // Log all participants for debugging
    if (daily) {
      const participants = daily.participants();
      console.log("All participants:", participants);
      console.log("Looking for participant with ID:", id);
      console.log("Found participant:", participants[id]);
    }
  }, [daily, id]);
  
  return (
    <div className="rounded-xl overflow-hidden h-[400px] w-full bg-gradient-to-b from-gray-900 to-black relative shadow-inner">
      <VideoBox id={id} />
      <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 text-xs rounded-full backdrop-blur-sm">
        {name}
      </div>
    </div>
  );
};

const SimliAgent: React.FC<SimliAgentProps> = ({ 
  personaId, 
  personaData, 
  onStart = () => {}, 
  onClose = () => {} 
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const myCallObjRef = useRef<DailyCall | null>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{speaker: string, text: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Audio setup
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Speech recognition refs
  const recognitionRef = useRef<any>(null);
  const avatarAudioStreamRef = useRef<MediaStream | null>(null);
  const avatarAudioContextRef = useRef<AudioContext | null>(null);
  const isRecognizingRef = useRef<boolean>(false);
  const [isListeningToAvatar, setIsListeningToAvatar] = useState<boolean>(false);
  const harkInstanceRef = useRef<any>(null);
  const lastAvatarSpeechRef = useRef<string>("");
  const lastTranscriptRequestRef = useRef<number>(0);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState<boolean>(false);
  
  // New state for waiting for API response
  const [waitingForSimliResponse, setWaitingForSimliResponse] = useState<boolean>(false);
  
  // New pending transcript ref to accumulate potential text
  const pendingTranscriptRef = useRef<string>("");
  
  // Define a global filter patterns list for consistency
  const commandFilterPatterns = [
    "get-transcript", 
    "getTranscript", 
    "Please send transcript", 
    "get_transcript", 
    "get-latest-response",
    "get_latest_response", 
    "request-transcript", 
    "transcript-request",
    "get_response",
    "get-response",
    "get-agent-response",
    "get_agent_response",
    "get_last_utterance",
    "action:"
  ];

  // Init audio context on first interaction
  const initAudio = () => {
    if (!audioContext) {
      try {
        // Create audio context
        const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(newAudioContext);
        addDebugInfo(`Audio context initialized: ${newAudioContext.state}`);
        
        // Create audio element if it doesn't exist
        if (!audioElementRef.current) {
          const audioEl = new Audio();
          audioEl.autoplay = true;
          audioEl.controls = false;
          audioEl.volume = 1.0;
          audioEl.muted = false;
          
          // Add to DOM to ensure it works in some browsers
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
          
          // Create a dummy buffer to play to initialize audio
          const buffer = newAudioContext.createBuffer(1, 1, 22050);
          const source = newAudioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(newAudioContext.destination);
          source.start();
          
          audioElementRef.current = audioEl;
          addDebugInfo("Audio element created and initialized");
        }
        
        // Resume audio context to allow audio playback
        if (newAudioContext.state === 'suspended') {
          newAudioContext.resume().then(() => {
            addDebugInfo("AudioContext resumed");
          });
        }
        
        // Test audio with a quick beep to validate audio setup
        const oscillator = newAudioContext.createOscillator();
        const gainNode = newAudioContext.createGain();
        
        oscillator.type = "sine";
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.value = 0.1; // Low volume
        
        oscillator.connect(gainNode);
        gainNode.connect(newAudioContext.destination);
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          addDebugInfo("Audio test beep played");
        }, 200);
        
      } catch (err) {
        console.error("Error initializing audio:", err);
        addDebugInfo(`Audio initialization error: ${err}`);
      }
    } else if (audioContext.state === 'suspended') {
      // If context exists but is suspended, try to resume it
      audioContext.resume().then(() => {
        addDebugInfo("Existing AudioContext resumed");
      });
    }
  };

  // Add debug logging
  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${message}`);
  };

  // Clean up Daily instance and intervals on unmount
  useEffect(() => {
    return () => {
      // Clean up on component unmount
      if (myCallObjRef.current) {
        addDebugInfo("Component unmounting - cleaning up Daily instance");
        myCallObjRef.current.leave().then(() => {
          myCallObjRef.current?.destroy();
          myCallObjRef.current = null;
          
          // Reset global reference if it's our instance
          if (globalCallObject === myCallObjRef.current) {
            globalCallObject = null;
          }
        }).catch(err => {
          console.error("Error leaving Daily call on unmount:", err);
        });
      }
      
      // Clean up audio context
      if (audioContext) {
        audioContext.close().catch(e => console.error("Error closing audio context:", e));
      }
      
      // Clear audio check interval
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      
      // Clean up speech recognition
      cleanupAvatarSpeechRecognition();
    };
  }, [audioContext]);

  // Function to ensure clean Daily state before starting
  const cleanupExistingDaily = async () => {
    // If there's a global instance, clean it up first
    if (globalCallObject) {
      addDebugInfo("Cleaning up existing Daily instance");
      try {
        // Always try to leave the call, catch any errors
        try {
          await globalCallObject.leave();
        } catch (e) {
          console.log("Error leaving call, may already be disconnected:", e);
        }

        // Always destroy the call object
        globalCallObject.destroy();
        globalCallObject = null;
      } catch (error) {
        console.error("Error cleaning up existing Daily instance:", error);
      }
    }
  };
  
  // Enhanced avatar speech detection
  const setupAvatarAudioMonitoring = () => {
    if (!callObject || !chatbotId) {
      addDebugInfo("Cannot set up audio monitoring: missing dependencies");
      return;
    }

    try {
      // Get the avatar's audio track
      const participants = callObject.participants();
      const chatbot = Object.values(participants).find(
        (p: any) => p.user_name === 'Chatbot'
      );
      
      if (!chatbot) {
        addDebugInfo("Chatbot participant not found for audio monitoring");
        return;
      }
      
      const audioTrack = chatbot.tracks?.audio?.track;
      if (!audioTrack) {
        addDebugInfo("No audio track found for audio monitoring");
        return;
      }
      
      addDebugInfo("Setting up advanced audio monitoring for avatar");
      
      // Create a MediaStream from the audio track
      const avatarStream = new MediaStream([audioTrack]);
      avatarAudioStreamRef.current = avatarStream;
      
      if (!window.audioContext) {
        (window as any).audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Create audio monitoring instance with hark
      const options = {
        threshold: -70,  // Lower threshold to detect softer speech
        interval: 100    // Check every 100ms
      };
      
      const speechEvents = hark(avatarStream, options);
      
      speechEvents.on('speaking', () => {
        addDebugInfo("Avatar speaking detected");
        setIsAvatarSpeaking(true);
        setIsProcessing(true);
        setWaitingForSimliResponse(true);
        
        // Schedule transcription requests, but avoid flooding
        if (Date.now() - lastTranscriptRequestRef.current > 2000) {
          requestMultipleTranscripts();
          lastTranscriptRequestRef.current = Date.now();
        }
      });
      
      speechEvents.on('stopped_speaking', () => {
        addDebugInfo("Avatar speaking stopped");
        setIsAvatarSpeaking(false);
        
        // When speech stops, try to get the transcript with a slight delay
        setTimeout(() => {
          requestMultipleTranscripts();
          lastTranscriptRequestRef.current = Date.now();
          
          // Add another delayed request to catch any lag in the API
          setTimeout(() => {
            requestDirectResponse();
          }, 1000);
        }, 500);
      });
      
      harkInstanceRef.current = speechEvents;
      
      // Reset the standard speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          addDebugInfo(`Error stopping speech recognition: ${e}`);
        }
      }
      
      // Setup direct audio capture with speech recognition fallback
      setupCombinedTranscriptionSystem();
      
    } catch (error) {
      addDebugInfo(`Error setting up avatar audio monitoring: ${error}`);
    }
  };

  // Combine multiple transcription approaches
  const setupCombinedTranscriptionSystem = () => {
    // 1. Set up event listeners for Simli messages
    if (callObject) {
      callObject.on('app-message', (event: any) => {
        if (!event || !event.data) return;
        
        try {
          // Log the full message data periodically for debugging
          if (Math.random() < 0.1) { // Only log ~10% of messages to avoid spam
            console.log('Message data sample:', event);
          }
          
          // Extract any useful text from the message
          const extractedText = extractTextFromMessage(event.data);
          if (extractedText && extractedText.trim() !== "") {
            addPotentialTranscript(extractedText);
          }
        } catch (err) {
          console.error("Error processing app message:", err);
        }
      });
    }
    
    // 2. Try browser's speech recognition if available
    if (SpeechRecognitionAPI) {
      setupAvatarSpeechRecognition();
    }
  };

  // Extract any text from various message formats
  const extractTextFromMessage = (data: any): string | null => {
    if (!data) return null;
    
    // Skip messages that are likely internal command messages    
    // Check for command messages before processing
    if (data.type && typeof data.type === 'string') {
      const typeLC = data.type.toLowerCase();
      if (typeLC === 'get-transcript' || 
          typeLC === 'request-transcript' || 
          typeLC === 'transcript-request' ||
          typeLC === 'get-latest-response' ||
          typeLC === 'avatar-speech' || 
          typeLC === 'get-agent-response') {
        // This is a command message, not actual content
        return null;
      }
    }

    // Check for action fields that indicate this is a command
    if (data.action && typeof data.action === 'string') {
      return null; // Any message with an action field is likely a command
    }
    
    // Direct text properties
    if (typeof data.text === 'string' && data.text.trim() !== "") {
      // Skip if it matches a command pattern
      if (commandFilterPatterns.some(pattern => data.text.toLowerCase().includes(pattern.toLowerCase()))) {
        return null;
      }
      return data.text;
    }
    
    if (typeof data.message === 'string' && data.message.trim() !== "") {
      // Skip if it matches a command pattern
      if (commandFilterPatterns.some(pattern => data.message.toLowerCase().includes(pattern.toLowerCase()))) {
        return null;
      }
      return data.message;
    }
    
    if (typeof data.transcript === 'string' && data.transcript.trim() !== "") {
      if (commandFilterPatterns.some(pattern => data.transcript.toLowerCase().includes(pattern.toLowerCase()))) {
        return null;
      }
      return data.transcript;
    }
    
    if (typeof data.content === 'string' && data.content.trim() !== "") {
      if (commandFilterPatterns.some(pattern => data.content.toLowerCase().includes(pattern.toLowerCase()))) {
        return null;
      }
      return data.content;
    }
    
    // Response objects
    if (data.response) {
      if (typeof data.response === 'string') {
        // Skip if it matches a command pattern
        if (commandFilterPatterns.some(pattern => data.response.toLowerCase().includes(pattern.toLowerCase()))) {
          return null;
        }
        return data.response;
      }
      
      if (typeof data.response === 'object') {
        if (data.response.text && !commandFilterPatterns.some(pattern => data.response.text.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.response.text;
        
        if (data.response.message && !commandFilterPatterns.some(pattern => data.response.message.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.response.message;
        
        if (data.response.content && !commandFilterPatterns.some(pattern => data.response.content.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.response.content;
      }
    }
    
    // Nested data
    if (data.data) {
      return extractTextFromMessage(data.data);
    }
    
    // Check for any string property that might contain transcript
    for (const key in data) {
      if (typeof data[key] === 'string' && 
          data[key].length > 10 && 
          key !== 'type' && 
          key !== 'trackType' &&
          key !== 'action') {
        
        // Skip if it matches a command pattern
        if (commandFilterPatterns.some(pattern => data[key].toLowerCase().includes(pattern.toLowerCase()))) {
          continue;
        }
        
        return data[key];
      }
    }
    
    return null;
  };

  // Add potential transcript text with deduplication
  const addPotentialTranscript = (text: string) => {
    if (!text || text.trim() === "") return;
    
    // Don't add very short fragments
    if (text.length < 5) return;
    
    // Skip if the text matches any of our filter patterns
    if (commandFilterPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))) {
      addDebugInfo(`Skipping command message: ${text}`);
      return;
    }
    
    // Skip if this is just an echo of what the user just said
    if (transcript.length > 0 && 
        transcript[transcript.length - 1].speaker === 'You' && 
        (transcript[transcript.length - 1].text === text || 
         similarity(transcript[transcript.length - 1].text, text) > 0.8)) {
      addDebugInfo(`Skipping echo of user input: ${text.substring(0, 30)}...`);
      return;
    }
    
    // Check for duplicates by comparing with last added text
    if (lastAvatarSpeechRef.current === text) return;
    
    // Add to pending transcript
    pendingTranscriptRef.current = text;
    
    // Add to transcript after a short delay to allow for potential better versions
    setTimeout(() => {
      if (pendingTranscriptRef.current === text) {
        const speaker = personaData.name;
        addDebugInfo(`Adding actual avatar transcript: ${text.substring(0, 30)}...`);
        
        setTranscript(prev => {
          // Skip if already in transcript
          if (prev.length > 0 && 
              prev[prev.length - 1].speaker === speaker && 
              prev[prev.length - 1].text === text) {
            return prev;
          }
          
          // Update last added text
          lastAvatarSpeechRef.current = text;
          setIsProcessing(false);
          setWaitingForSimliResponse(false);
          
          return [...prev, { speaker, text }];
        });
        
        // Clear pending transcript
        pendingTranscriptRef.current = "";
      }
    }, 300);
  };

  // Helper function to check text similarity for better echo detection
  const similarity = (s1: string, s2: string): number => {
    // Convert to lowercase for case-insensitive comparison
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    
    // If either string is empty, return 0
    if (a.length === 0 || b.length === 0) return 0;
    
    // If strings are identical, return 1
    if (a === b) return 1;
    
    // If one string contains the other, it's likely an echo
    if (a.includes(b) || b.includes(a)) return 0.9;
    
    // Count matching words
    const aWords = a.split(/\s+/);
    const bWords = b.split(/\s+/);
    
    let matches = 0;
    for (const word of aWords) {
      if (word.length > 3 && bWords.includes(word)) {
        matches++;
      }
    }
    
    // Return a similarity score based on matching words
    return matches / Math.max(aWords.length, bWords.length);
  };

  // Request transcripts using multiple methods
  const requestMultipleTranscripts = () => {
    if (!callObject || !chatbotId) return;
    
    // Only send messages if call has been joined
    if (callObject.participants() && Object.keys(callObject.participants()).length > 0) {
      addDebugInfo("Multiple transcript requests sent");
      
      // 1. Try standard transcript request
      try {
        callObject.sendAppMessage({
          type: 'get-transcript',
          action: 'get_transcript'
        }, chatbotId);
        addDebugInfo("Sent request type: get-transcript");
      } catch (e) {
        addDebugInfo(`Error sending transcript request: ${e}`);
      }
      
      // 2. Try to get the latest response
      try {
        callObject.sendAppMessage({
          type: 'get-latest-response',
          action: 'get_latest_response'
        }, chatbotId);
        addDebugInfo("Sent request type: get-latest-response");
      } catch (e) {
        addDebugInfo(`Error sending latest response request: ${e}`);
      }
      
      // 3. Try request-transcript format
      try {
        callObject.sendAppMessage({
          type: 'request-transcript',
          text: 'getTranscript'
        }, chatbotId);
        addDebugInfo("Sent request type: request-transcript");
      } catch (e) {
        addDebugInfo(`Error sending request-transcript: ${e}`);
      }
      
      // 4. Try transcript-request format
      try {
        callObject.sendAppMessage({
          type: 'transcript-request',
          message: 'Please send transcript'
        }, chatbotId);
        addDebugInfo("Sent request type: transcript-request");
      } catch (e) {
        addDebugInfo(`Error sending transcript-request: ${e}`);
      }
      
      // Mark that we're waiting for a response
      setWaitingForSimliResponse(true);
    } else {
      addDebugInfo("Not sending transcript requests - call not joined yet");
    }
  };

  // Modified send message function to mark that we're waiting for a response
  const sendMessage = async () => {
    if (!message.trim() || !callObject || !chatbotId || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Add user message to transcript
      const userMessage = { speaker: 'You', text: message };
      setTranscript(prev => {
        // Avoid duplicate messages
        if (prev.length > 0 && 
            prev[prev.length - 1].speaker === 'You' && 
            prev[prev.length - 1].text === message) {
          return prev;
        }
        return [...prev, userMessage];
      });
      
      // Send message to chatbot
      addDebugInfo(`Sending message to chatbot: ${message}`);
      
      // Custom app message to Simli backend
      callObject.sendAppMessage({
        type: 'chat-message',
        text: message
      }, chatbotId);
      
      // Clear input
      setMessage("");
      
      // Mark that we're waiting for a response
      setWaitingForSimliResponse(true);
      
      // Set a fallback timer to reset processing state if no response is received
      setTimeout(() => {
        setIsProcessing(prev => {
          if (prev) {
            addDebugInfo("Resetting processing state after timeout");
            return false;
          }
          return prev;
        });
        setWaitingForSimliResponse(false);
      }, 15000); // 15 second timeout
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
      setIsProcessing(false);
      setWaitingForSimliResponse(false);
    }
  };

  // Enhanced transcript button function
  const forceTranscriptRequest = () => {
    requestMultipleTranscripts();
    
    // After a delay, force add a transcript if none was received
    setTimeout(() => {
      if (waitingForSimliResponse) {
        setWaitingForSimliResponse(false);
        setIsProcessing(false);
        
        // If we have pending text, add it
        if (pendingTranscriptRef.current && pendingTranscriptRef.current.trim() !== "") {
          addPotentialTranscript(pendingTranscriptRef.current);
        } else {
          // Add a fallback message
          setTranscript(prev => {
            const speaker = personaData.name;
            const text = "I'm sorry, I couldn't get the transcript. Please try again.";
            
            // Skip if already in transcript
            if (prev.length > 0 && 
                prev[prev.length - 1].speaker === speaker && 
                prev[prev.length - 1].text === text) {
              return prev;
            }
            
            return [...prev, { speaker, text }];
          });
        }
      }
    }, 3000);
  };

  // Toggle audio output mute state
  const toggleAudioMute = () => {
    if (callObject) {
      addDebugInfo(`Toggling audio output: ${isAudioMuted ? "unmuting" : "muting"}`);
      
      const participants = callObject.participants();
      const chatbot = Object.values(participants).find(
        (p: any) => p.user_name === 'Chatbot'
      );
      
      if (chatbot) {
        const audioTrack = chatbot.tracks?.audio;
        if (audioTrack && audioTrack.track) {
          // Toggle the track enabled property
          audioTrack.track.enabled = isAudioMuted;
          setIsAudioMuted(!isAudioMuted);
          
          // Also mute the audio element if it exists
          if (audioElementRef.current) {
            audioElementRef.current.muted = !isAudioMuted;
          }
          
          addDebugInfo(`Audio ${!isAudioMuted ? 'muted' : 'unmuted'}`);
        }
      }
    }
  };

  // Handle enter key in text input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Create a new Simli room and join it using Daily
   */
  const handleJoinRoom = async () => {
    // Reset states
    setIsLoading(true);
    setError(null);
    setDebugInfo("");
    setTranscript([]);
    
    // Initialize audio on user interaction
    initAudio();
    
    addDebugInfo(`Starting Simli session for persona: ${personaId}`);

    try {
      // First clean up any existing Daily instances
      await cleanupExistingDaily();
      
      addDebugInfo("Requesting session token from API...");
      const tokenResponse = await fetch("/api/simli/create-session-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Failed to create token: ${tokenResponse.status}`);
      }
      
      const tokenData = await tokenResponse.json();
      const simliApiKey = tokenData.sessionToken;
      
      addDebugInfo(`Token received: ${simliApiKey ? "✓" : "✗"}`);
      addDebugInfo(`Is mock token: ${tokenData.isMock ? "Yes" : "No"}`);

      if (tokenData.isMock) {
        addDebugInfo("Using a mock token - Simli API will not work properly. Set SIMLI_API_KEY in your environment.");
      }
      
      // Start E2E Session with Simli
      addDebugInfo("Starting E2E Session with Simli...");
      
      const sessionData = await startE2ESession({
        apiKey: simliApiKey,
        // Use the provided faceId or fallback to default
        faceId: personaData.faceId || DEFAULT_FACE_ID,
        systemPrompt: personaData.systemPrompt,
        firstMessage: personaData.firstMessage,
      });
      
      // Add a check to ensure roomUrl exists before calling substring
      const roomUrl = sessionData?.roomUrl;
      addDebugInfo(`Simli session started successfully. Room URL: ${roomUrl ? roomUrl.substring(0, 30) + '...' : 'undefined'}`);
      
      if (!roomUrl) {
        throw new Error("No room URL returned from Simli API");
      }
      
      addDebugInfo("Creating Daily call object...");
      // Create a new Daily call object
      const newCallObject = Daily.createCallObject({
        audioSource: true, // Enable microphone
        videoSource: false, // No camera needed from user
        dailyConfig: {
          // Use only valid configuration options
          userMediaAudioConstraints: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          }
        }
      });
      
      // Set as global instance to prevent duplicates
      globalCallObject = newCallObject;

      // Setting user name
      newCallObject.setUserName("User");
      
      // Register event listener for transcript
      newCallObject.on('app-message', (event: any) => {
        const eventData = JSON.stringify(event.data).substring(0, 150) + (JSON.stringify(event.data).length > 150 ? '...' : '');
        addDebugInfo(`Received app-message from ${event.fromId}: ${eventData}`);
        
        // Process all incoming messages
        if (event?.data) {
          try {
            // Log all data structure for debugging
            console.log('Full message data:', event);
            
            // User voice transcription
            if (event.data.trackType === 'cam-audio' && event.data.text) {
              // Only add final transcriptions to avoid fragments
              if (event.data.is_final) {
                const speaker = 'You';
                const text = event.data.text;
                
                addDebugInfo(`Adding voice transcript to chat - ${speaker}: ${text}`);
                setTranscript(prev => {
                  // Avoid duplicate messages
                  if (prev.length > 0 && 
                      prev[prev.length - 1].speaker === speaker && 
                      prev[prev.length - 1].text === text) {
                    return prev;
                  }
                  return [...prev, { speaker, text }];
                });
                
                // If we're processing the user's message, consider the next response to be processing
                setIsProcessing(true);
                setWaitingForSimliResponse(true);
              }
            }
            
            // Avatar speech recognition (what the avatar is saying)
            else if (event.data.trackType === 'avatar-speech' || 
                    (event.data.agentResponse === true) || 
                    (event.data.type === 'agent-speech')) {
              
              const speaker = personaData.name;
              const text = event.data.text || event.data.message || event.data.transcript || "";
              
              // Skip command messages
              if (text && text.trim() !== "" && 
                  !commandFilterPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))) {
                
                // Skip if this appears to be an echo of what the user just said
                if (transcript.length > 0 && 
                    transcript[transcript.length - 1].speaker === 'You' && 
                    (transcript[transcript.length - 1].text === text || 
                     similarity(transcript[transcript.length - 1].text, text) > 0.8)) {
                  addDebugInfo(`Skipping echo of user message: ${text.substring(0, 30)}...`);
                  return;
                }
                
                addDebugInfo(`Adding avatar speech to transcript - ${speaker}: ${text}`);
                setTranscript(prev => {
                  // Avoid duplicate messages
                  if (prev.length > 0 && 
                      prev[prev.length - 1].speaker === speaker && 
                      prev[prev.length - 1].text === text) {
                    return prev;
                  }
                  return [...prev, { speaker, text }];
                });
                setIsProcessing(false);
                setWaitingForSimliResponse(false);
              }
            }
            
            // Try to extract potential avatar speech from any message from the chatbot
            else if (event.fromId === 'Chatbot') {
              const potentialText = parseSimliMessages(event);
              
              if (potentialText && typeof potentialText === 'string' && potentialText.trim() !== "") {
                // Skip if this is just an echo of what the user just said
                const isEchoOfUserMessage = transcript.length > 0 && 
                                           transcript[transcript.length - 1].speaker === 'You' && 
                                           (transcript[transcript.length - 1].text === potentialText || 
                                            similarity(transcript[transcript.length - 1].text, potentialText) > 0.8);
                
                if (!isEchoOfUserMessage) {
                  const speaker = personaData.name;
                  addDebugInfo(`Extracted potential avatar speech: ${potentialText.substring(0, 50)}...`);
                  
                  setTranscript(prev => {
                    // Avoid duplicate messages
                    if (prev.length > 0 && 
                        prev[prev.length - 1].speaker === speaker && 
                        prev[prev.length - 1].text === potentialText) {
                      return prev;
                    }
                    return [...prev, { speaker, text: potentialText }];
                  });
                  setIsProcessing(false);
                  setWaitingForSimliResponse(false);
                } else {
                  addDebugInfo(`Skipping echo of user message: ${potentialText.substring(0, 30)}...`);
                }
              }
            }
          } catch (err) {
            addDebugInfo(`Error processing message: ${err}`);
          }
        }
      });

      // Register event listener for participants
      newCallObject.on('participant-joined', (event: any) => {
        addDebugInfo(`Participant joined: ${event.participant.user_name} (${event.participant.session_id})`);
        if (event.participant.user_name === "Chatbot") {
          addDebugInfo(`Chatbot detected with ID: ${event.participant.session_id}`);
          setChatbotId(event.participant.session_id);
          setIsLoading(false);
          setIsAvatarVisible(true);
          onStart();
          
          // Request a first message after the chatbot joins
          requestFirstMessage();
        }
      });

      // Additional events for debugging
      newCallObject.on('track-started', (event: any) => {
        addDebugInfo(`Track started: ${event.participant.user_name} - ${event.track.kind}`);
        
        // If audio track starts, ensure audio is working
        if (event.track.kind === 'audio' && audioContext) {
          if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
              addDebugInfo("AudioContext resumed on track started");
            });
          }
          
          // Log detailed information about the audio track
          const trackInfo = {
            enabled: event.track.enabled,
            id: event.track.id,
            muted: event.track.muted,
            readyState: event.track.readyState,
            kind: event.track.kind
          };
          addDebugInfo(`Audio track details: ${JSON.stringify(trackInfo)}`);
        }
      });
      
      newCallObject.on('track-stopped', (event: any) => {
        addDebugInfo(`Track stopped: ${event.participant.user_name} - ${event.track.kind}`);
      });
      
      // Error handling
      newCallObject.on('error', (event: any) => {
        console.error("Daily error:", event);
        addDebugInfo(`Daily error: ${JSON.stringify(event)}`);
        setError(`Failed to connect: ${event.errorMsg || "Unknown Daily.co error"}`);
        setIsLoading(false);
      });
      
      // Network and connection issues
      newCallObject.on('network-connection', (event: any) => {
        addDebugInfo(`Network connection: ${event.type} - Quality: ${event.quality}`);
      });

      // Add an event listener for video-playback-started
      newCallObject.on('app-message', (event: any) => {
        if (event?.data?.type === 'video-playback-started') {
          addDebugInfo("Video playback started successfully");
        }
      });

      try {
        addDebugInfo(`Joining Daily room: ${roomUrl.substring(0, 30)}...`);
        // Join the Daily room
        await newCallObject.join({ 
          url: roomUrl,
        });

        // Enable audio after joining
        newCallObject.setLocalAudio(true);

        // Ensure audio output is enabled for remote participants
        newCallObject.setSubscribeToTracksAutomatically(true);
        
        addDebugInfo("Joined Daily room successfully");
        myCallObjRef.current = newCallObject;
        setCallObject(newCallObject);
        
        // Enhance the ensureAudioEnabled function with more diagnostics
        const ensureAudioEnabled = () => {
          // Find the Chatbot participant
          const participants = newCallObject.participants();
          const chatbot = Object.values(participants).find(
            (p: any) => p.user_name === 'Chatbot'
          );
          
          if (chatbot) {
            const audioTrack = chatbot.tracks?.audio;
            if (audioTrack) {
              addDebugInfo(`Audio track status: state=${audioTrack.state}, subscribed=${audioTrack.subscribed}, enabled=${audioTrack?.track?.enabled}`);
              
              if (audioTrack.state === 'playable') {
                addDebugInfo("Ensuring Chatbot audio track is enabled");
                
                // Make sure audio context is resumed
                if (audioContext && audioContext.state === 'suspended') {
                  audioContext.resume().then(() => {
                    addDebugInfo("Audio context resumed for playback");
                  });
                }
                
                // Ensure the audio track is not muted
                if (audioTrack.track) {
                  // Force enable the track
                  audioTrack.track.enabled = true;
                  
                  // Try to connect the track directly to an audio element
                  try {
                    if (audioElementRef.current) {
                      // Create MediaStream from the audio track
                      const stream = new MediaStream([audioTrack.track]);
                      audioElementRef.current.srcObject = stream;
                      audioElementRef.current.play()
                        .then(() => addDebugInfo("Audio element is playing"))
                        .catch(e => addDebugInfo(`Audio play failed: ${e.message}`));
                      
                      // Set volume to max
                      audioElementRef.current.volume = 1.0;
                      addDebugInfo(`Audio element volume set to ${audioElementRef.current.volume}`);
                    }
                  } catch (err) {
                    addDebugInfo(`Error connecting audio track: ${err}`);
                  }
                }
              } else {
                addDebugInfo(`Audio track not playable yet. Current state: ${audioTrack.state}`);
              }
            } else {
              addDebugInfo("Chatbot has no audio track yet");
            }
          } else {
            addDebugInfo("Chatbot participant not found in room");
          }
        };
        
        // Call initially and set up a periodic check
        ensureAudioEnabled();
        const audioCheckInterval = setInterval(ensureAudioEnabled, 2000);
        
        // Store interval ID in a ref for cleanup
        audioIntervalRef.current = audioCheckInterval;
        
        // Check if Chatbot is already in the room
        const participants = newCallObject.participants();
        addDebugInfo(`Participants in room: ${Object.keys(participants).length}`);
        for (const [key, participant] of Object.entries(participants)) {
          const userName = (participant as any).user_name;
          addDebugInfo(`Found participant: ${userName} (${key})`);
          if (userName === "Chatbot") {
            addDebugInfo(`Chatbot already in room with session ID: ${key}`);
            setChatbotId(key);
            setIsLoading(false);
            setIsAvatarVisible(true);
            onStart();
            break;
          }
        }
        
        // If we didn't find the chatbot yet, set a timeout to keep checking
        if (!chatbotId) {
          addDebugInfo("Chatbot not found immediately, will continue checking");
          setTimeout(() => {
            if (!myCallObjRef.current) return;
            
            const updatedParticipants = myCallObjRef.current.participants();
            addDebugInfo(`Checking participants again: ${Object.keys(updatedParticipants).length}`);
            for (const [key, participant] of Object.entries(updatedParticipants)) {
              const userName = (participant as any).user_name;
              addDebugInfo(`Participant: ${userName} (${key})`);
              if (userName === "Chatbot") {
                addDebugInfo(`Chatbot found on second check: ${key}`);
                setChatbotId(key);
                setIsLoading(false);
                setIsAvatarVisible(true);
                onStart();
                break;
              }
            }
          }, 3000);
        }
      } catch (dailyJoinError) {
        console.error("Error joining Daily room:", dailyJoinError);
        addDebugInfo(`Error joining Daily room: ${dailyJoinError instanceof Error ? dailyJoinError.message : String(dailyJoinError)}`);
        setError(`Failed to join room: ${dailyJoinError instanceof Error ? dailyJoinError.message : String(dailyJoinError)}`);
        setIsLoading(false);
        
        // Clean up the failed call object
        try {
          newCallObject.destroy();
          globalCallObject = null;
        } catch (cleanupError) {
          console.error("Error cleaning up Daily call object:", cleanupError);
        }
        return;
      }
    } catch (error) {
      console.error("Error starting Simli session:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setIsLoading(false);
    }
  };  

  /**
   * Leave the room
   */
  const handleLeaveRoom = async () => {
    if (callObject) {
      addDebugInfo("Leaving room...");
      await callObject.leave();
      callObject.destroy();
      
      // Reset global reference
      if (globalCallObject === callObject) {
        globalCallObject = null;
      }
      
      setCallObject(null);
      myCallObjRef.current = null;
      onClose();
      setIsAvatarVisible(false);
      setIsLoading(false);
    }
  };

  /**
   * Mute or unmute local audio
   */
  const toggleMute = async () => {
    if (callObject) {
      const currentAudioState = callObject.localAudio();
      addDebugInfo(`Toggling microphone: ${currentAudioState ? "muting" : "unmuting"}`);
      callObject.setLocalAudio(!currentAudioState);
      setIsMuted(currentAudioState);
      
      // Ensure audio context is running
      if (!currentAudioState && audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          addDebugInfo("AudioContext resumed when unmuting");
        });
      }
    }
  };

  // Add a function to request a first message from the chatbot after joining
  const requestFirstMessage = async () => {
    if (callObject && chatbotId) {
      // Wait a moment for connections to stabilize
      setTimeout(() => {
        addDebugInfo("Requesting first message from chatbot");
        
        // Send a special message to trigger first response
        try {
          // Check if call is joined before sending
          if (callObject.participants() && Object.keys(callObject.participants()).length > 0) {
            callObject.sendAppMessage({
              type: 'request-greeting',
              text: 'start'
            }, chatbotId);
            
            // Mark that we're waiting for a response
            setWaitingForSimliResponse(true);
            
            // Request transcript after greeting
            setTimeout(() => {
              // Use different request formats to increase chances of receiving a response
              callObject.sendAppMessage({
                type: 'avatar-speech',
                action: 'get_response'
              }, chatbotId);
              
              callObject.sendAppMessage({
                type: 'request-transcript',
                action: 'full_transcript'
              }, chatbotId);
            }, 4000);
          } else {
            addDebugInfo("Not sending greeting request - call not joined yet");
          }
        } catch (err) {
          addDebugInfo(`Error requesting first message: ${err}`);
        }
      }, 2000);
    }
  };

  // Add function to request transcript
  const requestTranscript = () => {
    if (callObject && chatbotId) {
      addDebugInfo("Requesting current transcript");
      try {
        callObject.sendAppMessage({
          type: 'request-transcript',
          text: 'getTranscript'
        }, chatbotId);
        
        // Set processing state briefly to show activity
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 3000);
      } catch (err) {
        addDebugInfo(`Error requesting transcript: ${err}`);
      }
    }
  };

  // Parse Simli messages for potential transcript content
  const parseSimliMessages = (event: any) => {
    if (!event || !event.data) return null;
    
    try {
      // Skip messages that are likely internal command messages
      
      // The data could contain the text the avatar is speaking
      const data = event.data;
      
      // Skip if type indicates an internal command
      if (data.type && typeof data.type === 'string') {
        const typeLC = data.type.toLowerCase();
        if (typeLC === 'get-transcript' || 
            typeLC === 'request-transcript' || 
            typeLC === 'transcript-request' ||
            typeLC === 'get-latest-response' ||
            typeLC === 'avatar-speech' ||
            typeLC === 'get-agent-response') {
          return null;
        }
      }
      
      // Skip if it has an action field
      if (data.action && typeof data.action === 'string') {
        return null;
      }
      
      // Check various places where the text might be hiding
      if (data.message && typeof data.message === 'string') {
        if (commandFilterPatterns.some(pattern => data.message.toLowerCase().includes(pattern.toLowerCase()))) {
          return null;
        }
        return data.message;
      }
      
      if (data.text && typeof data.text === 'string') {
        if (commandFilterPatterns.some(pattern => data.text.toLowerCase().includes(pattern.toLowerCase()))) {
          return null;
        }
        return data.text;
      }
      
      if (data.transcript && typeof data.transcript === 'string') {
        if (commandFilterPatterns.some(pattern => data.transcript.toLowerCase().includes(pattern.toLowerCase()))) {
          return null;
        }
        return data.transcript;
      }
      
      if (data.content && typeof data.content === 'string') {
        if (commandFilterPatterns.some(pattern => data.content.toLowerCase().includes(pattern.toLowerCase()))) {
          return null;
        }
        return data.content;
      }
      
      // Check for response formats
      if (data.response) {
        if (typeof data.response === 'string') {
          if (commandFilterPatterns.some(pattern => data.response.toLowerCase().includes(pattern.toLowerCase()))) {
            return null;
          }
          return data.response;
        }
        if (typeof data.response === 'object' && data.response.text) {
          if (commandFilterPatterns.some(pattern => data.response.text.toLowerCase().includes(pattern.toLowerCase()))) {
            return null;
          }
          return data.response.text;
        }
        if (typeof data.response === 'object' && data.response.message) {
          if (commandFilterPatterns.some(pattern => data.response.message.toLowerCase().includes(pattern.toLowerCase()))) {
            return null;
          }
          return data.response.message;
        }
      }
      
      // Check for nested structures
      if (data.data && typeof data.data === 'object') {
        if (data.data.text && !commandFilterPatterns.some(pattern => data.data.text.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.data.text;
        if (data.data.message && !commandFilterPatterns.some(pattern => data.data.message.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.data.message;
        if (data.data.transcript && !commandFilterPatterns.some(pattern => data.data.transcript.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.data.transcript;
        if (data.data.content && !commandFilterPatterns.some(pattern => data.data.content.toLowerCase().includes(pattern.toLowerCase()))) 
          return data.data.content;
      }
      
      return null;
    } catch (e) {
      console.error("Error parsing Simli message:", e);
      return null;
    }
  };

  // Add a function to request text data directly from Simli's API
  const requestBotResponse = () => {
    if (callObject && chatbotId) {
      try {
        // Send a special message to request the current transcript
        callObject.sendAppMessage({
          type: 'get-latest-response',
          action: 'get_transcript'
        }, chatbotId);
        
        addDebugInfo("Requested latest response from chatbot");
      } catch (err) {
        addDebugInfo(`Error requesting bot response: ${err}`);
      }
    }
  };

  // Add function to set up audio processing pipeline for the avatar
  const setupAvatarSpeechRecognition = () => {
    if (!callObject || !chatbotId || !SpeechRecognitionAPI) {
      addDebugInfo("Cannot set up speech recognition: missing dependencies");
      return;
    }

    try {
      // Get the avatar's audio track
      const participants = callObject.participants();
      const chatbot = Object.values(participants).find(
        (p: any) => p.user_name === 'Chatbot'
      );
      
      if (!chatbot) {
        addDebugInfo("Chatbot participant not found for speech recognition");
        return;
      }
      
      const audioTrack = chatbot.tracks?.audio?.track;
      if (!audioTrack) {
        addDebugInfo("No audio track found for speech recognition");
        return;
      }
      
      addDebugInfo("Setting up speech recognition for avatar audio");
      
      // Create a MediaStream from the audio track
      const avatarStream = new MediaStream([audioTrack]);
      avatarAudioStreamRef.current = avatarStream;
      
      // Create a new audio context for processing
      const avatarAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      avatarAudioContextRef.current = avatarAudioCtx;
      
      // Create a recognition instance
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Set up recognition event handlers
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        
        addDebugInfo(`Avatar speech recognized: ${transcript} (${isFinal ? 'final' : 'interim'})`);
        
        if (isFinal) {
          // Add to transcript
          const speaker = personaData.name;
          setTranscript(prev => {
            // Avoid duplicate messages
            if (prev.length > 0 && 
                prev[prev.length - 1].speaker === speaker && 
                prev[prev.length - 1].text === transcript) {
              return prev;
            }
            return [...prev, { speaker, text: transcript }];
          });
        }
      };
      
      recognition.onerror = (event: any) => {
        addDebugInfo(`Speech recognition error: ${event.error}`);
        isRecognizingRef.current = false;
        setIsListeningToAvatar(false);
      };
      
      recognition.onend = () => {
        addDebugInfo("Speech recognition ended - attempting to restart");
        if (isRecognizingRef.current) {
          // Restart recognition if it's still supposed to be running
          try {
            recognition.start();
            addDebugInfo("Speech recognition restarted");
          } catch (e) {
            addDebugInfo(`Failed to restart speech recognition: ${e}`);
          }
        }
      };
      
      // Store the recognition instance
      recognitionRef.current = recognition;
      
      // Start recognition
      try {
        recognition.start();
        isRecognizingRef.current = true;
        setIsListeningToAvatar(true);
        addDebugInfo("Avatar speech recognition started");
      } catch (e) {
        addDebugInfo(`Failed to start speech recognition: ${e}`);
      }
    } catch (error) {
      addDebugInfo(`Error setting up avatar speech recognition: ${error}`);
    }
  };

  // Add function to clean up speech recognition
  const cleanupAvatarSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        addDebugInfo("Cleaning up avatar speech recognition");
        recognitionRef.current.stop();
        isRecognizingRef.current = false;
        setIsListeningToAvatar(false);
      } catch (e) {
        addDebugInfo(`Error stopping speech recognition: ${e}`);
      }
    }
    
    if (avatarAudioContextRef.current) {
      try {
        avatarAudioContextRef.current.close();
        avatarAudioContextRef.current = null;
      } catch (e) {
        addDebugInfo(`Error closing avatar audio context: ${e}`);
      }
    }
    
    avatarAudioStreamRef.current = null;
  };

  // Initialize speech recognition when avatar appears
  useEffect(() => {
    if (isAvatarVisible && callObject && chatbotId) {
      // Set a timeout to let the tracks initialize properly
      setTimeout(() => {
        setupAvatarAudioMonitoring();
      }, 2000);
    }
    
    return () => {
      cleanupAvatarSpeechRecognition();
      
      // Also clean up hark instance
      if (harkInstanceRef.current) {
        harkInstanceRef.current.stop();
        harkInstanceRef.current = null;
      }
    };
  }, [isAvatarVisible, callObject, chatbotId]);

  // New function to request a direct response with no filtering
  const requestDirectResponse = () => {
    if (!callObject || !chatbotId) return;
    
    // Only send if call is joined
    if (callObject.participants() && Object.keys(callObject.participants()).length > 0) {
      try {
        // Try a different format specifically for getting the actual response
        callObject.sendAppMessage({
          type: 'get-agent-response',
          action: 'get_last_utterance'
        }, chatbotId);
        
        callObject.sendAppMessage({
          type: 'avatar-speech',
          action: 'get_response'
        }, chatbotId);
        
        addDebugInfo("Sent direct response request");
      } catch (e) {
        addDebugInfo(`Error sending direct response request: ${e}`);
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      {!isAvatarVisible ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg border border-gray-100 backdrop-blur-sm bg-white/70">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-pink-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <img 
              src="/conversation-icon.svg" 
              alt="Start conversation" 
              className="w-12 h-12 text-pink-500"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'%3E%3C/path%3E%3C/svg%3E";
              }}
            />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Start a conversation</h2>
          <p className="text-gray-500 text-center mb-8 max-w-md">
            Begin talking with {personaData.name} - ask questions, get advice, or just chat.
          </p>
          <button
            onClick={handleJoinRoom}
            disabled={isLoading}
            className={cn(
              "w-64 h-12 disabled:bg-gray-300 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 px-6 rounded-full",
              "flex justify-center items-center shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90"
            )}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13"></path>
                  <path d="M22 2 15 22 11 13 2 9 22 2z"></path>
                </svg>
                Start Conversation
              </span>
            )}
          </button>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-lg">
              <p className="font-medium flex items-center mb-1">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Error
              </p>
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Avatar video section */}
          <div className="md:col-span-4 bg-gradient-to-br from-white to-pink-50 p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-700">{personaData.name}</h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={toggleMute}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200",
                    isMuted ? "bg-gray-200 text-gray-700" : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  )}
                  title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                
                <button
                  onClick={toggleAudioMute}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200",
                    isAudioMuted ? "bg-gray-200 text-gray-700" : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  )}
                  title={isAudioMuted ? "Unmute Speaker" : "Mute Speaker"}
                >
                  {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>
            
            {callObject && chatbotId && (
              <div className="rounded-xl overflow-hidden shadow-md">
                <RecoilRoot>
                  <DailyProvider callObject={callObject}>
                    <VideoComponent id={chatbotId} name={personaData.name} />
                  </DailyProvider>
                </RecoilRoot>
              </div>
            )}
            
            {/* Add speech/transcription status indicator */}
            <div className="flex justify-center mt-3 mb-2">
              {isAvatarSpeaking ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Avatar speaking
                </span>
              ) : waitingForSimliResponse ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="animate-pulse inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  Waiting for response...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                  <span className="inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                  Not speaking
                </span>
              )}
            </div>
            
            <div className="flex justify-center mt-5">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center justify-center h-11 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-full transition-colors shadow-sm hover:shadow"
              >
                End Conversation
              </button>
              
              <button
                onClick={() => {
                  // Force initialize audio
                  initAudio();
                  
                  // Force enable audio for the chatbot if possible
                  if (callObject) {
                    const participants = callObject.participants();
                    const chatbot = Object.values(participants).find(
                      (p: any) => p.user_name === 'Chatbot'
                    );
                    
                    if (chatbot) {
                      const audioTrack = chatbot.tracks?.audio;
                      if (audioTrack && audioTrack.track) {
                        audioTrack.track.enabled = true;
                        addDebugInfo("Manually enabled audio track");
                        
                        // Try direct connection to audio element
                        if (audioElementRef.current) {
                          try {
                            const stream = new MediaStream([audioTrack.track]);
                            audioElementRef.current.srcObject = stream;
                            audioElementRef.current.play()
                              .then(() => addDebugInfo("Manual audio connection established"))
                              .catch(e => addDebugInfo(`Manual audio play failed: ${e.message}`));
                          } catch (err) {
                            addDebugInfo(`Manual audio connection error: ${err}`);
                          }
                        }
                      }
                    }
                  }
                  
                  // Setup audio monitoring again
                  setupAvatarAudioMonitoring();
                }}
                className="flex items-center justify-center h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full transition-colors ml-3 shadow-sm hover:shadow"
              >
                <Volume2 size={16} className="mr-2" />
                Fix Audio
              </button>
            </div>
          </div>
          
          {/* Conversation transcript */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-transparent">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-800">Conversation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={forceTranscriptRequest}
                    className="text-xs inline-flex items-center text-gray-500 hover:text-pink-600 hover:bg-pink-50 px-2 py-1 rounded transition-colors"
                    title="Get Transcript"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Get Transcript
                  </button>
                </div>
              </div>
            </div>
            
            {/* Transcript area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm max-w-xs">
                    <div className="w-12 h-12 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Your conversation will appear here.<br />
                      Speak to start chatting.
                    </p>
                  </div>
                </div>
              ) : (
                transcript.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-4 rounded-xl max-w-[90%] shadow-sm transition-all duration-200 animate-fadeIn",
                      entry.speaker === 'You' 
                        ? "bg-gradient-to-r from-pink-100 to-pink-50 text-gray-800 ml-auto rounded-br-none border-r-2 border-pink-200" 
                        : "bg-white border border-gray-200 mr-auto rounded-bl-none"
                    )}
                  >
                    <p className={cn(
                      "text-xs mb-1 font-medium flex items-center gap-1",
                      entry.speaker === 'You' ? "text-pink-700" : "text-gray-700"
                    )}>
                      {entry.speaker === 'You' ? (
                        <Mic size={12} className="inline" />
                      ) : (
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="7" />
                          <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                        </svg>
                      )}
                      {entry.speaker}
                    </p>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="bg-white border border-gray-200 p-3 rounded-xl max-w-[85%] mr-auto rounded-bl-none shadow-sm animate-fadeIn">
                  <p className="text-xs mb-1 font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="7" />
                      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                    </svg>
                    {personaData.name}
                  </p>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Debug info section - hidden in production */}
      {process.env.NODE_ENV !== 'production' && debugInfo && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto shadow-inner">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium text-sm text-gray-700">Debug Info:</h4>
            <button 
              onClick={() => setDebugInfo("")} 
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default SimliAgent; 