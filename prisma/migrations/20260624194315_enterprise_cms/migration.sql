-- CreateEnum
CREATE TYPE "CMSContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "HomepageSectionType" AS ENUM ('HERO', 'FEATURED_PRODUCTS', 'CATEGORIES', 'FLASH_DEALS', 'NEW_ARRIVALS', 'BRANDS', 'TESTIMONIALS', 'FAQ', 'NEWSLETTER', 'CUSTOM_HTML', 'AI_RECOMMENDATIONS');

-- CreateEnum
CREATE TYPE "DeviceTarget" AS ENUM ('ALL', 'DESKTOP', 'MOBILE', 'TABLET');

-- CreateEnum
CREATE TYPE "NavigationMenuLocation" AS ENUM ('HEADER', 'FOOTER', 'MOBILE', 'SIDEBAR');

-- CreateEnum
CREATE TYPE "CmsAuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'SCHEDULE', 'DUPLICATE', 'ROLLBACK', 'REORDER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'EDITOR';
ALTER TYPE "Role" ADD VALUE 'MARKETING_MANAGER';

-- AlterTable
ALTER TABLE "AnnouncementBar" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "countdownEnd" TIMESTAMP(3),
ADD COLUMN     "ctaLink" TEXT,
ADD COLUMN     "ctaText" TEXT,
ADD COLUMN     "deviceTargeting" "DeviceTarget" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "dismissible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "geoTargeting" JSONB,
ADD COLUMN     "impressions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "CMSContentStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "stickyMode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- AlterTable
ALTER TABLE "FooterConfig" ADD COLUMN     "columns" JSONB[],
ADD COLUMN     "copyrightText" TEXT,
ADD COLUMN     "newsletterSettings" JSONB,
ADD COLUMN     "paymentIcons" JSONB[],
ADD COLUMN     "storeBadges" JSONB[],
ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "HeroBanner" ADD COLUMN     "abTestGroupId" UUID,
ADD COLUMN     "animationSettings" JSONB,
ADD COLUMN     "conversionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "ctaButtons" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "organizationId" UUID,
ADD COLUMN     "priorityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "revenueGenerated" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" "CMSContentStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "templateId" UUID;

-- AlterTable
ALTER TABLE "HomepageConfig" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "aiTags" TEXT[],
ADD COLUMN     "folderId" UUID,
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "webpUrl" TEXT;

