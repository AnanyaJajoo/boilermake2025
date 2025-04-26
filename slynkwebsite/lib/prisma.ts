// Create a mock or real Prisma Client depending on configuration
// This allows the app to run without a database when using mock API

// Mock PrismaClient that won't cause errors when no database is available
class MockPrismaClient {
  constructor() {
    console.log('Using Mock Prisma Client');
  }
  
  // Add mock versions of common Prisma methods
  // These won't actually be called when USE_MOCK_API=true
  aIPersona = {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({}),
    update: async () => ({}),
  };
  
  chatSession = {
    findUnique: async () => null,
    create: async () => ({}),
  };
  
  chatMessage = {
    create: async () => ({}),
  };
  
  // Method to satisfy connection requirements
  $connect() {
    return Promise.resolve();
  }
  
  $disconnect() {
    return Promise.resolve();
  }
}

let prismaClientPackage;

// Safely try to import PrismaClient
try {
  prismaClientPackage = require('../lib/generated/prisma').PrismaClient;
} catch (e) {
  console.warn('Could not load Prisma Client from generated location, using mock client');
  prismaClientPackage = MockPrismaClient;
}

// Use mock or real PrismaClient based on environment
const PrismaClient = process.env.USE_MOCK_API === 'true' 
  ? MockPrismaClient 
  : prismaClientPackage;

// Define global type
declare global {
  var prisma: any | undefined;
}

// Use a single instance of Prisma Client
export const prisma = global.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Avoid instantiating too many instances in development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma; 