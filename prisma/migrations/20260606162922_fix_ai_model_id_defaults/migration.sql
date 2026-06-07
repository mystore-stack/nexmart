-- Alter AI model tables to add DEFAULT gen_random_uuid() to id columns
-- This ensures database-level defaults match Prisma schema

ALTER TABLE "AiConversation" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "AiEvent" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "AiMessage" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "AiProductEmbedding" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();