-- CreateTable
CREATE TABLE "HeroBannerTemplate" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "config" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroBannerTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroBannerABTest" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "variantAId" UUID,
    "variantBId" UUID,
    "trafficSplit" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "winnerId" UUID,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroBannerABTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" UUID NOT NULL,
    "homepageId" UUID NOT NULL,
    "type" "HomepageSectionType" NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "templateId" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageVersion" (
    "id" UUID NOT NULL,
    "homepageId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "publishedBy" UUID,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomepageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementBarAnalytics" (
    "id" UUID NOT NULL,
    "barId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceType" TEXT,
    "country" TEXT,
    "sessionId" TEXT,
    "utmSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementBarAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFolder" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" UUID,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaUsage" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationMenu" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" "NavigationMenuLocation" NOT NULL DEFAULT 'HEADER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavigationMenuItem" (
    "id" UUID NOT NULL,
    "menuId" UUID NOT NULL,
    "parentId" UUID,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "icon" TEXT,
    "target" TEXT NOT NULL DEFAULT '_self',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "description" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsActivityLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" "CmsAuditAction" NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroBannerTemplate_organizationId_idx" ON "HeroBannerTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "HeroBannerABTest_organizationId_idx" ON "HeroBannerABTest"("organizationId");

-- CreateIndex
CREATE INDEX "HeroBannerABTest_status_idx" ON "HeroBannerABTest"("status");

-- CreateIndex
CREATE INDEX "HomepageSection_homepageId_idx" ON "HomepageSection"("homepageId");

-- CreateIndex
CREATE INDEX "HomepageSection_displayOrder_idx" ON "HomepageSection"("displayOrder");

-- CreateIndex
CREATE INDEX "HomepageSection_type_idx" ON "HomepageSection"("type");

-- CreateIndex
CREATE INDEX "HomepageVersion_homepageId_idx" ON "HomepageVersion"("homepageId");

-- CreateIndex
CREATE INDEX "HomepageVersion_version_idx" ON "HomepageVersion"("version");

-- CreateIndex
CREATE INDEX "AnnouncementBarAnalytics_barId_idx" ON "AnnouncementBarAnalytics"("barId");

-- CreateIndex
CREATE INDEX "AnnouncementBarAnalytics_eventType_idx" ON "AnnouncementBarAnalytics"("eventType");

-- CreateIndex
CREATE INDEX "AnnouncementBarAnalytics_createdAt_idx" ON "AnnouncementBarAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "MediaFolder_organizationId_idx" ON "MediaFolder"("organizationId");

-- CreateIndex
CREATE INDEX "MediaFolder_parentId_idx" ON "MediaFolder"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_organizationId_slug_key" ON "MediaFolder"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "MediaUsage_assetId_idx" ON "MediaUsage"("assetId");

-- CreateIndex
CREATE INDEX "MediaUsage_entityType_entityId_idx" ON "MediaUsage"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "NavigationMenu_organizationId_idx" ON "NavigationMenu"("organizationId");

-- CreateIndex
CREATE INDEX "NavigationMenu_location_idx" ON "NavigationMenu"("location");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_menuId_idx" ON "NavigationMenuItem"("menuId");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_parentId_idx" ON "NavigationMenuItem"("parentId");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_displayOrder_idx" ON "NavigationMenuItem"("displayOrder");

-- CreateIndex
CREATE INDEX "Brand_organizationId_idx" ON "Brand"("organizationId");

-- CreateIndex
CREATE INDEX "Brand_isActive_idx" ON "Brand"("isActive");

-- CreateIndex
CREATE INDEX "Brand_isFeatured_idx" ON "Brand"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_organizationId_slug_key" ON "Brand"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "CmsActivityLog_organizationId_idx" ON "CmsActivityLog"("organizationId");

-- CreateIndex
CREATE INDEX "CmsActivityLog_userId_idx" ON "CmsActivityLog"("userId");

-- CreateIndex
CREATE INDEX "CmsActivityLog_entityType_idx" ON "CmsActivityLog"("entityType");

-- CreateIndex
CREATE INDEX "CmsActivityLog_action_idx" ON "CmsActivityLog"("action");

-- CreateIndex
CREATE INDEX "CmsActivityLog_createdAt_idx" ON "CmsActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "AnnouncementBar_status_idx" ON "AnnouncementBar"("status");

-- CreateIndex
CREATE INDEX "HeroBanner_organizationId_idx" ON "HeroBanner"("organizationId");

-- CreateIndex
CREATE INDEX "HeroBanner_status_idx" ON "HeroBanner"("status");

-- CreateIndex
CREATE INDEX "HeroBanner_priorityScore_idx" ON "HeroBanner"("priorityScore");

-- CreateIndex
CREATE INDEX "HomepageConfig_status_idx" ON "HomepageConfig"("status");

-- CreateIndex
CREATE INDEX "MediaAsset_folderId_idx" ON "MediaAsset"("folderId");

-- AddForeignKey
ALTER TABLE "HeroBanner" ADD CONSTRAINT "HeroBanner_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "HeroBannerTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBanner" ADD CONSTRAINT "HeroBanner_abTestGroupId_fkey" FOREIGN KEY ("abTestGroupId") REFERENCES "HeroBannerABTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "HomepageConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageVersion" ADD CONSTRAINT "HomepageVersion_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "HomepageConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementBarAnalytics" ADD CONSTRAINT "AnnouncementBarAnalytics_barId_fkey" FOREIGN KEY ("barId") REFERENCES "AnnouncementBar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MediaFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUsage" ADD CONSTRAINT "MediaUsage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationMenuItem" ADD CONSTRAINT "NavigationMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationMenuItem" ADD CONSTRAINT "NavigationMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavigationMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
