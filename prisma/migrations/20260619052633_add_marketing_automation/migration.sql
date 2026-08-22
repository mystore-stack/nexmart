-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmailType" ADD VALUE 'WELCOME_1';
ALTER TYPE "EmailType" ADD VALUE 'WELCOME_2';
ALTER TYPE "EmailType" ADD VALUE 'WELCOME_3';
ALTER TYPE "EmailType" ADD VALUE 'PRODUCT_RECOMMENDATION';

-- CreateTable
CREATE TABLE "WelcomeSeries" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "email1Sent" BOOLEAN NOT NULL DEFAULT false,
    "email1SentAt" TIMESTAMP(3),
    "email2Sent" BOOLEAN NOT NULL DEFAULT false,
    "email2SentAt" TIMESTAMP(3),
    "email3Sent" BOOLEAN NOT NULL DEFAULT false,
    "email3SentAt" TIMESTAMP(3),
    "email4Sent" BOOLEAN NOT NULL DEFAULT false,
    "email4SentAt" TIMESTAMP(3),
    "email5Sent" BOOLEAN NOT NULL DEFAULT false,
    "email5SentAt" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelcomeSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingSegment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB NOT NULL,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingSegmentMember" (
    "id" UUID NOT NULL,
    "segmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSegmentMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "segmentId" UUID,
    "scheduledFor" TIMESTAMP(3),
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTracking" (
    "id" UUID NOT NULL,
    "emailLogId" UUID NOT NULL,
    "campaignId" UUID,
    "userId" UUID,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "linkUrl" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "orderValue" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WelcomeSeries_userId_idx" ON "WelcomeSeries"("userId");

-- CreateIndex
CREATE INDEX "WelcomeSeries_organizationId_idx" ON "WelcomeSeries"("organizationId");

-- CreateIndex
CREATE INDEX "WelcomeSeries_email1Sent_idx" ON "WelcomeSeries"("email1Sent");

-- CreateIndex
CREATE INDEX "WelcomeSeries_email2Sent_idx" ON "WelcomeSeries"("email2Sent");

-- CreateIndex
CREATE INDEX "WelcomeSeries_email3Sent_idx" ON "WelcomeSeries"("email3Sent");

-- CreateIndex
CREATE INDEX "WelcomeSeries_email4Sent_idx" ON "WelcomeSeries"("email4Sent");

-- CreateIndex
CREATE INDEX "WelcomeSeries_email5Sent_idx" ON "WelcomeSeries"("email5Sent");

-- CreateIndex
CREATE INDEX "WelcomeSeries_completed_idx" ON "WelcomeSeries"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "WelcomeSeries_userId_key" ON "WelcomeSeries"("userId");

-- CreateIndex
CREATE INDEX "MarketingSegment_organizationId_idx" ON "MarketingSegment"("organizationId");

-- CreateIndex
CREATE INDEX "MarketingSegment_isActive_idx" ON "MarketingSegment"("isActive");

-- CreateIndex
CREATE INDEX "MarketingSegmentMember_segmentId_idx" ON "MarketingSegmentMember"("segmentId");

-- CreateIndex
CREATE INDEX "MarketingSegmentMember_userId_idx" ON "MarketingSegmentMember"("userId");

-- CreateIndex
CREATE INDEX "MarketingSegmentMember_organizationId_idx" ON "MarketingSegmentMember"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingSegmentMember_segmentId_userId_key" ON "MarketingSegmentMember"("segmentId", "userId");

-- CreateIndex
CREATE INDEX "EmailCampaign_organizationId_idx" ON "EmailCampaign"("organizationId");

-- CreateIndex
CREATE INDEX "EmailCampaign_scheduledFor_idx" ON "EmailCampaign"("scheduledFor");

-- CreateIndex
CREATE INDEX "EmailCampaign_sent_idx" ON "EmailCampaign"("sent");

-- CreateIndex
CREATE INDEX "EmailCampaign_status_idx" ON "EmailCampaign"("status");

-- CreateIndex
CREATE INDEX "EmailTracking_emailLogId_idx" ON "EmailTracking"("emailLogId");

-- CreateIndex
CREATE INDEX "EmailTracking_campaignId_idx" ON "EmailTracking"("campaignId");

-- CreateIndex
CREATE INDEX "EmailTracking_userId_idx" ON "EmailTracking"("userId");

-- CreateIndex
CREATE INDEX "EmailTracking_opened_idx" ON "EmailTracking"("opened");

-- CreateIndex
CREATE INDEX "EmailTracking_clicked_idx" ON "EmailTracking"("clicked");

-- CreateIndex
CREATE INDEX "EmailTracking_converted_idx" ON "EmailTracking"("converted");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTracking_emailLogId_key" ON "EmailTracking"("emailLogId");

-- AddForeignKey
ALTER TABLE "WelcomeSeries" ADD CONSTRAINT "WelcomeSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelcomeSeries" ADD CONSTRAINT "WelcomeSeries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingSegment" ADD CONSTRAINT "MarketingSegment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingSegmentMember" ADD CONSTRAINT "MarketingSegmentMember_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "MarketingSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingSegmentMember" ADD CONSTRAINT "MarketingSegmentMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingSegmentMember" ADD CONSTRAINT "MarketingSegmentMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "MarketingSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "EmailLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
