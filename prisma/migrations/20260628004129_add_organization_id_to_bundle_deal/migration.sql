-- CreateEnum
CREATE TYPE "ProductImageType" AS ENUM ('MAIN', 'GALLERY', 'THUMBNAIL', 'LIFESTYLE', 'PACKAGING', 'DETAIL');

-- CreateEnum
CREATE TYPE "ProductImageView" AS ENUM ('FRONT', 'SIDE', 'BACK', 'TOP', 'FORTY_FIVE_DEGREE', 'CLOSE_UP', 'LIFESTYLE_SCENE', 'PACKAGING_SHOT');

-- CreateEnum
CREATE TYPE "ImageGenerationStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'APPROVED', 'REJECTED', 'RETRYING');

-- CreateEnum
CREATE TYPE "GoogleService" AS ENUM ('ANALYTICS', 'TAG_MANAGER', 'SEARCH_CONSOLE', 'MERCHANT_CENTER', 'BUSINESS_PROFILE', 'RECAPTCHA', 'MAPS', 'OAUTH');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR', 'PENDING', 'SYNCING');

-- CreateEnum
CREATE TYPE "FeedStatus" AS ENUM ('ACTIVE', 'PENDING', 'PROCESSING', 'ERROR', 'DISABLED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STORE', 'WAREHOUSE', 'DELIVERY_ZONE', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "SuperDealDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_ONE_GET_ONE');

-- CreateEnum
CREATE TYPE "SuperDealEventType" AS ENUM ('IMPRESSION', 'CLICK', 'ADD_TO_CART', 'PURCHASE', 'VIEW_DETAILS');

-- AlterTable
ALTER TABLE "AIProductImage" ADD COLUMN     "aspectRatio" DOUBLE PRECISION,
ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "cloudinarySecureUrl" TEXT,
ADD COLUMN     "cloudinaryUrl" TEXT,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "generationModel" TEXT,
ADD COLUMN     "generationPrompt" TEXT,
ADD COLUMN     "generationStatus" "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "imageTitle" TEXT,
ADD COLUMN     "imageType" "ProductImageType" NOT NULL DEFAULT 'MAIN',
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "largeUrl" TEXT,
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "mediumUrl" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "qualityScore" INTEGER,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seoFilename" TEXT,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "smallUrl" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3),
ADD COLUMN     "upscaled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" INTEGER,
ADD COLUMN     "viewType" "ProductImageView",
ALTER COLUMN "originalUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AuditEvent" ALTER COLUMN "sessionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GoogleIntegration" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "service" "GoogleService" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "error" TEXT,
    "healthScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAnalyticsEvent" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "integrationId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "userId" UUID,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleMerchantFeed" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "integrationId" UUID NOT NULL,
    "feedName" TEXT NOT NULL,
    "feedUrl" TEXT,
    "feedId" TEXT,
    "status" "FeedStatus" NOT NULL DEFAULT 'PENDING',
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "processedProducts" INTEGER NOT NULL DEFAULT 0,
    "lastGeneratedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleMerchantFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleOAuthAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleOAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleSearchConsoleSite" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT,
    "sitemapUrl" TEXT,
    "lastCrawlAt" TIMESTAMP(3),
    "crawlErrors" INTEGER NOT NULL DEFAULT 0,
    "indexedPages" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSearchConsoleSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleBusinessProfile" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "categories" TEXT[],
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleBusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleMapsLocation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "deliveryZone" JSONB,
    "warehouse" BOOLEAN NOT NULL DEFAULT false,
    "store" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleMapsLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedCategory" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "gradient" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Shop Now',
    "buttonUrl" TEXT,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperDeal" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "discountType" "SuperDealDiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "dealPrice" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "autoStart" BOOLEAN NOT NULL DEFAULT false,
    "autoEnd" BOOLEAN NOT NULL DEFAULT true,
    "countdown" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "flashSale" BOOLEAN NOT NULL DEFAULT false,
    "stockLimit" INTEGER,
    "image" TEXT,
    "bannerImage" TEXT,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "gradient" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Buy Now',
    "buttonUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "titleAr" TEXT,
    "titleFr" TEXT,
    "descriptionAr" TEXT,
    "descriptionFr" TEXT,
    "buttonTextAr" TEXT,
    "buttonTextFr" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperDealAnalytics" (
    "id" UUID NOT NULL,
    "superDealId" UUID NOT NULL,
    "eventType" "SuperDealEventType" NOT NULL,
    "sessionId" TEXT,
    "userId" UUID,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperDealAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleDeal" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bundlePrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "gradient" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Buy Bundle',
    "buttonUrl" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundleDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secureUrl" TEXT,
    "publicId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "resourceType" TEXT NOT NULL DEFAULT 'image',
    "folder" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedBy" UUID,
    "organizationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleProduct" (
    "id" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundleProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleIntegration_organizationId_idx" ON "GoogleIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "GoogleIntegration_service_idx" ON "GoogleIntegration"("service");

-- CreateIndex
CREATE INDEX "GoogleIntegration_status_idx" ON "GoogleIntegration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleIntegration_organizationId_service_key" ON "GoogleIntegration"("organizationId", "service");

-- CreateIndex
CREATE INDEX "GoogleAnalyticsEvent_organizationId_timestamp_idx" ON "GoogleAnalyticsEvent"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "GoogleAnalyticsEvent_integrationId_timestamp_idx" ON "GoogleAnalyticsEvent"("integrationId", "timestamp");

-- CreateIndex
CREATE INDEX "GoogleAnalyticsEvent_eventType_idx" ON "GoogleAnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "GoogleAnalyticsEvent_userId_idx" ON "GoogleAnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "GoogleMerchantFeed_organizationId_idx" ON "GoogleMerchantFeed"("organizationId");

-- CreateIndex
CREATE INDEX "GoogleMerchantFeed_integrationId_idx" ON "GoogleMerchantFeed"("integrationId");

-- CreateIndex
CREATE INDEX "GoogleMerchantFeed_status_idx" ON "GoogleMerchantFeed"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleMerchantFeed_organizationId_feedName_key" ON "GoogleMerchantFeed"("organizationId", "feedName");

-- CreateIndex
CREATE INDEX "GoogleOAuthAccount_email_idx" ON "GoogleOAuthAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleOAuthAccount_googleId_key" ON "GoogleOAuthAccount"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleOAuthAccount_userId_key" ON "GoogleOAuthAccount"("userId");

-- CreateIndex
CREATE INDEX "GoogleSearchConsoleSite_organizationId_idx" ON "GoogleSearchConsoleSite"("organizationId");

-- CreateIndex
CREATE INDEX "GoogleSearchConsoleSite_verified_idx" ON "GoogleSearchConsoleSite"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleSearchConsoleSite_organizationId_siteUrl_key" ON "GoogleSearchConsoleSite"("organizationId", "siteUrl");

-- CreateIndex
CREATE INDEX "GoogleBusinessProfile_organizationId_idx" ON "GoogleBusinessProfile"("organizationId");

-- CreateIndex
CREATE INDEX "GoogleBusinessProfile_verified_idx" ON "GoogleBusinessProfile"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleBusinessProfile_organizationId_placeId_key" ON "GoogleBusinessProfile"("organizationId", "placeId");

-- CreateIndex
CREATE INDEX "GoogleMapsLocation_organizationId_idx" ON "GoogleMapsLocation"("organizationId");

-- CreateIndex
CREATE INDEX "GoogleMapsLocation_locationType_idx" ON "GoogleMapsLocation"("locationType");

-- CreateIndex
CREATE INDEX "FeaturedCategory_categoryId_idx" ON "FeaturedCategory"("categoryId");

-- CreateIndex
CREATE INDEX "FeaturedCategory_enabled_idx" ON "FeaturedCategory"("enabled");

-- CreateIndex
CREATE INDEX "SuperDeal_organizationId_idx" ON "SuperDeal"("organizationId");

-- CreateIndex
CREATE INDEX "SuperDeal_productId_idx" ON "SuperDeal"("productId");

-- CreateIndex
CREATE INDEX "SuperDeal_enabled_idx" ON "SuperDeal"("enabled");

-- CreateIndex
CREATE INDEX "SuperDeal_startDate_idx" ON "SuperDeal"("startDate");

-- CreateIndex
CREATE INDEX "SuperDeal_endDate_idx" ON "SuperDeal"("endDate");

-- CreateIndex
CREATE INDEX "SuperDeal_featured_idx" ON "SuperDeal"("featured");

-- CreateIndex
CREATE INDEX "SuperDeal_order_idx" ON "SuperDeal"("order");

-- CreateIndex
CREATE INDEX "SuperDealAnalytics_superDealId_idx" ON "SuperDealAnalytics"("superDealId");

-- CreateIndex
CREATE INDEX "SuperDealAnalytics_eventType_idx" ON "SuperDealAnalytics"("eventType");

-- CreateIndex
CREATE INDEX "SuperDealAnalytics_createdAt_idx" ON "SuperDealAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "SuperDealAnalytics_userId_idx" ON "SuperDealAnalytics"("userId");

-- CreateIndex
CREATE INDEX "BundleDeal_enabled_idx" ON "BundleDeal"("enabled");

-- CreateIndex
CREATE INDEX "BundleDeal_organizationId_idx" ON "BundleDeal"("organizationId");

-- CreateIndex
CREATE INDEX "Media_organizationId_idx" ON "Media"("organizationId");

-- CreateIndex
CREATE INDEX "Media_uploadedBy_idx" ON "Media"("uploadedBy");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE INDEX "Media_folder_idx" ON "Media"("folder");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "BundleProduct_bundleId_idx" ON "BundleProduct"("bundleId");

-- CreateIndex
CREATE INDEX "BundleProduct_productId_idx" ON "BundleProduct"("productId");

-- CreateIndex
CREATE INDEX "AIProductImage_imageType_idx" ON "AIProductImage"("imageType");

-- CreateIndex
CREATE INDEX "AIProductImage_generationStatus_idx" ON "AIProductImage"("generationStatus");

-- CreateIndex
CREATE INDEX "AIProductImage_isMain_idx" ON "AIProductImage"("isMain");

-- CreateIndex
CREATE INDEX "AIProductImage_sortOrder_idx" ON "AIProductImage"("sortOrder");

-- AddForeignKey
ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "GoogleIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAnalyticsEvent" ADD CONSTRAINT "GoogleAnalyticsEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAnalyticsEvent" ADD CONSTRAINT "GoogleAnalyticsEvent_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "GoogleIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleMerchantFeed" ADD CONSTRAINT "GoogleMerchantFeed_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleMerchantFeed" ADD CONSTRAINT "GoogleMerchantFeed_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "GoogleIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleOAuthAccount" ADD CONSTRAINT "GoogleOAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSearchConsoleSite" ADD CONSTRAINT "GoogleSearchConsoleSite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleBusinessProfile" ADD CONSTRAINT "GoogleBusinessProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleMapsLocation" ADD CONSTRAINT "GoogleMapsLocation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedCategory" ADD CONSTRAINT "FeaturedCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperDeal" ADD CONSTRAINT "SuperDeal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperDeal" ADD CONSTRAINT "SuperDeal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperDealAnalytics" ADD CONSTRAINT "SuperDealAnalytics_superDealId_fkey" FOREIGN KEY ("superDealId") REFERENCES "SuperDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleProduct" ADD CONSTRAINT "BundleProduct_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BundleDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleProduct" ADD CONSTRAINT "BundleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
