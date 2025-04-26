-- Add new fields to AIPersona table
ALTER TABLE "AIPersona" 
  ADD COLUMN "simliAgentId" TEXT,
  ADD COLUMN "systemPrompt" TEXT,
  ADD COLUMN "firstMessage" TEXT,
  ADD COLUMN "isCustomFaceInQueue" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "metadata" JSONB; 