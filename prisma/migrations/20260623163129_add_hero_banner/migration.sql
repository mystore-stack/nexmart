-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "uploadedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementBar" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#000000',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnouncementBar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageConfig" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "featuredCategories" TEXT[],
    "featuredProducts" TEXT[],
    "featuredBrands" TEXT[],
    "testimonials" JSONB[],
    "newsletterEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsletterTitle" TEXT,
    "newsletterSubtitle" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterConfig" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "socialLinks" JSONB[],
    "contactInfo" JSONB NOT NULL,
    "quickLinks" JSONB[],
    "legalLinks" JSONB[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "avatarUrl" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "content" TEXT NOT NULL,
    "productId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAsset_organizationId_idx" ON "MediaAsset"("organizationId");

-- CreateIndex
CREATE INDEX "MediaAsset_category_idx" ON "MediaAsset"("category");

-- CreateIndex
CREATE INDEX "MediaAsset_uploadedBy_idx" ON "MediaAsset"("uploadedBy");

-- CreateIndex
CREATE INDEX "AnnouncementBar_organizationId_idx" ON "AnnouncementBar"("organizationId");

-- CreateIndex
CREATE INDEX "AnnouncementBar_isActive_idx" ON "AnnouncementBar"("isActive");

-- CreateIndex
CREATE INDEX "AnnouncementBar_displayOrder_idx" ON "AnnouncementBar"("displayOrder");

-- CreateIndex
CREATE INDEX "HomepageConfig_organizationId_idx" ON "HomepageConfig"("organizationId");

-- CreateIndex
CREATE INDEX "HomepageConfig_isActive_idx" ON "HomepageConfig"("isActive");

-- CreateIndex
CREATE INDEX "FooterConfig_organizationId_idx" ON "FooterConfig"("organizationId");

-- CreateIndex
CREATE INDEX "FooterConfig_isActive_idx" ON "FooterConfig"("isActive");

-- CreateIndex
CREATE INDEX "Testimonial_organizationId_idx" ON "Testimonial"("organizationId");

-- CreateIndex
CREATE INDEX "Testimonial_isActive_idx" ON "Testimonial"("isActive");

-- CreateIndex
CREATE INDEX "Testimonial_productId_idx" ON "Testimonial"("productId");

-- CreateIndex
CREATE INDEX "Testimonial_displayOrder_idx" ON "Testimonial"("displayOrder");
