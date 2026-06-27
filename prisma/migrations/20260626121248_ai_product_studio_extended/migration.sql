-- CreateEnum
CREATE TYPE "AIModel" AS ENUM ('GPT_5_5', 'GPT_4_1', 'GPT_4', 'GPT_3_5_TURBO', 'CLAUDE_3_OPUS', 'CLAUDE_3_SONNET', 'CLAUDE_3_HAIKU', 'GEMINI_PRO', 'GEMINI_ULTRA');

-- CreateEnum
CREATE TYPE "AIProductLanguage" AS ENUM ('EN', 'FR', 'AR', 'ES', 'DE', 'ZH', 'JA');

-- CreateEnum
CREATE TYPE "AIProductTone" AS ENUM ('PREMIUM', 'TECHNICAL', 'FRIENDLY', 'CONVERSION', 'LUXURY', 'PROFESSIONAL', 'CASUAL');

-- CreateEnum
CREATE TYPE "AIProductInputType" AS ENUM ('URL', 'SUPPLIER_DESCRIPTION', 'IMAGES', 'PDF_CATALOG', 'CSV', 'MANUAL_PROMPT', 'VOICE', 'VIDEO');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING');

-- CreateEnum
CREATE TYPE "AIJobPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "AIModelConfig" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "defaultModel" "AIModel" NOT NULL DEFAULT 'GPT_4',
    "apiKey" TEXT,
    "enabledModels" "AIModel"[],
    "monthlyQuota" INTEGER NOT NULL DEFAULT 1000,
    "usedQuota" INTEGER NOT NULL DEFAULT 0,
    "quotaResetDate" TIMESTAMP(3) NOT NULL,
    "rateLimitPerMin" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIModelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProductJob" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "generationId" UUID,
    "bulkImportId" UUID,
    "inputType" "AIProductInputType" NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "priority" "AIJobPriority" NOT NULL DEFAULT 'NORMAL',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB DEFAULT '{}',
    "error" TEXT,
    "model" "AIModel" NOT NULL DEFAULT 'GPT_4',
    "language" "AIProductLanguage" NOT NULL DEFAULT 'EN',
    "tone" "AIProductTone" NOT NULL DEFAULT 'PROFESSIONAL',
    "estimatedTokens" INTEGER,
    "actualTokens" INTEGER,
    "cost" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProductJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProductSEO" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "generationId" UUID NOT NULL,
    "productId" UUID,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "readability" INTEGER NOT NULL DEFAULT 0,
    "keywordDensity" DOUBLE PRECISION,
    "missingKeywords" TEXT[],
    "titleLength" INTEGER NOT NULL,
    "descriptionLength" INTEGER NOT NULL,
    "slugQuality" INTEGER NOT NULL,
    "headingStructure" JSONB NOT NULL,
    "imageOptimization" INTEGER NOT NULL,
    "suggestions" JSONB[],
    "oneClickFixes" JSONB[],
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProductSEO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProductImage" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "generationId" UUID,
    "productId" UUID,
    "originalUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "altText" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "backgroundRemoved" BOOLEAN NOT NULL DEFAULT false,
    "enhanced" BOOLEAN NOT NULL DEFAULT false,
    "compressed" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "dominantColors" TEXT[],
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProductPricing" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "generationId" UUID NOT NULL,
    "productId" UUID,
    "suggestedPrice" DOUBLE PRECISION NOT NULL,
    "profitMargin" DOUBLE PRECISION NOT NULL,
    "shippingEstimate" DOUBLE PRECISION,
    "competitorPrice" DOUBLE PRECISION,
    "discountPrice" DOUBLE PRECISION,
    "wholesalePrice" DOUBLE PRECISION,
    "taxEstimate" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "pricingStrategy" JSONB,
    "marketAnalysis" JSONB,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProductPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProductCategory" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "generationId" UUID NOT NULL,
    "categoryId" UUID,
    "detectedCategory" TEXT NOT NULL,
    "detectedSubcategory" TEXT,
    "tags" TEXT[],
    "attributes" JSONB,
    "collections" TEXT[],
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIBulkImport" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "fileUrl" TEXT,
    "totalItems" INTEGER NOT NULL,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "status" "AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "inputFormat" TEXT NOT NULL,
    "mapping" JSONB,
    "results" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIBulkImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProductAnalytics" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalGenerated" INTEGER NOT NULL DEFAULT 0,
    "totalPublished" INTEGER NOT NULL DEFAULT 0,
    "averageQuality" DOUBLE PRECISION,
    "averageSeoScore" DOUBLE PRECISION,
    "generationTime" INTEGER,
    "aiUsage" JSONB,
    "costPerProduct" DOUBLE PRECISION,
    "topCategories" JSONB,
    "modelUsage" JSONB,
    "languageUsage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProductAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIModelConfig_organizationId_key" ON "AIModelConfig"("organizationId");

