/*
  Warnings:

  - You are about to drop the column `helpful` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiConversation" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AiEvent" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AiMessage" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AiProductEmbedding" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "courier" TEXT,
ADD COLUMN     "estimatedDelivery" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "helpful",
DROP COLUMN "verified",
ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "orderId" UUID,
ADD COLUMN     "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OrderTracking" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "trackingNumber" TEXT,
    "courier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderTracking_orderId_idx" ON "OrderTracking"("orderId");

-- CreateIndex
CREATE INDEX "OrderTracking_status_idx" ON "OrderTracking"("status");

-- CreateIndex
CREATE INDEX "OrderTracking_createdAt_idx" ON "OrderTracking"("createdAt");

-- CreateIndex
CREATE INDEX "Review_orderId_idx" ON "Review"("orderId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTracking" ADD CONSTRAINT "OrderTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
