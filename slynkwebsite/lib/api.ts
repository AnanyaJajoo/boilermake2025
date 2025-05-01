// API functions for persona management

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  firstMessage?: string;
  faceId: string;
  voice: string;
  useCustomVoice: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonaFormData {
  name: string;
  description: string;
  systemPrompt: string;
  firstMessage?: string;
  faceId: string;
  voice: string;
  useCustomVoice: boolean;
}

// Function to create a new persona
export async function createPersona(formData: PersonaFormData, voiceFile?: File): Promise<Persona> {
  // In a real implementation, this would send data to your backend API
  console.log('Creating persona with data:', formData);
  
  if (voiceFile) {
    console.log('Voice file uploaded:', voiceFile.name);
    // Here you would upload the voice file and get a reference to it
  }
  
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `persona-${Date.now()}`,
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }, 1000);
  });
} 