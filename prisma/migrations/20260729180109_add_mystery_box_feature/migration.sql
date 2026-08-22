/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('CHECKOUT_START', 'CHECKOUT_STEP_ADDRESS', 'CHECKOUT_STEP_PAYMENT', 'CHECKOUT_STEP_REVIEW', 'CHECKOUT_COMPLETE', 'CHECKOUT_ABANDONED', 'PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_RETRY', 'CART_VIEWED', 'CART_ITEM_ADDED', 'CART_ITEM_REMOVED', 'CART_ITEM_UPDATED', 'CART_CLEARED', 'COUPON_APPLIED', 'COUPON_REMOVED', 'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_CANCELLED', 'ORDER_REFUNDED', 'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'ADDRESS_ADDED', 'ADDRESS_UPDATED', 'CHECKOUT_ERROR', 'PAYMENT_ERROR', 'VALIDATION_ERROR', 'SYSTEM_ERROR');

-- CreateEnum
CREATE TYPE "AuditAlertType" AS ENUM ('FRAUD_DETECTED', 'ANOMALY_DETECTED', 'HIGH_VALUE_ORDER', 'RAPID_CHECKOUT', 'PAYMENT_FAILURE', 'STOCK_ISSUE', 'COUPON_ABUSE', 'SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('RESERVED', 'CONFIRMED', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'UNPAID';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "idempotencyKey" TEXT,
ALTER COLUMN "paymentStatus" SET DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "StripeWebhookEvent" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "orderId" UUID;

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "eventType" "AuditEventType" NOT NULL,
    "userId" UUID,
    "organizationId" UUID NOT NULL,
    "orderId" UUID,
    "cartSnapshot" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fraudScore" DOUBLE PRECISION DEFAULT 0,
    "anomalyFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "replayId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSession" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "organizationId" UUID NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "abandonedAt" TIMESTAMP(3),
    "conversionValue" DOUBLE PRECISION,
    "fraudScore" DOUBLE PRECISION DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "AuditSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditReplay" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "events" JSONB NOT NULL,
    "cartStates" JSONB NOT NULL,
    "replayData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replayedAt" TIMESTAMP(3),
    "replayedBy" UUID,

    CONSTRAINT "AuditReplay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAlert" (
    "id" UUID NOT NULL,
    "sessionId" UUID,
    "userId" UUID,
    "organizationId" UUID NOT NULL,
    "alertType" "AuditAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryReservation" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantId" UUID,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT,
    "orderId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" UUID NOT NULL,
    "orderId" UUID,
    "userId" UUID,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeBanner" (
    "id" UUID NOT NULL,
    "bannerType" TEXT NOT NULL DEFAULT 'HERO',
    "title" TEXT NOT NULL,
    "eyebrow" TEXT,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL DEFAULT '/products',
    "ctaText" TEXT NOT NULL DEFAULT 'Découvrir',
    "gradient" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" UUID NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "titleAccent" TEXT,
    "subtitle" TEXT,
    "cta" TEXT NOT NULL DEFAULT 'Explorer la boutique',
    "ctaSecondary" TEXT,
    "href" TEXT NOT NULL DEFAULT '/products',
    "hrefSecondary" TEXT,
    "badge" TEXT,
    "stat" TEXT,
    "statLabel" TEXT,
    "image" TEXT NOT NULL,
    "accentColor" TEXT DEFAULT '#0F766E',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoBannerItem" (
    "id" UUID NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Zap',
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "cta" TEXT NOT NULL DEFAULT 'Profiter',
    "href" TEXT NOT NULL DEFAULT '/products',
    "gradient" TEXT NOT NULL DEFAULT 'from-brand-800 via-brand-700 to-brand-600',
    "accentColor" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoBannerItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyNexMartValue" (
    "id" UUID NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Award',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stat" TEXT,
    "statLabel" TEXT,
    "color" TEXT NOT NULL DEFAULT 'from-brand-700 to-brand-600',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyNexMartValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileAppBanner" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Toute la marketplace premium directement sur votre smartphone.',
    "subtitle" TEXT,
    "appStoreUrl" TEXT,
    "googlePlayUrl" TEXT,
    "qrCodeImage" TEXT,
    "features" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileAppBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePromoCard" (
    "id" UUID NOT NULL,
    "cardKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "badgeText" TEXT,
    "discountPills" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePromoCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashDealItem" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 100,
    "image" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "maxStock" INTEGER NOT NULL DEFAULT 50,
    "countdownEndTime" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashDealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeServiceBanner" (
    "id" UUID NOT NULL,
    "bannerKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "highlightText" TEXT,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL DEFAULT 'En savoir plus',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeServiceBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsoredProduct" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "badgeText" TEXT NOT NULL DEFAULT 'Sponsored',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsoredProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BestsellerConfig" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 100,
    "image" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BestsellerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewArrivalConfig" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "badgeText" TEXT NOT NULL DEFAULT 'Nouveau',
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewArrivalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBoxConfig" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "startingPrice" DOUBLE PRECISION NOT NULL DEFAULT 199,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.9,
    "reviewCount" INTEGER NOT NULL DEFAULT 1000,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL DEFAULT '/products?tag=mystery-box',
    "ctaText" TEXT NOT NULL DEFAULT 'Découvrir',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MysteryBoxConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBox" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "oldPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minGuaranteedValue" DOUBLE PRECISION,
    "maxProfitPercent" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MysteryBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryItem" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "boxId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MysteryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBoxOpen" (
    "id" UUID NOT NULL,
    "boxId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "userId" UUID,
    "itemValue" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MysteryBoxOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleConfig" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'CRÉEZ VOTRE BUNDLE',
    "subtitle" TEXT NOT NULL DEFAULT 'Choisissez vos produits préférés et économisez jusqu''à 30%',
    "maxDiscountPercent" INTEGER NOT NULL DEFAULT 30,
    "items" JSONB,
    "ctaText" TEXT NOT NULL DEFAULT 'Créer mon bundle',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandPartner" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "fontStyle" TEXT,
    "iconText" TEXT,
    "link" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeature" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Truck',
    "colorClass" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePageSection" (
    "id" UUID NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterConfig" (
    "id" UUID NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT 'Newsletter exclusive',
    "title" TEXT NOT NULL DEFAULT 'Les meilleures offres, avant tout le monde.',
    "highlightTitle" TEXT DEFAULT 'avant tout le monde.',
    "description" TEXT NOT NULL DEFAULT 'Offres personnalisées, alertes de prix, tendances et promotions exclusives.',
    "placeholder" TEXT NOT NULL DEFAULT 'Votre adresse email',
    "buttonText" TEXT NOT NULL DEFAULT 'S''abonner',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterConfig" (
    "id" UUID NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT 'NexMart',
    "tagline" TEXT NOT NULL DEFAULT 'Maroc · Premium',
    "description" TEXT NOT NULL DEFAULT 'La marketplace premium du Maroc — shopping intelligent, artisanat authentique et expérience d''achat d''exception.',
    "address" TEXT NOT NULL DEFAULT 'Casablanca, Maroc',
    "phone" TEXT NOT NULL DEFAULT '+212 5XX-XXXXXX',
    "email" TEXT NOT NULL DEFAULT 'contact@nexmart.ma',
    "copyrightText" TEXT NOT NULL DEFAULT '© 2026 NexMart Maroc. Tous droits réservés.',
    "linkGroups" JSONB,
    "socials" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEvent_sessionId_idx" ON "AuditEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_idx" ON "AuditEvent"("eventType");

-- CreateIndex
CREATE INDEX "AuditEvent_userId_idx" ON "AuditEvent"("userId");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_idx" ON "AuditEvent"("organizationId");

-- CreateIndex
CREATE INDEX "AuditEvent_orderId_idx" ON "AuditEvent"("orderId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_fraudScore_idx" ON "AuditEvent"("fraudScore");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_createdAt_idx" ON "AuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditSession_userId_idx" ON "AuditSession"("userId");

-- CreateIndex
CREATE INDEX "AuditSession_organizationId_idx" ON "AuditSession"("organizationId");

-- CreateIndex
CREATE INDEX "AuditSession_startTime_idx" ON "AuditSession"("startTime");

-- CreateIndex
CREATE INDEX "AuditSession_endTime_idx" ON "AuditSession"("endTime");

-- CreateIndex
CREATE INDEX "AuditSession_fraudScore_idx" ON "AuditSession"("fraudScore");

-- CreateIndex
CREATE INDEX "AuditReplay_sessionId_idx" ON "AuditReplay"("sessionId");

-- CreateIndex
CREATE INDEX "AuditReplay_userId_idx" ON "AuditReplay"("userId");

-- CreateIndex
CREATE INDEX "AuditReplay_organizationId_idx" ON "AuditReplay"("organizationId");

-- CreateIndex
CREATE INDEX "AuditReplay_createdAt_idx" ON "AuditReplay"("createdAt");

-- CreateIndex
CREATE INDEX "AuditAlert_sessionId_idx" ON "AuditAlert"("sessionId");

-- CreateIndex
CREATE INDEX "AuditAlert_userId_idx" ON "AuditAlert"("userId");

-- CreateIndex
CREATE INDEX "AuditAlert_organizationId_idx" ON "AuditAlert"("organizationId");

-- CreateIndex
CREATE INDEX "AuditAlert_alertType_idx" ON "AuditAlert"("alertType");

-- CreateIndex
CREATE INDEX "AuditAlert_severity_idx" ON "AuditAlert"("severity");

-- CreateIndex
CREATE INDEX "AuditAlert_resolved_idx" ON "AuditAlert"("resolved");

-- CreateIndex
CREATE INDEX "AuditAlert_createdAt_idx" ON "AuditAlert"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryReservation_productId_idx" ON "InventoryReservation"("productId");

-- CreateIndex
CREATE INDEX "InventoryReservation_variantId_idx" ON "InventoryReservation"("variantId");

-- CreateIndex
CREATE INDEX "InventoryReservation_status_idx" ON "InventoryReservation"("status");

-- CreateIndex
CREATE INDEX "InventoryReservation_expiresAt_idx" ON "InventoryReservation"("expiresAt");

-- CreateIndex
CREATE INDEX "InventoryReservation_idempotencyKey_idx" ON "InventoryReservation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "InventoryReservation_orderId_idx" ON "InventoryReservation"("orderId");

-- CreateIndex
CREATE INDEX "NotificationLog_orderId_idx" ON "NotificationLog"("orderId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");

-- CreateIndex
CREATE INDEX "NotificationLog_channel_idx" ON "NotificationLog"("channel");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "HomeBanner_active_idx" ON "HomeBanner"("active");

-- CreateIndex
CREATE INDEX "HomeBanner_order_idx" ON "HomeBanner"("order");

-- CreateIndex
CREATE INDEX "HeroSlide_active_idx" ON "HeroSlide"("active");

-- CreateIndex
CREATE INDEX "HeroSlide_order_idx" ON "HeroSlide"("order");

-- CreateIndex
CREATE INDEX "PromoBannerItem_active_idx" ON "PromoBannerItem"("active");

-- CreateIndex
CREATE INDEX "PromoBannerItem_order_idx" ON "PromoBannerItem"("order");

-- CreateIndex
CREATE INDEX "WhyNexMartValue_active_idx" ON "WhyNexMartValue"("active");

-- CreateIndex
CREATE INDEX "WhyNexMartValue_order_idx" ON "WhyNexMartValue"("order");

-- CreateIndex
CREATE UNIQUE INDEX "HomePromoCard_cardKey_key" ON "HomePromoCard"("cardKey");

-- CreateIndex
CREATE INDEX "HomePromoCard_active_idx" ON "HomePromoCard"("active");

-- CreateIndex
CREATE INDEX "HomePromoCard_order_idx" ON "HomePromoCard"("order");

-- CreateIndex
CREATE INDEX "FlashDealItem_active_idx" ON "FlashDealItem"("active");

-- CreateIndex
CREATE INDEX "FlashDealItem_order_idx" ON "FlashDealItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "HomeServiceBanner_bannerKey_key" ON "HomeServiceBanner"("bannerKey");

-- CreateIndex
CREATE INDEX "HomeServiceBanner_active_idx" ON "HomeServiceBanner"("active");

-- CreateIndex
CREATE INDEX "SponsoredProduct_active_idx" ON "SponsoredProduct"("active");

-- CreateIndex
CREATE INDEX "SponsoredProduct_order_idx" ON "SponsoredProduct"("order");

-- CreateIndex
CREATE INDEX "BestsellerConfig_active_idx" ON "BestsellerConfig"("active");

-- CreateIndex
CREATE INDEX "BestsellerConfig_rank_idx" ON "BestsellerConfig"("rank");

-- CreateIndex
CREATE INDEX "NewArrivalConfig_active_idx" ON "NewArrivalConfig"("active");

-- CreateIndex
CREATE INDEX "NewArrivalConfig_order_idx" ON "NewArrivalConfig"("order");

-- CreateIndex
CREATE INDEX "MysteryBoxConfig_active_idx" ON "MysteryBoxConfig"("active");

-- CreateIndex
CREATE INDEX "MysteryBox_isActive_idx" ON "MysteryBox"("isActive");

-- CreateIndex
CREATE INDEX "MysteryBox_order_idx" ON "MysteryBox"("order");

-- CreateIndex
CREATE INDEX "MysteryItem_boxId_idx" ON "MysteryItem"("boxId");

-- CreateIndex
CREATE INDEX "MysteryItem_rarity_idx" ON "MysteryItem"("rarity");

-- CreateIndex
CREATE INDEX "MysteryBoxOpen_boxId_idx" ON "MysteryBoxOpen"("boxId");

-- CreateIndex
CREATE INDEX "MysteryBoxOpen_userId_idx" ON "MysteryBoxOpen"("userId");

-- CreateIndex
CREATE INDEX "MysteryBoxOpen_openedAt_idx" ON "MysteryBoxOpen"("openedAt");

-- CreateIndex
CREATE INDEX "BrandPartner_active_idx" ON "BrandPartner"("active");

-- CreateIndex
CREATE INDEX "BrandPartner_order_idx" ON "BrandPartner"("order");

-- CreateIndex
CREATE INDEX "HomeFeature_active_idx" ON "HomeFeature"("active");

-- CreateIndex
CREATE INDEX "HomeFeature_order_idx" ON "HomeFeature"("order");

-- CreateIndex
CREATE UNIQUE INDEX "HomePageSection_sectionKey_key" ON "HomePageSection"("sectionKey");

-- CreateIndex
CREATE INDEX "HomePageSection_order_idx" ON "HomePageSection"("order");

-- CreateIndex
CREATE INDEX "HomePageSection_active_idx" ON "HomePageSection"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentId_key" ON "Order"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Order_stripePaymentId_idx" ON "Order"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Order_organizationId_status_idx" ON "Order"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_eventId_idx" ON "StripeWebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_orderId_idx" ON "StripeWebhookEvent"("orderId");

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_replayId_fkey" FOREIGN KEY ("replayId") REFERENCES "AuditReplay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuditSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReplay" ADD CONSTRAINT "AuditReplay_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuditSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlert" ADD CONSTRAINT "AuditAlert_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuditSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeWebhookEvent" ADD CONSTRAINT "StripeWebhookEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryItem" ADD CONSTRAINT "MysteryItem_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "MysteryBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxOpen" ADD CONSTRAINT "MysteryBoxOpen_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "MysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxOpen" ADD CONSTRAINT "MysteryBoxOpen_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MysteryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxOpen" ADD CONSTRAINT "MysteryBoxOpen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
