-- AlterTable
ALTER TABLE "HeroBanner" ADD COLUMN     "impressions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "primaryButtonClicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "secondaryButtonClicks" INTEGER NOT NULL DEFAULT 0;
