-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('HOMEPAGE_HERO', 'TOP_BANNER', 'BETWEEN_PRODUCT_SECTIONS', 'CATEGORY_PAGE', 'PRODUCT_PAGE', 'SIDEBAR', 'FOOTER', 'POPUP', 'FLOATING_BANNER');

-- CreateEnum
CREATE TYPE "PromoCampaignType" AS ENUM ('BLACK_FRIDAY', 'RAMADAN', 'EID', 'SUMMER_SALE', 'WINTER_SALE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "VisitorTarget" AS ENUM ('ALL', 'NEW_VISITORS', 'RETURNING_VISITORS', 'LOGGED_IN', 'GUEST');

-- CreateTable
CREATE TABLE "PromoCampaign" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PromoCampaignType" NOT NULL DEFAULT 'CUSTOM',
    "description" TEXT,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "bannerColor" TEXT,
    "metadata" JSONB,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "campaignId" UUID,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageDesktop" TEXT,
    "imageMobile" TEXT,
    "videoUrl" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#0F766E',
    "textColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "placement" "AdPlacement" NOT NULL DEFAULT 'HOMEPAGE_HERO',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetCountries" TEXT[],
    "targetLanguages" TEXT[],
    "targetDevices" "DeviceTarget" NOT NULL DEFAULT 'ALL',
    "visitorTarget" "VisitorTarget" NOT NULL DEFAULT 'ALL',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisementAnalytics" (
    "id" UUID NOT NULL,
    "adId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceType" TEXT,
    "country" TEXT,
    "sessionId" TEXT,
    "revenue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvertisementAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsoredProduct" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "badgeText" TEXT NOT NULL DEFAULT 'Sponsored',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsoredProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashDeal" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "campaignId" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "discountPercent" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoStart" BOOLEAN NOT NULL DEFAULT true,
    "autoEnd" BOOLEAN NOT NULL DEFAULT true,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashDealProduct" (
    "id" UUID NOT NULL,
    "flashDealId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "discountPercent" DOUBLE PRECISION,
    "discountPrice" DOUBLE PRECISION,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashDealProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCampaign_organizationId_slug_key" ON "PromoCampaign"("organizationId", "slug");
CREATE INDEX "PromoCampaign_organizationId_idx" ON "PromoCampaign"("organizationId");
CREATE INDEX "PromoCampaign_status_idx" ON "PromoCampaign"("status");
CREATE INDEX "PromoCampaign_type_idx" ON "PromoCampaign"("type");
CREATE INDEX "PromoCampaign_startDate_idx" ON "PromoCampaign"("startDate");
CREATE INDEX "PromoCampaign_endDate_idx" ON "PromoCampaign"("endDate");

CREATE INDEX "Advertisement_organizationId_idx" ON "Advertisement"("organizationId");
CREATE INDEX "Advertisement_campaignId_idx" ON "Advertisement"("campaignId");
CREATE INDEX "Advertisement_placement_idx" ON "Advertisement"("placement");
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");
CREATE INDEX "Advertisement_priority_idx" ON "Advertisement"("priority");
CREATE INDEX "Advertisement_startDate_idx" ON "Advertisement"("startDate");
CREATE INDEX "Advertisement_endDate_idx" ON "Advertisement"("endDate");

CREATE INDEX "AdvertisementAnalytics_adId_idx" ON "AdvertisementAnalytics"("adId");
CREATE INDEX "AdvertisementAnalytics_eventType_idx" ON "AdvertisementAnalytics"("eventType");
CREATE INDEX "AdvertisementAnalytics_createdAt_idx" ON "AdvertisementAnalytics"("createdAt");

CREATE UNIQUE INDEX "SponsoredProduct_organizationId_productId_key" ON "SponsoredProduct"("organizationId", "productId");
CREATE INDEX "SponsoredProduct_organizationId_idx" ON "SponsoredProduct"("organizationId");
CREATE INDEX "SponsoredProduct_productId_idx" ON "SponsoredProduct"("productId");
CREATE INDEX "SponsoredProduct_isActive_idx" ON "SponsoredProduct"("isActive");
CREATE INDEX "SponsoredProduct_priority_idx" ON "SponsoredProduct"("priority");
CREATE INDEX "SponsoredProduct_startDate_idx" ON "SponsoredProduct"("startDate");
CREATE INDEX "SponsoredProduct_endDate_idx" ON "SponsoredProduct"("endDate");

CREATE UNIQUE INDEX "FlashDeal_organizationId_slug_key" ON "FlashDeal"("organizationId", "slug");
CREATE INDEX "FlashDeal_organizationId_idx" ON "FlashDeal"("organizationId");
CREATE INDEX "FlashDeal_campaignId_idx" ON "FlashDeal"("campaignId");
CREATE INDEX "FlashDeal_status_idx" ON "FlashDeal"("status");
CREATE INDEX "FlashDeal_isActive_idx" ON "FlashDeal"("isActive");
CREATE INDEX "FlashDeal_startDate_idx" ON "FlashDeal"("startDate");
CREATE INDEX "FlashDeal_endDate_idx" ON "FlashDeal"("endDate");

CREATE UNIQUE INDEX "FlashDealProduct_flashDealId_productId_key" ON "FlashDealProduct"("flashDealId", "productId");
CREATE INDEX "FlashDealProduct_flashDealId_idx" ON "FlashDealProduct"("flashDealId");
CREATE INDEX "FlashDealProduct_productId_idx" ON "FlashDealProduct"("productId");

-- AddForeignKey
ALTER TABLE "PromoCampaign" ADD CONSTRAINT "PromoCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PromoCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdvertisementAnalytics" ADD CONSTRAINT "AdvertisementAnalytics_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SponsoredProduct" ADD CONSTRAINT "SponsoredProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SponsoredProduct" ADD CONSTRAINT "SponsoredProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashDeal" ADD CONSTRAINT "FlashDeal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashDeal" ADD CONSTRAINT "FlashDeal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PromoCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FlashDealProduct" ADD CONSTRAINT "FlashDealProduct_flashDealId_fkey" FOREIGN KEY ("flashDealId") REFERENCES "FlashDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashDealProduct" ADD CONSTRAINT "FlashDealProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
