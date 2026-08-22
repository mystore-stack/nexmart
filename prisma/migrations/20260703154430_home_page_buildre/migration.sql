-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HomepageSectionType" ADD VALUE 'HEADER_NAVIGATION';
ALTER TYPE "HomepageSectionType" ADD VALUE 'ANNOUNCEMENT_BAR';
ALTER TYPE "HomepageSectionType" ADD VALUE 'HERO_SLIDER';
ALTER TYPE "HomepageSectionType" ADD VALUE 'PREMIUM_DISCOUNT_HERO';
ALTER TYPE "HomepageSectionType" ADD VALUE 'CAMPAIGN_BANNER';
ALTER TYPE "HomepageSectionType" ADD VALUE 'SPONSORED_PRODUCTS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'BEST_SELLERS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'TRENDING_PRODUCTS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'RECOMMENDED_PRODUCTS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'CATEGORY_GRID';
ALTER TYPE "HomepageSectionType" ADD VALUE 'COLLECTION_GRID';
ALTER TYPE "HomepageSectionType" ADD VALUE 'BRAND_SHOWCASE';
ALTER TYPE "HomepageSectionType" ADD VALUE 'PARTNER_BRANDS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'MYSTERY_BOXES';
ALTER TYPE "HomepageSectionType" ADD VALUE 'BUY_MORE_SAVE_MORE';
ALTER TYPE "HomepageSectionType" ADD VALUE 'FREQUENTLY_BOUGHT_TOGETHER';
ALTER TYPE "HomepageSectionType" ADD VALUE 'BUILD_YOUR_OWN_BUNDLE';
ALTER TYPE "HomepageSectionType" ADD VALUE 'COUNTDOWN_OFFER';
ALTER TYPE "HomepageSectionType" ADD VALUE 'PROMOTIONAL_BANNER';
ALTER TYPE "HomepageSectionType" ADD VALUE 'VIDEO_BANNER';
ALTER TYPE "HomepageSectionType" ADD VALUE 'INSTAGRAM_FEED';
ALTER TYPE "HomepageSectionType" ADD VALUE 'BLOG_POSTS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'TRUST_BADGES';
ALTER TYPE "HomepageSectionType" ADD VALUE 'DELIVERY_FEATURES';
ALTER TYPE "HomepageSectionType" ADD VALUE 'SHIPPING_BENEFITS';
ALTER TYPE "HomepageSectionType" ADD VALUE 'RECENTLY_VIEWED';
ALTER TYPE "HomepageSectionType" ADD VALUE 'RECENTLY_ADDED';
ALTER TYPE "HomepageSectionType" ADD VALUE 'POPULAR_SEARCHES';
ALTER TYPE "HomepageSectionType" ADD VALUE 'FOOTER_BANNER';

-- AlterTable
ALTER TABLE "AnnouncementBar" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "BuildYourOwnBundle" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "BuyMoreSaveMore" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FeaturedCategory" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FlashDeal" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FooterConfig" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FrequentlyBoughtTogether" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "HeroBanner" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MysteryBox" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "NavigationMenuItem" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SponsoredProduct" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SuperDeal" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "AnnouncementBar_isPublished_idx" ON "AnnouncementBar"("isPublished");

-- CreateIndex
CREATE INDEX "Brand_isPublished_idx" ON "Brand"("isPublished");

-- CreateIndex
CREATE INDEX "Brand_displayOrder_idx" ON "Brand"("displayOrder");

-- CreateIndex
CREATE INDEX "BuildYourOwnBundle_isPublished_idx" ON "BuildYourOwnBundle"("isPublished");

-- CreateIndex
CREATE INDEX "BuyMoreSaveMore_isPublished_idx" ON "BuyMoreSaveMore"("isPublished");

-- CreateIndex
CREATE INDEX "FeaturedCategory_isPublished_idx" ON "FeaturedCategory"("isPublished");

-- CreateIndex
CREATE INDEX "FlashDeal_isPublished_idx" ON "FlashDeal"("isPublished");

-- CreateIndex
CREATE INDEX "FlashDeal_displayOrder_idx" ON "FlashDeal"("displayOrder");

-- CreateIndex
CREATE INDEX "FooterConfig_isPublished_idx" ON "FooterConfig"("isPublished");

-- CreateIndex
CREATE INDEX "FooterConfig_displayOrder_idx" ON "FooterConfig"("displayOrder");

-- CreateIndex
CREATE INDEX "FrequentlyBoughtTogether_isPublished_idx" ON "FrequentlyBoughtTogether"("isPublished");

-- CreateIndex
CREATE INDEX "HeroBanner_isPublished_idx" ON "HeroBanner"("isPublished");

-- CreateIndex
CREATE INDEX "HomepageSection_isVisible_idx" ON "HomepageSection"("isVisible");

-- CreateIndex
CREATE INDEX "HomepageSection_isPublished_idx" ON "HomepageSection"("isPublished");

-- CreateIndex
CREATE INDEX "MysteryBox_isPublished_idx" ON "MysteryBox"("isPublished");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_isVisible_idx" ON "NavigationMenuItem"("isVisible");

-- CreateIndex
CREATE INDEX "NavigationMenuItem_isPublished_idx" ON "NavigationMenuItem"("isPublished");

-- CreateIndex
CREATE INDEX "PageSection_isPublished_idx" ON "PageSection"("isPublished");

-- CreateIndex
CREATE INDEX "SponsoredProduct_isPublished_idx" ON "SponsoredProduct"("isPublished");

-- CreateIndex
CREATE INDEX "SponsoredProduct_displayOrder_idx" ON "SponsoredProduct"("displayOrder");

-- CreateIndex
CREATE INDEX "SuperDeal_isPublished_idx" ON "SuperDeal"("isPublished");

-- CreateIndex
CREATE INDEX "Testimonial_isPublished_idx" ON "Testimonial"("isPublished");
