-- CreateEnum
CREATE TYPE "AIProductGenerationKind" AS ENUM ('CREATE', 'OPTIMIZE_EXISTING', 'IMAGE_ANALYSIS', 'BULK_IMPORT');

-- CreateEnum
CREATE TYPE "AIProductGenerationStatus" AS ENUM ('DRAFT', 'READY', 'REVIEW_REQUIRED', 'PUBLISHED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AIProductPublishWorkflow" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'AUTO_PUBLISH');

-- CreateEnum
CREATE TYPE "ProductRevisionSource" AS ENUM ('AI_PRODUCT_MANAGER', 'MANUAL_EDIT', 'ROLLBACK');

-- CreateEnum
CREATE TYPE "ProductPublishingAction" AS ENUM ('DRAFT_CREATED', 'REVIEW_REQUESTED', 'AUTO_PUBLISHED', 'MANUALLY_PUBLISHED', 'UPDATED', 'ROLLED_BACK');

-- CreateTable
CREATE TABLE "AiProductGeneration" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID,
    "createdById" UUID,
    "kind" "AIProductGenerationKind" NOT NULL DEFAULT 'CREATE',
    "status" "AIProductGenerationStatus" NOT NULL DEFAULT 'DRAFT',
    "workflow" "AIProductPublishWorkflow" NOT NULL DEFAULT 'DRAFT',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB NOT NULL DEFAULT '{}',
    "imageAnalysis" JSONB NOT NULL DEFAULT '[]',
    "translations" JSONB NOT NULL DEFAULT '{}',
    "seo" JSONB NOT NULL DEFAULT '{}',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "qualityBreakdown" JSONB NOT NULL DEFAULT '{}',
    "suggestions" JSONB NOT NULL DEFAULT '[]',
    "selectedCategoryId" UUID,
    "selectedBrand" TEXT,
    "productType" TEXT,
    "revisionNote" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProductGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRevision" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "generationId" UUID,
    "createdById" UUID,
    "source" "ProductRevisionSource" NOT NULL DEFAULT 'AI_PRODUCT_MANAGER',
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPublishingHistory" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "generationId" UUID,
    "actorId" UUID,
    "workflow" "AIProductPublishWorkflow" NOT NULL,
    "action" "ProductPublishingAction" NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPublishingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiProductGeneration_organizationId_status_createdAt_idx" ON "AiProductGeneration"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AiProductGeneration_productId_idx" ON "AiProductGeneration"("productId");

-- CreateIndex
CREATE INDEX "AiProductGeneration_createdById_idx" ON "AiProductGeneration"("createdById");

-- CreateIndex
CREATE INDEX "AiProductGeneration_workflow_idx" ON "AiProductGeneration"("workflow");

-- CreateIndex
CREATE INDEX "ProductRevision_organizationId_createdAt_idx" ON "ProductRevision"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductRevision_generationId_idx" ON "ProductRevision"("generationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRevision_productId_version_key" ON "ProductRevision"("productId", "version");

-- CreateIndex
CREATE INDEX "ProductPublishingHistory_organizationId_createdAt_idx" ON "ProductPublishingHistory"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductPublishingHistory_productId_createdAt_idx" ON "ProductPublishingHistory"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductPublishingHistory_generationId_idx" ON "ProductPublishingHistory"("generationId");

-- CreateIndex
CREATE INDEX "ProductPublishingHistory_workflow_idx" ON "ProductPublishingHistory"("workflow");

-- AddForeignKey
ALTER TABLE "AiProductGeneration" ADD CONSTRAINT "AiProductGeneration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProductGeneration" ADD CONSTRAINT "AiProductGeneration_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProductGeneration" ADD CONSTRAINT "AiProductGeneration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPublishingHistory" ADD CONSTRAINT "ProductPublishingHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPublishingHistory" ADD CONSTRAINT "ProductPublishingHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPublishingHistory" ADD CONSTRAINT "ProductPublishingHistory_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiProductGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
