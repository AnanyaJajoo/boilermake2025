// Mock data and functions for development and demo purposes
// Used when database connection fails or when running in development

import { v4 as uuidv4 } from 'uuid';

// Mock storage
let mockPersonas: any[] = [];
let mockSessions: any[] = [];
let mockMessages: any[] = [];

// Mock user for demo purposes
const MOCK_USER_ID = 'mock-user-123';

// Mock API functions
export const mockApi = {
  // Mock authentication
  getSession: () => {
    return {
      user: {
        id: MOCK_USER_ID,
        name: 'Demo User',
        email: 'demo@example.com',
      }
    };
  },

  // Persona management
  createPersona: (data: any) => {
    const id = data.id || uuidv4();
    const newPersona = {
      id,
      ...data,
      userId: MOCK_USER_ID,
      faceId: data.faceId || 'tmp9i8bbq7c', // Default Simli face ID
      simliSessionId: data.simliSessionId || `simli-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log(`[mockApi] Creating persona "${data.name}" with ID: ${id}`);
    
    // Check if persona with this ID already exists
    const existingIndex = mockPersonas.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      // Update existing persona instead of creating a new one
      mockPersonas[existingIndex] = {
        ...mockPersonas[existingIndex],
        ...newPersona,
        updatedAt: new Date().toISOString()
      };
      console.log(`[mockApi] Updated existing persona with ID: ${id}`);
      return mockPersonas[existingIndex];
    }
    
    mockPersonas.push(newPersona);
    return newPersona;
  },

  getPersonas: () => {
    console.log(`[mockApi] Getting all personas. Count: ${mockPersonas.length}`);
    return mockPersonas.filter(persona => persona.userId === MOCK_USER_ID);
  },

  getPersonaById: (id: string) => {
    // Try to find persona in mock storage
    const persona = mockPersonas.find(persona => persona.id === id);
    console.log(`[mockApi] Looking up persona by ID: ${id}, found: ${!!persona}`);
    
    // If not found, create a mock persona with this ID for development purposes
    if (!persona && id) {
      console.log(`[mockApi] Creating on-demand mock persona for ID: ${id}`);
      const mockPersona = {
        id,
        name: `Mock Persona ${id.substring(0, 8)}`,
        description: "This is an automatically generated mock persona for development",
        userId: MOCK_USER_ID,
        faceId: 'tmp9i8bbq7c',
        simliSessionId: `simli-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        qaPairs: [
          { 
            id: `qa-${Date.now()}-1`,
            question: "What are you?",
            answer: "I'm a mock AI persona created for development purposes."
          }
        ]
      };
      
      mockPersonas.push(mockPersona);
      console.log(`[mockApi] Created on-demand mock persona with name: ${mockPersona.name}`);
      return mockPersona;
    }
    
    if (persona) {
      console.log(`[mockApi] Persona name: ${persona.name}`);
    }
    return persona;
  },

  // Chat session management
  createChatSession: (personaId: string) => {
    const id = uuidv4();
    const session = {
      id,
      personaId,
      userId: MOCK_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockSessions.push(session);
    
    // Add initial message
    const messageId = uuidv4();
    const initialMessage = {
      id: messageId,
      sessionId: id,
      content: 'Hello! How can I help you today?',
      isUser: false,
      createdAt: new Date().toISOString(),
    };
    
    mockMessages.push(initialMessage);
    
    return {
      session,
      messages: [initialMessage],
    };
  },

  getSessionPersona: (sessionId: string) => {
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) return null;
    return mockPersonas.find(persona => persona.id === session.personaId);
  },

  // Message handling
  addMessage: (sessionId: string, content: string, isUser: boolean) => {
    const id = uuidv4();
    const message = {
      id,
      sessionId,
      content,
      isUser,
      createdAt: new Date().toISOString(),
    };
    
    mockMessages.push(message);
    return message;
  },

  getSessionMessages: (sessionId: string) => {
    return mockMessages.filter(message => message.sessionId === sessionId);
  },

  // Simli API simulation
  simulateSimliResponse: (message: string, personaName: string) => {
    // Simulate AI response
    const responses = [
      `I understand. As ${personaName}, I'm here to assist you with any questions about our products or services.`,
      `Thank you for your message. ${personaName} is designed to provide helpful information and support.`,
      `That's an interesting question. As ${personaName}, I'd be happy to provide more details about that.`,
      `I appreciate your inquiry. ${personaName} is here to offer the best possible assistance.`,
      `Great question! As ${personaName}, I can definitely help you with that.`,
    ];
    
    // Return a random response
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
};

// Function to ensure we have mock data
function ensureMockData() {
  // Only create initial data if we have no personas
  if (mockPersonas.length === 0) {
    console.log('[mockApi] No mock personas found, creating test data');
    
    // Create demo persona with a fixed ID for easier testing
    const demoPersona = {
      id: 'demo-persona-123',
      name: 'Demo AI Assistant',
      description: 'A demo AI assistant to showcase the platform features',
      userId: MOCK_USER_ID,
      faceId: 'tmp9i8bbq7c', // Default Simli face ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      simliSessionId: 'demo-session-123',
      qaPairs: [
        { 
          id: 'qa-1',
          question: 'What can you do?',
          answer: 'I can answer questions, provide information, and assist with various tasks.'
        },
        {
          id: 'qa-2',
          question: 'How do I create a new AI persona?',
          answer: 'You can create a new AI persona by clicking the "Create New Persona" button on the dashboard.'
        }
      ]
    };
    
    mockPersonas.push(demoPersona);
    console.log(`[mockApi] Created demo persona with ID: ${demoPersona.id}`);
    
    // Add a regular mock persona
    mockApi.createPersona({
      name: 'Regular Test Persona',
      description: 'Another test AI assistant',
      qaPairs: [
        { 
          id: uuidv4(),
          question: 'Are you a test?',
          answer: 'Yes, I am a test persona created for development purposes.'
        }
      ]
    });
    
    // Add some predefined IDs that match the ones used in the app
    const knownIds = [
      'cm9te6a5k0001y8j418u48eaa',
      'cm9tejcg70001y8r49zbpn1hs'
    ];
    
    // Create personas with these IDs
    knownIds.forEach((id, index) => {
      mockApi.createPersona({
        id,
        name: `Known Persona ${index + 1}`,
        description: `This is a predefined persona with ID: ${id}`,
        simliSessionId: `simli-${id}`,
        qaPairs: [
          {
            id: `qa-known-${index}-1`,
            question: 'Who are you?',
            answer: `I am Known Persona ${index + 1}, a predefined mock persona with ID ${id}.`
          }
        ]
      });
    });
  }
}

// Initialize mock data
ensureMockData();

console.log('[mockApi] Mock API initialized with', mockPersonas.length, 'personas'); 