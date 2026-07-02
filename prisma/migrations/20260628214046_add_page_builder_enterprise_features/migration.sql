/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,path]` on the table `MediaFolder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `MediaFolder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PageBuilderPageType" AS ENUM ('FLASH_DEALS', 'BUNDLE_DEALS', 'FREQUENTLY_BOUGHT_TOGETHER', 'BUY_MORE_SAVE_MORE', 'MYSTERY_BOX', 'BUILD_YOUR_OWN_BUNDLE');

-- CreateEnum
CREATE TYPE "PageSectionType" AS ENUM ('HERO', 'ANNOUNCEMENT_BAR', 'PROMOTIONAL_BANNER', 'FEATURED_PRODUCTS', 'CATEGORIES', 'BENEFITS', 'COUNTDOWN_TIMER', 'TESTIMONIALS', 'FAQ', 'NEWSLETTER', 'CTA_BANNER', 'CUSTOM_HTML', 'VIDEO_SECTION', 'IMAGE_GALLERY', 'PRODUCT_GRID', 'PRODUCT_CAROUSEL', 'TEXT_BLOCK', 'SPACER', 'DIVIDER', 'ICON_GRID', 'BRAND_LOGOS', 'RICH_TEXT');

-- CreateEnum
CREATE TYPE "ProductSortBy" AS ENUM ('NEWEST', 'BEST_SELLING', 'HIGHEST_DISCOUNT', 'HIGHEST_RATING', 'FEATURED', 'RANDOM', 'MANUAL');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('ALL', 'DESKTOP_ONLY', 'TABLET_ONLY', 'MOBILE_ONLY');

-- AlterEnum
ALTER TYPE "CMSContentStatus" ADD VALUE 'REVIEW';

-- AlterTable
ALTER TABLE "MediaFolder" ADD COLUMN     "assetCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "path" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FrequentlyBoughtTogether" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "heroBannerColor" TEXT DEFAULT '#0F766E',
    "ctaText" TEXT DEFAULT 'Shop Now',
    "ctaUrl" TEXT,
    "sectionTitle" TEXT,
    "sectionDescription" TEXT,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrequentlyBoughtTogether_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequentlyBoughtTogetherProduct" (
    "id" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrequentlyBoughtTogetherProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyMoreSaveMore" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "heroBannerColor" TEXT DEFAULT '#0F766E',
    "ctaText" TEXT DEFAULT 'Shop Now',
    "ctaUrl" TEXT,
    "sectionTitle" TEXT,
    "sectionDescription" TEXT,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyMoreSaveMore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyMoreSaveMoreRule" (
    "id" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxDiscount" DOUBLE PRECISION,
    "applicableCategories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyMoreSaveMoreRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBox" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "heroBannerColor" TEXT DEFAULT '#0F766E',
    "ctaText" TEXT DEFAULT 'Buy Now',
    "ctaUrl" TEXT,
    "sectionTitle" TEXT,
    "sectionDescription" TEXT,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "price" DOUBLE PRECISION NOT NULL,
    "originalValue" DOUBLE PRECISION NOT NULL,
    "stockLimit" INTEGER,
    "stockRemaining" INTEGER NOT NULL DEFAULT 0,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MysteryBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBoxProduct" (
    "id" UUID NOT NULL,
    "boxId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MysteryBoxProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildYourOwnBundle" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "heroBannerColor" TEXT DEFAULT '#0F766E',
    "ctaText" TEXT DEFAULT 'Build Bundle',
    "ctaUrl" TEXT,
    "sectionTitle" TEXT,
    "sectionDescription" TEXT,
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "minProducts" INTEGER NOT NULL DEFAULT 2,
    "maxProducts" INTEGER NOT NULL DEFAULT 10,
    "baseDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildYourOwnBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildYourOwnBundleCategory" (
    "id" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildYourOwnBundleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildYourOwnBundleDiscountTier" (
    "id" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "minProducts" INTEGER NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildYourOwnBundleDiscountTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBuilderPage" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "pageType" "PageBuilderPageType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CMSContentStatus" NOT NULL DEFAULT 'DRAFT',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" TIMESTAMP(3),
    "unpublishDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "ogImage" TEXT,
    "twitterImage" TEXT,
    "accentColor" TEXT DEFAULT '#0F766E',
    "sectionBackground" TEXT DEFAULT '#ffffff',
    "buttonStyle" TEXT DEFAULT 'default',
    "cardStyle" TEXT DEFAULT 'default',
    "borderRadius" TEXT DEFAULT 'medium',
    "shadow" TEXT DEFAULT 'medium',
    "gradient" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBuilderPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSection" (
    "id" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "sectionType" "PageSectionType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "visibility" "Visibility" NOT NULL DEFAULT 'ALL',
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "backgroundImage" TEXT,
    "overlayColor" TEXT,
    "overlayOpacity" DOUBLE PRECISION DEFAULT 0,
    "layoutStyle" TEXT DEFAULT 'default',
    "themeVariant" TEXT DEFAULT 'light',
    "spacing" TEXT DEFAULT 'medium',
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBanner" (
    "id" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "image" TEXT NOT NULL,
    "mobileImage" TEXT,
    "link" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageAnalytics" (
    "id" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVersion" (
    "id" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "createdBy" UUID,
    "changeNote" TEXT,
    "snapshot" JSONB NOT NULL,
    "isAutoSave" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalComponent" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "componentType" "PageSectionType" NOT NULL,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_organizationId_idx" ON "FrequentlyBoughtTogether"("organizationId");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_status_idx" ON "FrequentlyBoughtTogether"("status");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_enabled_idx" ON "FrequentlyBoughtTogether"("enabled");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_featured_idx" ON "FrequentlyBoughtTogether"("featured");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_startDate_idx" ON "FrequentlyBoughtTogether"("startDate");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_endDate_idx" ON "FrequentlyBoughtTogether"("endDate");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_displayOrder_idx" ON "FrequentlyBoughtTogether"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FrequentlyBoughtTogether_organizationId_slug_key" ON "FrequentlyBoughtTogether"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogetherProduct_bundleId_idx" ON "FrequentlyBoughtTogetherProduct"("bundleId");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogetherProduct_productId_idx" ON "FrequentlyBoughtTogetherProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FrequentlyBoughtTogetherProduct_bundleId_productId_key" ON "FrequentlyBoughtTogetherProduct"("bundleId", "productId");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_organizationId_idx" ON "BuyMoreSaveMore"("organizationId");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_status_idx" ON "BuyMoreSaveMore"("status");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_enabled_idx" ON "BuyMoreSaveMore"("enabled");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_featured_idx" ON "BuyMoreSaveMore"("featured");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_startDate_idx" ON "BuyMoreSaveMore"("startDate");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_endDate_idx" ON "BuyMoreSaveMore"("endDate");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_displayOrder_idx" ON "BuyMoreSaveMore"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BuyMoreSaveMore_organizationId_slug_key" ON "BuyMoreSaveMore"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMoreRule_bundleId_idx" ON "BuyMoreSaveMoreRule"("bundleId");

-- CreateIndex
CREATE INDEX "MysteryBox_organizationId_idx" ON "MysteryBox"("organizationId");

-- CreateIndex
CREATE INDEX "MysteryBox_status_idx" ON "MysteryBox"("status");

-- CreateIndex
CREATE INDEX "MysteryBox_enabled_idx" ON "MysteryBox"("enabled");

-- CreateIndex
CREATE INDEX "MysteryBox_featured_idx" ON "MysteryBox"("featured");

-- CreateIndex
CREATE INDEX "MysteryBox_startDate_idx" ON "MysteryBox"("startDate");

-- CreateIndex
CREATE INDEX "MysteryBox_endDate_idx" ON "MysteryBox"("endDate");

-- CreateIndex
CREATE INDEX "MysteryBox_displayOrder_idx" ON "MysteryBox"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBox_organizationId_slug_key" ON "MysteryBox"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "MysteryBoxProduct_boxId_idx" ON "MysteryBoxProduct"("boxId");

-- CreateIndex
CREATE INDEX "MysteryBoxProduct_productId_idx" ON "MysteryBoxProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxProduct_boxId_productId_key" ON "MysteryBoxProduct"("boxId", "productId");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_organizationId_idx" ON "BuildYourOwnBundle"("organizationId");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_status_idx" ON "BuildYourOwnBundle"("status");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_enabled_idx" ON "BuildYourOwnBundle"("enabled");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_featured_idx" ON "BuildYourOwnBundle"("featured");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_startDate_idx" ON "BuildYourOwnBundle"("startDate");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_endDate_idx" ON "BuildYourOwnBundle"("endDate");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_displayOrder_idx" ON "BuildYourOwnBundle"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BuildYourOwnBundle_organizationId_slug_key" ON "BuildYourOwnBundle"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundleCategory_bundleId_idx" ON "BuildYourOwnBundleCategory"("bundleId");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundleCategory_categoryId_idx" ON "BuildYourOwnBundleCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BuildYourOwnBundleCategory_bundleId_categoryId_key" ON "BuildYourOwnBundleCategory"("bundleId", "categoryId");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundleDiscountTier_bundleId_idx" ON "BuildYourOwnBundleDiscountTier"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "BuildYourOwnBundleDiscountTier_bundleId_minProducts_key" ON "BuildYourOwnBundleDiscountTier"("bundleId", "minProducts");

-- CreateIndex
CREATE INDEX "PageBuilderPage_organizationId_idx" ON "PageBuilderPage"("organizationId");

-- CreateIndex
CREATE INDEX "PageBuilderPage_pageType_idx" ON "PageBuilderPage"("pageType");

-- CreateIndex
CREATE INDEX "PageBuilderPage_status_idx" ON "PageBuilderPage"("status");

-- CreateIndex
CREATE INDEX "PageBuilderPage_enabled_idx" ON "PageBuilderPage"("enabled");

-- CreateIndex
CREATE INDEX "PageBuilderPage_featured_idx" ON "PageBuilderPage"("featured");

-- CreateIndex
CREATE INDEX "PageBuilderPage_publishDate_idx" ON "PageBuilderPage"("publishDate");

-- CreateIndex
CREATE INDEX "PageBuilderPage_unpublishDate_idx" ON "PageBuilderPage"("unpublishDate");

-- CreateIndex
CREATE INDEX "PageBuilderPage_displayOrder_idx" ON "PageBuilderPage"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PageBuilderPage_organizationId_slug_key" ON "PageBuilderPage"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "PageSection_pageId_idx" ON "PageSection"("pageId");

-- CreateIndex
CREATE INDEX "PageSection_sectionType_idx" ON "PageSection"("sectionType");

-- CreateIndex
CREATE INDEX "PageSection_enabled_idx" ON "PageSection"("enabled");

-- CreateIndex
CREATE INDEX "PageSection_displayOrder_idx" ON "PageSection"("displayOrder");

-- CreateIndex
CREATE INDEX "PageBanner_pageId_idx" ON "PageBanner"("pageId");

-- CreateIndex
CREATE INDEX "PageBanner_organizationId_idx" ON "PageBanner"("organizationId");

-- CreateIndex
CREATE INDEX "PageBanner_active_idx" ON "PageBanner"("active");

-- CreateIndex
CREATE INDEX "PageBanner_startDate_idx" ON "PageBanner"("startDate");

-- CreateIndex
CREATE INDEX "PageBanner_endDate_idx" ON "PageBanner"("endDate");

-- CreateIndex
CREATE INDEX "PageBanner_priority_idx" ON "PageBanner"("priority");

-- CreateIndex
CREATE INDEX "PageAnalytics_pageId_idx" ON "PageAnalytics"("pageId");

-- CreateIndex
CREATE INDEX "PageAnalytics_date_idx" ON "PageAnalytics"("date");

-- CreateIndex
CREATE INDEX "PageAnalytics_views_idx" ON "PageAnalytics"("views");

-- CreateIndex
CREATE INDEX "PageAnalytics_orders_idx" ON "PageAnalytics"("orders");

-- CreateIndex
CREATE INDEX "PageAnalytics_revenue_idx" ON "PageAnalytics"("revenue");

-- CreateIndex
CREATE UNIQUE INDEX "PageAnalytics_pageId_date_key" ON "PageAnalytics"("pageId", "date");

-- CreateIndex
CREATE INDEX "PageVersion_pageId_idx" ON "PageVersion"("pageId");

-- CreateIndex
CREATE INDEX "PageVersion_createdAt_idx" ON "PageVersion"("createdAt");

-- CreateIndex
CREATE INDEX "PageVersion_isAutoSave_idx" ON "PageVersion"("isAutoSave");

-- CreateIndex
CREATE UNIQUE INDEX "PageVersion_pageId_versionNumber_key" ON "PageVersion"("pageId", "versionNumber");

-- CreateIndex
CREATE INDEX "GlobalComponent_organizationId_idx" ON "GlobalComponent"("organizationId");

-- CreateIndex
CREATE INDEX "GlobalComponent_componentType_idx" ON "GlobalComponent"("componentType");

-- CreateIndex
CREATE INDEX "GlobalComponent_enabled_idx" ON "GlobalComponent"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalComponent_organizationId_slug_key" ON "GlobalComponent"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_organizationId_path_key" ON "MediaFolder"("organizationId", "path");

-- AddForeignKey
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyBoughtTogether" ADD CONSTRAINT "FrequentlyBoughtTogether_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyBoughtTogetherProduct" ADD CONSTRAINT "FrequentlyBoughtTogetherProduct_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "FrequentlyBoughtTogether"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyBoughtTogetherProduct" ADD CONSTRAINT "FrequentlyBoughtTogetherProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyMoreSaveMore" ADD CONSTRAINT "BuyMoreSaveMore_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyMoreSaveMoreRule" ADD CONSTRAINT "BuyMoreSaveMoreRule_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BuyMoreSaveMore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBox" ADD CONSTRAINT "MysteryBox_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxProduct" ADD CONSTRAINT "MysteryBoxProduct_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "MysteryBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxProduct" ADD CONSTRAINT "MysteryBoxProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildYourOwnBundle" ADD CONSTRAINT "BuildYourOwnBundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildYourOwnBundleCategory" ADD CONSTRAINT "BuildYourOwnBundleCategory_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BuildYourOwnBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildYourOwnBundleCategory" ADD CONSTRAINT "BuildYourOwnBundleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildYourOwnBundleDiscountTier" ADD CONSTRAINT "BuildYourOwnBundleDiscountTier_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "BuildYourOwnBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBuilderPage" ADD CONSTRAINT "PageBuilderPage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PageBuilderPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBanner" ADD CONSTRAINT "PageBanner_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PageBuilderPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageAnalytics" ADD CONSTRAINT "PageAnalytics_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PageBuilderPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PageBuilderPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalComponent" ADD CONSTRAINT "GlobalComponent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
