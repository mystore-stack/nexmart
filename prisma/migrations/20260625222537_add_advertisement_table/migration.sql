-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'NexMart',
    "storeTagline" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "ogImageUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "businessHours" TEXT,
    "supportEmail" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT[],
    "siteUrl" TEXT,
    "twitterHandle" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr_MA',
    "primaryColor" TEXT NOT NULL DEFAULT '#0F766E',
    "secondaryColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "accentColor" TEXT,
    "themeColorLight" TEXT NOT NULL DEFAULT '#F5F1E8',
    "themeColorDark" TEXT NOT NULL DEFAULT '#0F172A',
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "freeShippingThreshold" DOUBLE PRECISION,
    "freeShippingMessage" TEXT,
    "searchPlaceholder" TEXT,
    "copyrightText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_organizationId_key" ON "SiteSettings"("organizationId");

-- CreateIndex
CREATE INDEX "SiteSettings_organizationId_idx" ON "SiteSettings"("organizationId");
