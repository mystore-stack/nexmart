-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "bundleDealId" UUID,
ADD COLUMN     "itemType" "CartItemType" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN     "mysteryBoxId" UUID,
ADD COLUMN     "superDealId" UUID,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
