-- CreateEnum
CREATE TYPE "ThemeVersion" AS ENUM ('V1_CLASSIC', 'V2_MODERN', 'V3_PREMIUM', 'V4_MINIMAL', 'V5_LUXURY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HomepageSectionType" ADD VALUE 'SHOP_BY_CATEGORY';
ALTER TYPE "HomepageSectionType" ADD VALUE 'SUPER_DEALS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'BUNDLE_DEALS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'FOOTER';

-- CreateTable
CREATE TABLE "Theme" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "version" "ThemeVersion" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "colorPalette" JSONB NOT NULL DEFAULT '{}',
    "typography" JSONB NOT NULL DEFAULT '{}',
    "componentOverrides" JSONB NOT NULL DEFAULT '{}',
    "layoutSettings" JSONB NOT NULL DEFAULT '{}',
    "animations" JSONB NOT NULL DEFAULT '{}',
    "headerConfig" JSONB NOT NULL DEFAULT '{}',
    "footerConfig" JSONB NOT NULL DEFAULT '{}',
    "sectionStyles" JSONB NOT NULL DEFAULT '{}',
    "customCSS" TEXT,
    "customJS" TEXT,
    "previewImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Theme_organizationId_idx" ON "Theme"("organizationId");

-- CreateIndex
CREATE INDEX "Theme_isActive_idx" ON "Theme"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_organizationId_version_key" ON "Theme"("organizationId", "version");

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
