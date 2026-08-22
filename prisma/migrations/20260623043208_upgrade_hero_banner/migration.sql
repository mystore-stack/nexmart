/*
  Warnings:

  - You are about to drop the column `buttonLink` on the `HeroBanner` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText` on the `HeroBanner` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `HeroBanner` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `HeroBanner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HeroBanner" DROP COLUMN "buttonLink",
DROP COLUMN "buttonText",
DROP COLUMN "imageUrl",
DROP COLUMN "subtitle",
ADD COLUMN     "backgroundOverlayColor" TEXT,
ADD COLUMN     "badgeText" TEXT,
ADD COLUMN     "desktopImageUrl" TEXT,
ADD COLUMN     "highlightedText" TEXT,
ADD COLUMN     "primaryButtonLink" TEXT,
ADD COLUMN     "primaryButtonText" TEXT,
ADD COLUMN     "secondaryButtonLink" TEXT,
ADD COLUMN     "secondaryButtonText" TEXT;
