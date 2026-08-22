/*
  Warnings:

  - Added the required column `subtotal` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('PRODUCT', 'SUPER_DEAL', 'BUNDLE_DEAL', 'MYSTERY_BOX');

-- DropIndex
DROP INDEX "CartItem_userId_productId_variantId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "bundleDealId" UUID,
ADD COLUMN     "itemType" "CartItemType" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN     "mysteryBoxId" UUID,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "superDealId" UUID,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CartItem_itemType_idx" ON "CartItem"("itemType");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_superDealId_fkey" FOREIGN KEY ("superDealId") REFERENCES "SuperDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_bundleDealId_fkey" FOREIGN KEY ("bundleDealId") REFERENCES "BundleDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
