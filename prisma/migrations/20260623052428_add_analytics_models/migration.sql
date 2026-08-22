-- CreateTable
CREATE TABLE "EventTracking" (
    "id" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" UUID,
    "productId" UUID,
    "categoryId" UUID,
    "bannerId" UUID,
    "orderId" UUID,
    "deviceType" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTest" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variantA" JSONB NOT NULL,
    "variantB" JSONB NOT NULL,
    "trafficSplit" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "winningVariant" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTestVariant" (
    "id" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "variant" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABTestVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "campaignId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "budget" DOUBLE PRECISION,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTracking_eventType_idx" ON "EventTracking"("eventType");

-- CreateIndex
CREATE INDEX "EventTracking_sessionId_idx" ON "EventTracking"("sessionId");

-- CreateIndex
CREATE INDEX "EventTracking_userId_idx" ON "EventTracking"("userId");

-- CreateIndex
CREATE INDEX "EventTracking_productId_idx" ON "EventTracking"("productId");

-- CreateIndex
CREATE INDEX "EventTracking_createdAt_idx" ON "EventTracking"("createdAt");

-- CreateIndex
CREATE INDEX "EventTracking_utmCampaign_idx" ON "EventTracking"("utmCampaign");

-- CreateIndex
CREATE INDEX "ABTest_status_idx" ON "ABTest"("status");

-- CreateIndex
CREATE INDEX "ABTest_startDate_idx" ON "ABTest"("startDate");

-- CreateIndex
CREATE INDEX "ABTest_endDate_idx" ON "ABTest"("endDate");

-- CreateIndex
CREATE INDEX "ABTestVariant_testId_idx" ON "ABTestVariant"("testId");

-- CreateIndex
CREATE INDEX "ABTestVariant_variant_idx" ON "ABTestVariant"("variant");

-- CreateIndex
CREATE INDEX "AdCampaign_platform_idx" ON "AdCampaign"("platform");

-- CreateIndex
CREATE INDEX "AdCampaign_status_idx" ON "AdCampaign"("status");

-- CreateIndex
CREATE INDEX "AdCampaign_startDate_idx" ON "AdCampaign"("startDate");

-- CreateIndex
CREATE INDEX "AdCampaign_endDate_idx" ON "AdCampaign"("endDate");

-- CreateIndex
CREATE INDEX "AdCampaign_utmCampaign_idx" ON "AdCampaign"("utmCampaign");

-- AddForeignKey
ALTER TABLE "EventTracking" ADD CONSTRAINT "EventTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTracking" ADD CONSTRAINT "EventTracking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTracking" ADD CONSTRAINT "EventTracking_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTracking" ADD CONSTRAINT "EventTracking_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTracking" ADD CONSTRAINT "EventTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ABTestVariant" ADD CONSTRAINT "ABTestVariant_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ABTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
