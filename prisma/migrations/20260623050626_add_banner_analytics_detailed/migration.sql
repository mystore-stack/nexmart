-- CreateTable
CREATE TABLE "HeroBannerAnalytics" (
    "id" UUID NOT NULL,
    "bannerId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceType" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroBannerAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroBannerAnalytics_bannerId_idx" ON "HeroBannerAnalytics"("bannerId");

-- CreateIndex
CREATE INDEX "HeroBannerAnalytics_eventType_idx" ON "HeroBannerAnalytics"("eventType");

-- CreateIndex
CREATE INDEX "HeroBannerAnalytics_createdAt_idx" ON "HeroBannerAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "HeroBannerAnalytics_sessionId_idx" ON "HeroBannerAnalytics"("sessionId");

-- AddForeignKey
ALTER TABLE "HeroBannerAnalytics" ADD CONSTRAINT "HeroBannerAnalytics_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "HeroBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