-- CreateIndex
CREATE INDEX "AIModelConfig_organizationId_idx" ON "AIModelConfig"("organizationId");

-- CreateIndex
CREATE INDEX "AIProductJob_organizationId_status_createdAt_idx" ON "AIProductJob"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AIProductJob_userId_idx" ON "AIProductJob"("userId");

-- CreateIndex
CREATE INDEX "AIProductJob_generationId_idx" ON "AIProductJob"("generationId");

-- CreateIndex
CREATE INDEX "AIProductJob_priority_status_idx" ON "AIProductJob"("priority", "status");

-- CreateIndex
CREATE INDEX "AIProductJob_createdAt_idx" ON "AIProductJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIProductSEO_generationId_key" ON "AIProductSEO"("generationId");

-- CreateIndex
CREATE INDEX "AIProductSEO_organizationId_idx" ON "AIProductSEO"("organizationId");

-- CreateIndex
CREATE INDEX "AIProductSEO_generationId_idx" ON "AIProductSEO"("generationId");

-- CreateIndex
CREATE INDEX "AIProductSEO_productId_idx" ON "AIProductSEO"("productId");

-- CreateIndex
CREATE INDEX "AIProductImage_organizationId_idx" ON "AIProductImage"("organizationId");

-- CreateIndex
CREATE INDEX "AIProductImage_generationId_idx" ON "AIProductImage"("generationId");

-- CreateIndex
CREATE INDEX "AIProductImage_productId_idx" ON "AIProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "AIProductPricing_generationId_key" ON "AIProductPricing"("generationId");

-- CreateIndex
CREATE INDEX "AIProductPricing_organizationId_idx" ON "AIProductPricing"("organizationId");

-- CreateIndex
CREATE INDEX "AIProductPricing_generationId_idx" ON "AIProductPricing"("generationId");

-- CreateIndex
CREATE INDEX "AIProductPricing_productId_idx" ON "AIProductPricing"("productId");

-- CreateIndex
CREATE INDEX "AIProductCategory_organizationId_idx" ON "AIProductCategory"("organizationId");

-- CreateIndex
CREATE INDEX "AIProductCategory_generationId_idx" ON "AIProductCategory"("generationId");

-- CreateIndex
CREATE INDEX "AIProductCategory_categoryId_idx" ON "AIProductCategory"("categoryId");

-- CreateIndex
CREATE INDEX "AIBulkImport_organizationId_status_createdAt_idx" ON "AIBulkImport"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AIBulkImport_userId_idx" ON "AIBulkImport"("userId");

-- CreateIndex
CREATE INDEX "AIBulkImport_createdAt_idx" ON "AIBulkImport"("createdAt");

-- CreateIndex
CREATE INDEX "AIProductAnalytics_organizationId_idx" ON "AIProductAnalytics"("organizationId");

-- CreateIndex
CREATE INDEX "AIProductAnalytics_date_idx" ON "AIProductAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AIProductAnalytics_organizationId_date_key" ON "AIProductAnalytics"("organizationId", "date");

-- AddForeignKey
ALTER TABLE "AIModelConfig" ADD CONSTRAINT "AIModelConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductJob" ADD CONSTRAINT "AIProductJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductJob" ADD CONSTRAINT "AIProductJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductJob" ADD CONSTRAINT "AIProductJob_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductJob" ADD CONSTRAINT "AIProductJob_bulkImportId_fkey" FOREIGN KEY ("bulkImportId") REFERENCES "AIBulkImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductSEO" ADD CONSTRAINT "AIProductSEO_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductSEO" ADD CONSTRAINT "AIProductSEO_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductSEO" ADD CONSTRAINT "AIProductSEO_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductImage" ADD CONSTRAINT "AIProductImage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductImage" ADD CONSTRAINT "AIProductImage_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductImage" ADD CONSTRAINT "AIProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductPricing" ADD CONSTRAINT "AIProductPricing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductPricing" ADD CONSTRAINT "AIProductPricing_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductPricing" ADD CONSTRAINT "AIProductPricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductCategory" ADD CONSTRAINT "AIProductCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductCategory" ADD CONSTRAINT "AIProductCategory_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIBulkImport" ADD CONSTRAINT "AIBulkImport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIBulkImport" ADD CONSTRAINT "AIBulkImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProductAnalytics" ADD CONSTRAINT "AIProductAnalytics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
