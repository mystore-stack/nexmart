-- CreateTable
CREATE TABLE "Campaign" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "autoActivate" BOOLEAN NOT NULL DEFAULT false,
    "autoExpire" BOOLEAN NOT NULL DEFAULT true,
    "badgeText" TEXT,
    "badgeColor" TEXT,
    "themeColor" TEXT,
    "bannerImage" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "countdownEnabled" BOOLEAN NOT NULL DEFAULT false,
    "countdownEnd" TIMESTAMP(3),
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignProduct" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "discountValue" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRule" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "ruleType" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "action" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAnalytics" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CampaignAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRanking" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "salesScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenueScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctrScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wishlistScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewsScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seasonalityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adminPriority" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPersonalization" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "favoriteCategories" TEXT[],
    "preferredPriceRange" JSONB,
    "browsingHistory" JSONB,
    "purchaseHistory" JSONB,
    "wishlistBehavior" JSONB,
    "searchHistory" JSONB,
    "clickPatterns" JSONB,
    "timePatterns" JSONB,
    "devicePreferences" JSONB,
    "locationData" JSONB,
    "segment" TEXT,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPersonalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MegaMenu" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MegaMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MegaMenuItem" (
    "id" UUID NOT NULL,
    "megaMenuId" UUID NOT NULL,
    "parentId" UUID,
    "label" TEXT NOT NULL,
    "link" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MegaMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MegaMenuFeaturedProduct" (
    "id" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MegaMenuFeaturedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_organizationId_idx" ON "Campaign"("organizationId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_isActive_idx" ON "Campaign"("isActive");

-- CreateIndex
CREATE INDEX "Campaign_startDate_endDate_idx" ON "Campaign"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Campaign_priority_idx" ON "Campaign"("priority");

-- CreateIndex
CREATE INDEX "CampaignProduct_campaignId_idx" ON "CampaignProduct"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignProduct_productId_idx" ON "CampaignProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignProduct_campaignId_productId_key" ON "CampaignProduct"("campaignId", "productId");

-- CreateIndex
CREATE INDEX "CampaignRule_campaignId_idx" ON "CampaignRule"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignAnalytics_campaignId_idx" ON "CampaignAnalytics"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignAnalytics_date_idx" ON "CampaignAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignAnalytics_campaignId_date_key" ON "CampaignAnalytics"("campaignId", "date");

-- CreateIndex
CREATE INDEX "ProductRanking_organizationId_idx" ON "ProductRanking"("organizationId");

-- CreateIndex
CREATE INDEX "ProductRanking_totalScore_idx" ON "ProductRanking"("totalScore");

-- CreateIndex
CREATE INDEX "ProductRanking_trendingScore_idx" ON "ProductRanking"("trendingScore");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRanking_productId_key" ON "ProductRanking"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalization_userId_key" ON "UserPersonalization"("userId");

-- CreateIndex
CREATE INDEX "UserPersonalization_userId_idx" ON "UserPersonalization"("userId");

-- CreateIndex
CREATE INDEX "UserPersonalization_segment_idx" ON "UserPersonalization"("segment");

-- CreateIndex
CREATE INDEX "MegaMenu_organizationId_idx" ON "MegaMenu"("organizationId");

-- CreateIndex
CREATE INDEX "MegaMenu_isEnabled_idx" ON "MegaMenu"("isEnabled");

-- CreateIndex
CREATE INDEX "MegaMenu_displayOrder_idx" ON "MegaMenu"("displayOrder");

-- CreateIndex
CREATE INDEX "MegaMenuItem_megaMenuId_idx" ON "MegaMenuItem"("megaMenuId");

-- CreateIndex
CREATE INDEX "MegaMenuItem_parentId_idx" ON "MegaMenuItem"("parentId");

-- CreateIndex
CREATE INDEX "MegaMenuItem_displayOrder_idx" ON "MegaMenuItem"("displayOrder");

-- CreateIndex
CREATE INDEX "MegaMenuFeaturedProduct_menuItemId_idx" ON "MegaMenuFeaturedProduct"("menuItemId");

-- CreateIndex
CREATE INDEX "MegaMenuFeaturedProduct_productId_idx" ON "MegaMenuFeaturedProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "MegaMenuFeaturedProduct_menuItemId_productId_key" ON "MegaMenuFeaturedProduct"("menuItemId", "productId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRule" ADD CONSTRAINT "CampaignRule_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAnalytics" ADD CONSTRAINT "CampaignAnalytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRanking" ADD CONSTRAINT "ProductRanking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MegaMenu" ADD CONSTRAINT "MegaMenu_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MegaMenuItem" ADD CONSTRAINT "MegaMenuItem_megaMenuId_fkey" FOREIGN KEY ("megaMenuId") REFERENCES "MegaMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MegaMenuItem" ADD CONSTRAINT "MegaMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MegaMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MegaMenuFeaturedProduct" ADD CONSTRAINT "MegaMenuFeaturedProduct_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MegaMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MegaMenuFeaturedProduct" ADD CONSTRAINT "MegaMenuFeaturedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
