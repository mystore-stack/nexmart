-- AlterTable
ALTER TABLE "HeroBanner" ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expireDate" TIMESTAMP(3),
ADD COLUMN     "heroHeight" TEXT NOT NULL DEFAULT '90vh',
ADD COLUMN     "heroPosition" TEXT NOT NULL DEFAULT 'center',
ADD COLUMN     "overlayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "primaryButtonColor" TEXT,
ADD COLUMN     "publishDate" TIMESTAMP(3),
ADD COLUMN     "secondaryButtonColor" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "textColor" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "HeroBanner_displayOrder_idx" ON "HeroBanner"("displayOrder");

-- CreateIndex
CREATE INDEX "HeroBanner_publishDate_idx" ON "HeroBanner"("publishDate");

-- CreateIndex
CREATE INDEX "HeroBanner_expireDate_idx" ON "HeroBanner"("expireDate");
