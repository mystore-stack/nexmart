-- AlterEnum
ALTER TYPE "PageBuilderPageType" ADD VALUE 'HOME';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PageSectionType" ADD VALUE 'HERO_SLIDER';
ALTER TYPE "PageSectionType" ADD VALUE 'CAMPAIGN_BANNER';
ALTER TYPE "PageSectionType" ADD VALUE 'SPONSORED_PRODUCTS';
ALTER TYPE "PageSectionType" ADD VALUE 'NEW_ARRIVALS';
ALTER TYPE "PageSectionType" ADD VALUE 'BEST_SELLERS';
ALTER TYPE "PageSectionType" ADD VALUE 'CATEGORY_GRID';
ALTER TYPE "PageSectionType" ADD VALUE 'COLLECTION_GRID';
ALTER TYPE "PageSectionType" ADD VALUE 'SHIPPING_BENEFITS';
ALTER TYPE "PageSectionType" ADD VALUE 'TRUST_BADGES';
ALTER TYPE "PageSectionType" ADD VALUE 'COUNTDOWN_OFFER';
ALTER TYPE "PageSectionType" ADD VALUE 'FOOTER_BANNER';
ALTER TYPE "PageSectionType" ADD VALUE 'VIDEO_BANNER';
ALTER TYPE "PageSectionType" ADD VALUE 'BRAND_SHOWCASE';
ALTER TYPE "PageSectionType" ADD VALUE 'FLASH_DEALS';
ALTER TYPE "PageSectionType" ADD VALUE 'MYSTERY_BOXES';
ALTER TYPE "PageSectionType" ADD VALUE 'BUY_MORE_SAVE_MORE';
ALTER TYPE "PageSectionType" ADD VALUE 'FREQUENTLY_BOUGHT_TOGETHER';
ALTER TYPE "PageSectionType" ADD VALUE 'BUILD_YOUR_OWN_BUNDLE';
ALTER TYPE "PageSectionType" ADD VALUE 'TRENDING_PRODUCTS';
ALTER TYPE "PageSectionType" ADD VALUE 'RECOMMENDED_PRODUCTS';
ALTER TYPE "PageSectionType" ADD VALUE 'RECENTLY_VIEWED';
ALTER TYPE "PageSectionType" ADD VALUE 'RECENTLY_ADDED';
ALTER TYPE "PageSectionType" ADD VALUE 'POPULAR_SEARCHES';
ALTER TYPE "PageSectionType" ADD VALUE 'INSTAGRAM_FEED';
ALTER TYPE "PageSectionType" ADD VALUE 'BLOG_POSTS';

-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PageSection_startDate_idx" ON "PageSection"("startDate");

-- CreateIndex
CREATE INDEX "PageSection_endDate_idx" ON "PageSection"("endDate");
