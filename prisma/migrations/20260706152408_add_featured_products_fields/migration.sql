/*
  Warnings:

  - You are about to drop the column `isActive` on the `AnnouncementBar` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `BuildYourOwnBundle` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `BundleDeal` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `BundleDeal` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `BuyMoreSaveMore` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `FeaturedCategory` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `FeaturedCategory` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `FlashDeal` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `FooterConfig` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `FrequentlyBoughtTogether` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `MysteryBox` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `SponsoredProduct` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `SuperDeal` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `SuperDeal` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Testimonial` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AnnouncementBar_isActive_idx";

-- DropIndex
DROP INDEX "Brand_isActive_idx";

-- DropIndex
DROP INDEX "BuildYourOwnBundle_enabled_idx";

-- DropIndex
DROP INDEX "BundleDeal_enabled_idx";

-- DropIndex
DROP INDEX "BuyMoreSaveMore_enabled_idx";

-- DropIndex
DROP INDEX "FeaturedCategory_enabled_idx";

-- DropIndex
DROP INDEX "FlashDeal_isActive_idx";

-- DropIndex
DROP INDEX "FooterConfig_isActive_idx";

-- DropIndex
DROP INDEX "FrequentlyBoughtTogether_enabled_idx";

-- DropIndex
DROP INDEX "MysteryBox_enabled_idx";

-- DropIndex
DROP INDEX "SponsoredProduct_isActive_idx";

-- DropIndex
DROP INDEX "SuperDeal_enabled_idx";

-- DropIndex
DROP INDEX "SuperDeal_order_idx";

-- DropIndex
DROP INDEX "Testimonial_isActive_idx";

-- AlterTable
ALTER TABLE "AnnouncementBar" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "BuildYourOwnBundle" DROP COLUMN "enabled",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "BundleDeal" DROP COLUMN "enabled",
DROP COLUMN "order",
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "BuyMoreSaveMore" DROP COLUMN "enabled",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FeaturedCategory" DROP COLUMN "enabled",
DROP COLUMN "order",
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FlashDeal" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FooterConfig" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FrequentlyBoughtTogether" DROP COLUMN "enabled",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MysteryBox" DROP COLUMN "enabled",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SponsoredProduct" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SuperDeal" DROP COLUMN "enabled",
DROP COLUMN "order",
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "AnnouncementBar_isVisible_idx" ON "AnnouncementBar"("isVisible");

-- CreateIndex
CREATE INDEX "Brand_isVisible_idx" ON "Brand"("isVisible");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_isVisible_idx" ON "BuildYourOwnBundle"("isVisible");

-- CreateIndex
CREATE INDEX "BundleDeal_isVisible_idx" ON "BundleDeal"("isVisible");

-- CreateIndex
CREATE INDEX "BundleDeal_isPublished_idx" ON "BundleDeal"("isPublished");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_isVisible_idx" ON "BuyMoreSaveMore"("isVisible");

-- CreateIndex
CREATE INDEX "FeaturedCategory_isVisible_idx" ON "FeaturedCategory"("isVisible");

-- CreateIndex
CREATE INDEX "FlashDeal_isVisible_idx" ON "FlashDeal"("isVisible");

-- CreateIndex
CREATE INDEX "FooterConfig_isVisible_idx" ON "FooterConfig"("isVisible");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_isVisible_idx" ON "FrequentlyBoughtTogether"("isVisible");

-- CreateIndex
CREATE INDEX "MysteryBox_isVisible_idx" ON "MysteryBox"("isVisible");

-- CreateIndex
CREATE INDEX "Product_isVisible_idx" ON "Product"("isVisible");

-- CreateIndex
CREATE INDEX "Product_displayOrder_idx" ON "Product"("displayOrder");

-- CreateIndex
CREATE INDEX "Product_featured_isVisible_published_idx" ON "Product"("featured", "isVisible", "published");

-- CreateIndex
CREATE INDEX "SponsoredProduct_isVisible_idx" ON "SponsoredProduct"("isVisible");

-- CreateIndex
CREATE INDEX "SuperDeal_isVisible_idx" ON "SuperDeal"("isVisible");

-- CreateIndex
CREATE INDEX "SuperDeal_displayOrder_idx" ON "SuperDeal"("displayOrder");

-- CreateIndex
CREATE INDEX "Testimonial_isVisible_idx" ON "Testimonial"("isVisible");
