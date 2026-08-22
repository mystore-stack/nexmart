/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customDomain]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

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
CREATE TYPE "AutomationType" AS ENUM ('ORDER_CONFIRMATION', 'ORDER_STATUS_UPDATE', 'INVENTORY_UPDATE', 'LOW_STOCK_ALERT', 'CART_ABANDONMENT', 'CART_RECOVERY', 'CUSTOMER_WELCOME', 'CUSTOMER_SEGMENTATION', 'REVIEW_REQUEST', 'LOYALTY_POINTS', 'REPORT_GENERATION', 'MARKETING_CAMPAIGN');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "CustomerSegmentType" AS ENUM ('NEW', 'REGULAR', 'VIP', 'INACTIVE', 'CHURNED');

-- CreateEnum
CREATE TYPE "ReviewRequestStatus" AS ENUM ('PENDING', 'RESPONDED', 'IGNORED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY_SALES', 'WEEKLY_SALES', 'MONTHLY_SALES', 'TOP_PRODUCTS', 'INACTIVE_PRODUCTS', 'CUSTOMER_ANALYTICS', 'INVENTORY_REPORT');

-- CreateEnum
CREATE TYPE "ReportFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('PRODUCT', 'CROSS_SELL', 'UPSELL', 'PERSONALIZED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'DELAYED', 'RETRYING');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRODUCT_VIEW', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'CHECKOUT_STARTED', 'CHECKOUT_COMPLETED', 'CHECKOUT_ABANDONED', 'PURCHASE', 'SEARCH_QUERY', 'FILTER_APPLIED', 'CATEGORY_VIEW', 'BRAND_VIEW', 'PROMOTION_CLICKED', 'RECOMMENDATION_CLICKED', 'WISHLIST_ADD', 'WISHLIST_REMOVE', 'REVIEW_SUBMITTED', 'LOGIN', 'LOGOUT', 'SIGNUP', 'PAGE_VIEW', 'SCROLL_DEPTH', 'TIME_ON_PAGE', 'ERROR');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('WEB', 'MOBILE_WEB', 'MOBILE_APP', 'API', 'WEBHOOK', 'EMAIL');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExperimentType" AS ENUM ('AB_TEST', 'MULTIVARIATE', 'SPLIT_URL', 'FEATURE_FLAG');

-- CreateEnum
CREATE TYPE "VariantType" AS ENUM ('CONTROL', 'VARIANT_A', 'VARIANT_B', 'VARIANT_C', 'VARIANT_D');

-- CreateEnum
CREATE TYPE "ExperimentGoal" AS ENUM ('ADD_TO_CART', 'CHECKOUT_STARTED', 'PURCHASE', 'SIGN_UP', 'PAGE_VIEW', 'BUTTON_CLICK', 'FORM_SUBMISSION');

-- CreateEnum
CREATE TYPE "PersonalizationType" AS ENUM ('PRODUCT_RECOMMENDATION', 'CATEGORY_RECOMMENDATION', 'PROMOTIONAL_OFFER', 'PRICING_DISCOUNT', 'CONTENT_LAYOUT', 'SEARCH_RESULTS');

-- CreateEnum
CREATE TYPE "PersonalizationTrigger" AS ENUM ('PAGE_VIEW', 'ADD_TO_CART', 'PURCHASE', 'SEARCH', 'TIME_ON_SITE', 'RETURNING_VISITOR', 'NEW_VISITOR');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('PERCENTAGE_DISCOUNT', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BOGO', 'BUNDLE_DISCOUNT');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('REVENUE', 'ORDERS', 'USERS', 'CONVERSION_RATE', 'AOV', 'LTV', 'CHURN_RATE', 'RETENTION_RATE');

-- CreateEnum
CREATE TYPE "TimeGranularity" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "CohortType" AS ENUM ('ACQUISITION', 'BEHAVIOR', 'DEMOGRAPHIC', 'GEOGRAPHIC');

-- CreateEnum
CREATE TYPE "ChurnRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RetentionCampaignType" AS ENUM ('EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'IN_APP_MESSAGE', 'DISCOUNT_OFFER', 'LOYALTY_REWARD');

-- CreateEnum
CREATE TYPE "RetentionCampaignStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PricingStrategy" AS ENUM ('COST_PLUS', 'COMPETITIVE', 'VALUE_BASED', 'DEMAND_BASED', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "BundleType" AS ENUM ('FIXED', 'FLEXIBLE', 'MIX_AND_MATCH');

-- CreateEnum
CREATE TYPE "RevenueActionType" AS ENUM ('PRICE_CHANGE', 'BUNDLE_CREATION', 'CROSS_SELL', 'UPSELL', 'PROMOTION');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'MULTI_CHANNEL');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('USER_SIGNUP', 'PURCHASE', 'ABANDONED_CART', 'BIRTHDAY', 'INACTIVITY', 'CUSTOM_EVENT');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "UsageMetric" AS ENUM ('API_CALLS', 'AI_REQUESTS', 'EMAILS_SENT', 'ORDERS_PROCESSED', 'STORAGE_BYTES', 'ACTIVE_USERS');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('WELCOME', 'ORDER_CONFIRMATION', 'ORDER_STATUS_UPDATE', 'SHIPPING_UPDATE', 'CART_ABANDONMENT_1', 'CART_ABANDONMENT_2', 'CART_ABANDONMENT_3', 'STOCK_ALERT', 'DAILY_SALES_REPORT', 'PASSWORD_RESET', 'PROMO', 'REVIEW_REQUEST', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'RETRYING');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "paymentMethods" "PaymentMethod"[],
ADD COLUMN     "planId" UUID,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionId" UUID,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

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
CREATE TABLE "AutomationLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "AutomationType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'COMPLETED',
    "metadata" JSONB,
    "error" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "duration" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "jobId" TEXT,
    "queueName" TEXT,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyPoints" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "tier" "LoyaltyTier" NOT NULL DEFAULT 'BRONZE',
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartAbandonment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cartSnapshot" JSONB NOT NULL,
    "cartValue" DOUBLE PRECISION NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "reminderSent1" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent2" BOOLEAN NOT NULL DEFAULT false,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "recoveredAt" TIMESTAMP(3),
    "abandonedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartAbandonment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSegment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "segment" "CustomerSegmentType" NOT NULL,
    "criteria" JSONB,
    "score" DOUBLE PRECISION,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "status" "ReviewRequestStatus" NOT NULL DEFAULT 'PENDING',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "ReportType" NOT NULL,
    "frequency" "ReportFrequency" NOT NULL,
    "recipients" TEXT[],
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueJob" (
    "id" UUID NOT NULL,
    "jobId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'WAITING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "failedReason" TEXT,
    "stacktrace" TEXT,
    "processedOn" TIMESTAMP(3),
    "finishedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorPattern" (
    "id" UUID NOT NULL,
    "errorType" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "stackSignature" TEXT NOT NULL,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,

    CONSTRAINT "ErrorPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "sessionId" UUID,
    "eventType" "EventType" NOT NULL,
    "eventSource" "EventSource" NOT NULL,
    "properties" JSONB NOT NULL,
    "productId" UUID,
    "categoryId" UUID,
    "orderId" UUID,
    "searchQuery" TEXT,
    "url" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSession" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "bounce" BOOLEAN NOT NULL DEFAULT true,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunnelStep" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "funnelName" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "eventType" "EventType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "timeWindow" INTEGER,

    CONSTRAINT "FunnelStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunnelAnalysis" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "funnelName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "step1Users" INTEGER NOT NULL,
    "step2Users" INTEGER NOT NULL,
    "step3Users" INTEGER NOT NULL,
    "step4Users" INTEGER NOT NULL,
    "step5Users" INTEGER NOT NULL,
    "step1Rate" DOUBLE PRECISION NOT NULL,
    "step2Rate" DOUBLE PRECISION NOT NULL,
    "step3Rate" DOUBLE PRECISION NOT NULL,
    "step4Rate" DOUBLE PRECISION NOT NULL,
    "overallRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FunnelAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ExperimentType" NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "trafficSplit" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "primaryGoal" "ExperimentGoal" NOT NULL,
    "secondaryGoals" JSONB NOT NULL,
    "targetAudience" JSONB,
    "excludeAudience" JSONB,
    "totalExposures" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "controlConversions" INTEGER NOT NULL DEFAULT 0,
    "variantConversions" INTEGER NOT NULL DEFAULT 0,
    "controlRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variantRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uplift" DOUBLE PRECISION,
    "statisticalSignificance" BOOLEAN NOT NULL DEFAULT false,
    "pValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentVariant" (
    "id" UUID NOT NULL,
    "experimentId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "VariantType" NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "exposures" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentExposure" (
    "id" UUID NOT NULL,
    "experimentId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "userId" UUID,
    "sessionId" UUID,
    "url" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "exposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "ExperimentExposure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "purchaseCount" INTEGER NOT NULL DEFAULT 0,
    "cartCount" INTEGER NOT NULL DEFAULT 0,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "preferredCategories" JSONB NOT NULL,
    "preferredPriceRange" JSONB NOT NULL,
    "preferredBrands" JSONB NOT NULL,
    "segment" TEXT,
    "loyaltyTier" TEXT,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchaseScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personalization" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "sessionId" UUID,
    "type" "PersonalizationType" NOT NULL,
    "trigger" "PersonalizationTrigger" NOT NULL,
    "config" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "targetSegments" JSONB,
    "excludeSegments" JSONB,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenueImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Personalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedOffer" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "OfferType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minPurchase" DOUBLE PRECISION,
    "maxDiscount" DOUBLE PRECISION,
    "applicableCategories" JSONB,
    "applicableProducts" JSONB,
    "targetSegments" JSONB,
    "loyaltyTiers" JSONB,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "revenueImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "PersonalizedOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsMetric" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "MetricType" NOT NULL,
    "granularity" "TimeGranularity" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "dimensions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortAnalysis" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "CohortType" NOT NULL,
    "name" TEXT NOT NULL,
    "cohortStart" TIMESTAMP(3) NOT NULL,
    "cohortEnd" TIMESTAMP(3) NOT NULL,
    "cohortSize" INTEGER NOT NULL,
    "retentionData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BICustomerSegment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "avgRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgLTV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BICustomerSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictiveModel" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "precision" DOUBLE PRECISION NOT NULL,
    "recall" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "coefficients" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainedAt" TIMESTAMP(3),

    CONSTRAINT "PredictiveModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurnPrediction" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "ChurnRiskLevel" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurnPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionCampaign" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RetentionCampaignType" NOT NULL,
    "status" "RetentionCampaignStatus" NOT NULL DEFAULT 'SCHEDULED',
    "targetSegments" JSONB,
    "targetRiskLevels" JSONB,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "offer" JSONB,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "convertedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionCampaignUser" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "RetentionCampaignUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicPrice" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "strategy" "PricingStrategy" NOT NULL,
    "demandFactor" DOUBLE PRECISION NOT NULL,
    "competitionFactor" DOUBLE PRECISION NOT NULL,
    "seasonalityFactor" DOUBLE PRECISION NOT NULL,
    "priceChangeCount" INTEGER NOT NULL DEFAULT 0,
    "revenueImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextReviewAt" TIMESTAMP(3),

    CONSTRAINT "DynamicPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBundle" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BundleType" NOT NULL,
    "bundlePrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "productIds" JSONB NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "revenueImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueAction" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "RevenueActionType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "actionData" JSONB NOT NULL,
    "executedAt" TIMESTAMP(3),
    "revenueImpact" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingCampaign" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "templateId" TEXT,
    "targetSegments" JSONB,
    "targetUsers" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "convertedCount" INTEGER NOT NULL DEFAULT 0,
    "revenueImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingWorkflow" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "executedCount" INTEGER NOT NULL DEFAULT 0,
    "convertedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" UUID,

    CONSTRAINT "MarketingWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignEvent" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "limits" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "stripePriceId" TEXT,
    "stripeYearlyPriceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "metric" "UsageMetric" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetPlans" JSONB,
    "targetOrganizations" JSONB,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "userId" UUID,
    "orderId" UUID,
    "type" "EmailType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartReminder" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cartSnapshot" JSONB NOT NULL,
    "cartValue" DOUBLE PRECISION NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "reminderSent1" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent1At" TIMESTAMP(3),
    "reminderSent2" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent2At" TIMESTAMP(3),
    "reminderSent3" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent3At" TIMESTAMP(3),
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "recoveredAt" TIMESTAMP(3),
    "abandonedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAlertLog" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "alertSentAt" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" UUID,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySalesReport" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "reportDate" DATE NOT NULL,
    "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topProducts" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "recipients" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySalesReport_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "AutomationLog_organizationId_idx" ON "AutomationLog"("organizationId");

-- CreateIndex
CREATE INDEX "AutomationLog_entityType_entityId_idx" ON "AutomationLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AutomationLog_executedAt_idx" ON "AutomationLog"("executedAt");

-- CreateIndex
CREATE INDEX "AutomationLog_organizationId_type_status_idx" ON "AutomationLog"("organizationId", "type", "status");

-- CreateIndex
CREATE INDEX "AutomationLog_status_executedAt_idx" ON "AutomationLog"("status", "executedAt");

-- CreateIndex
CREATE INDEX "AutomationLog_userId_executedAt_idx" ON "AutomationLog"("userId", "executedAt");

-- CreateIndex
CREATE INDEX "AutomationLog_jobId_idx" ON "AutomationLog"("jobId");

-- CreateIndex
CREATE INDEX "LoyaltyPoints_userId_idx" ON "LoyaltyPoints"("userId");

-- CreateIndex
CREATE INDEX "LoyaltyPoints_organizationId_idx" ON "LoyaltyPoints"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyPoints_userId_organizationId_key" ON "LoyaltyPoints"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "CartAbandonment_userId_idx" ON "CartAbandonment"("userId");

-- CreateIndex
CREATE INDEX "CartAbandonment_abandonedAt_idx" ON "CartAbandonment"("abandonedAt");

-- CreateIndex
CREATE INDEX "CartAbandonment_recovered_idx" ON "CartAbandonment"("recovered");

-- CreateIndex
CREATE INDEX "CustomerSegment_organizationId_idx" ON "CustomerSegment"("organizationId");

-- CreateIndex
CREATE INDEX "CustomerSegment_userId_idx" ON "CustomerSegment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSegment_organizationId_userId_key" ON "CustomerSegment"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "ReviewRequest_orderId_idx" ON "ReviewRequest"("orderId");

-- CreateIndex
CREATE INDEX "ReviewRequest_userId_idx" ON "ReviewRequest"("userId");

-- CreateIndex
CREATE INDEX "ReviewRequest_productId_idx" ON "ReviewRequest"("productId");

-- CreateIndex
CREATE INDEX "ReviewRequest_sentAt_idx" ON "ReviewRequest"("sentAt");

-- CreateIndex
CREATE INDEX "ReportSchedule_organizationId_idx" ON "ReportSchedule"("organizationId");

-- CreateIndex
CREATE INDEX "ReportSchedule_nextRunAt_idx" ON "ReportSchedule"("nextRunAt");

-- CreateIndex
CREATE INDEX "ReportSchedule_active_idx" ON "ReportSchedule"("active");

-- CreateIndex
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_productId_idx" ON "Recommendation"("productId");

-- CreateIndex
CREATE INDEX "Recommendation_score_idx" ON "Recommendation"("score");

-- CreateIndex
CREATE UNIQUE INDEX "QueueJob_jobId_key" ON "QueueJob"("jobId");

-- CreateIndex
CREATE INDEX "QueueJob_queueName_status_idx" ON "QueueJob"("queueName", "status");

-- CreateIndex
CREATE INDEX "QueueJob_status_createdAt_idx" ON "QueueJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QueueJob_queueName_createdAt_idx" ON "QueueJob"("queueName", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorPattern_stackSignature_key" ON "ErrorPattern"("stackSignature");

-- CreateIndex
CREATE INDEX "ErrorPattern_errorType_resolved_idx" ON "ErrorPattern"("errorType", "resolved");

-- CreateIndex
CREATE INDEX "ErrorPattern_occurrenceCount_idx" ON "ErrorPattern"("occurrenceCount");

-- CreateIndex
CREATE INDEX "ErrorPattern_lastSeenAt_idx" ON "ErrorPattern"("lastSeenAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_organizationId_occurredAt_idx" ON "AnalyticsEvent"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_occurredAt_idx" ON "AnalyticsEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_occurredAt_idx" ON "AnalyticsEvent"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_occurredAt_idx" ON "AnalyticsEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_occurredAt_idx" ON "AnalyticsEvent"("productId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_organizationId_eventType_occurredAt_idx" ON "AnalyticsEvent"("organizationId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_occurredAt_idx" ON "AnalyticsEvent"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSession_sessionId_key" ON "AnalyticsSession"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsSession_organizationId_startedAt_idx" ON "AnalyticsSession"("organizationId", "startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsSession_userId_startedAt_idx" ON "AnalyticsSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsSession_sessionId_idx" ON "AnalyticsSession"("sessionId");

-- CreateIndex
CREATE INDEX "FunnelStep_organizationId_funnelName_idx" ON "FunnelStep"("organizationId", "funnelName");

-- CreateIndex
CREATE UNIQUE INDEX "FunnelStep_organizationId_funnelName_stepName_key" ON "FunnelStep"("organizationId", "funnelName", "stepName");

-- CreateIndex
CREATE INDEX "FunnelAnalysis_organizationId_funnelName_startDate_idx" ON "FunnelAnalysis"("organizationId", "funnelName", "startDate");

-- CreateIndex
CREATE INDEX "Experiment_organizationId_status_idx" ON "Experiment"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Experiment_organizationId_type_idx" ON "Experiment"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Experiment_startDate_endDate_idx" ON "Experiment"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "ExperimentVariant_experimentId_idx" ON "ExperimentVariant"("experimentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentVariant_experimentId_type_key" ON "ExperimentVariant"("experimentId", "type");

-- CreateIndex
CREATE INDEX "ExperimentExposure_experimentId_userId_idx" ON "ExperimentExposure"("experimentId", "userId");

-- CreateIndex
CREATE INDEX "ExperimentExposure_experimentId_sessionId_idx" ON "ExperimentExposure"("experimentId", "sessionId");

-- CreateIndex
CREATE INDEX "ExperimentExposure_variantId_idx" ON "ExperimentExposure"("variantId");

-- CreateIndex
CREATE INDEX "ExperimentExposure_exposedAt_idx" ON "ExperimentExposure"("exposedAt");

-- CreateIndex
CREATE INDEX "UserProfile_organizationId_segment_idx" ON "UserProfile"("organizationId", "segment");

-- CreateIndex
CREATE INDEX "UserProfile_lastActivityAt_idx" ON "UserProfile"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "Personalization_organizationId_type_idx" ON "Personalization"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Personalization_userId_type_idx" ON "Personalization"("userId", "type");

-- CreateIndex
CREATE INDEX "Personalization_sessionId_type_idx" ON "Personalization"("sessionId", "type");

-- CreateIndex
CREATE INDEX "Personalization_expiresAt_idx" ON "Personalization"("expiresAt");

-- CreateIndex
CREATE INDEX "PersonalizedOffer_organizationId_type_idx" ON "PersonalizedOffer"("organizationId", "type");

-- CreateIndex
CREATE INDEX "PersonalizedOffer_startDate_endDate_idx" ON "PersonalizedOffer"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_organizationId_type_idx" ON "AnalyticsMetric"("organizationId", "type");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_periodStart_periodEnd_idx" ON "AnalyticsMetric"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsMetric_organizationId_type_granularity_periodStart_key" ON "AnalyticsMetric"("organizationId", "type", "granularity", "periodStart");

-- CreateIndex
CREATE INDEX "CohortAnalysis_organizationId_type_idx" ON "CohortAnalysis"("organizationId", "type");

-- CreateIndex
CREATE INDEX "CohortAnalysis_cohortStart_idx" ON "CohortAnalysis"("cohortStart");

-- CreateIndex
CREATE INDEX "BICustomerSegment_organizationId_idx" ON "BICustomerSegment"("organizationId");

-- CreateIndex
CREATE INDEX "PredictiveModel_organizationId_type_idx" ON "PredictiveModel"("organizationId", "type");

-- CreateIndex
CREATE INDEX "ChurnPrediction_organizationId_riskLevel_idx" ON "ChurnPrediction"("organizationId", "riskLevel");

-- CreateIndex
CREATE INDEX "ChurnPrediction_validUntil_idx" ON "ChurnPrediction"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "ChurnPrediction_userId_predictedAt_key" ON "ChurnPrediction"("userId", "predictedAt");

-- CreateIndex
CREATE INDEX "RetentionCampaign_organizationId_status_idx" ON "RetentionCampaign"("organizationId", "status");

-- CreateIndex
CREATE INDEX "RetentionCampaign_scheduledAt_idx" ON "RetentionCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "RetentionCampaignUser_campaignId_sent_idx" ON "RetentionCampaignUser"("campaignId", "sent");

-- CreateIndex
CREATE INDEX "RetentionCampaignUser_userId_idx" ON "RetentionCampaignUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionCampaignUser_campaignId_userId_key" ON "RetentionCampaignUser"("campaignId", "userId");

-- CreateIndex
CREATE INDEX "DynamicPrice_organizationId_strategy_idx" ON "DynamicPrice"("organizationId", "strategy");

-- CreateIndex
CREATE INDEX "DynamicPrice_nextReviewAt_idx" ON "DynamicPrice"("nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicPrice_productId_key" ON "DynamicPrice"("productId");

-- CreateIndex
CREATE INDEX "ProductBundle_organizationId_active_idx" ON "ProductBundle"("organizationId", "active");

-- CreateIndex
CREATE INDEX "RevenueAction_organizationId_type_idx" ON "RevenueAction"("organizationId", "type");

-- CreateIndex
CREATE INDEX "RevenueAction_executedAt_idx" ON "RevenueAction"("executedAt");

-- CreateIndex
CREATE INDEX "MarketingCampaign_organizationId_status_idx" ON "MarketingCampaign"("organizationId", "status");

-- CreateIndex
CREATE INDEX "MarketingCampaign_scheduledAt_idx" ON "MarketingCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "MarketingWorkflow_organizationId_active_idx" ON "MarketingWorkflow"("organizationId", "active");

-- CreateIndex
CREATE INDEX "MarketingWorkflow_triggerType_idx" ON "MarketingWorkflow"("triggerType");

-- CreateIndex
CREATE INDEX "CampaignEvent_campaignId_userId_idx" ON "CampaignEvent"("campaignId", "userId");

-- CreateIndex
CREATE INDEX "CampaignEvent_userId_eventType_idx" ON "CampaignEvent"("userId", "eventType");

-- CreateIndex
CREATE INDEX "CampaignEvent_occurredAt_idx" ON "CampaignEvent"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeYearlyPriceId_key" ON "Plan"("stripeYearlyPriceId");

-- CreateIndex
CREATE INDEX "Plan_active_idx" ON "Plan"("active");

-- CreateIndex
CREATE INDEX "UsageRecord_organizationId_metric_periodStart_idx" ON "UsageRecord"("organizationId", "metric", "periodStart");

-- CreateIndex
CREATE INDEX "UsageRecord_periodStart_periodEnd_idx" ON "UsageRecord"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");

-- CreateIndex
CREATE INDEX "FeatureFlag_category_idx" ON "FeatureFlag"("category");

-- CreateIndex
CREATE INDEX "EmailLog_organizationId_idx" ON "EmailLog"("organizationId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_orderId_idx" ON "EmailLog"("orderId");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_recipient_idx" ON "EmailLog"("recipient");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_organizationId_type_status_idx" ON "EmailLog"("organizationId", "type", "status");

-- CreateIndex
CREATE INDEX "CartReminder_userId_idx" ON "CartReminder"("userId");

-- CreateIndex
CREATE INDEX "CartReminder_abandonedAt_idx" ON "CartReminder"("abandonedAt");

-- CreateIndex
CREATE INDEX "CartReminder_recovered_idx" ON "CartReminder"("recovered");

-- CreateIndex
CREATE INDEX "CartReminder_reminderSent1_idx" ON "CartReminder"("reminderSent1");

-- CreateIndex
CREATE INDEX "CartReminder_reminderSent2_idx" ON "CartReminder"("reminderSent2");

-- CreateIndex
CREATE INDEX "CartReminder_reminderSent3_idx" ON "CartReminder"("reminderSent3");

-- CreateIndex
CREATE INDEX "StockAlertLog_organizationId_idx" ON "StockAlertLog"("organizationId");

-- CreateIndex
CREATE INDEX "StockAlertLog_productId_idx" ON "StockAlertLog"("productId");

-- CreateIndex
CREATE INDEX "StockAlertLog_alertSent_idx" ON "StockAlertLog"("alertSent");

-- CreateIndex
CREATE INDEX "StockAlertLog_acknowledged_idx" ON "StockAlertLog"("acknowledged");

-- CreateIndex
CREATE INDEX "StockAlertLog_resolved_idx" ON "StockAlertLog"("resolved");

-- CreateIndex
CREATE INDEX "StockAlertLog_createdAt_idx" ON "StockAlertLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StockAlertLog_productId_createdAt_key" ON "StockAlertLog"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "DailySalesReport_organizationId_idx" ON "DailySalesReport"("organizationId");

-- CreateIndex
CREATE INDEX "DailySalesReport_reportDate_idx" ON "DailySalesReport"("reportDate");

-- CreateIndex
CREATE INDEX "DailySalesReport_sent_idx" ON "DailySalesReport"("sent");

-- CreateIndex
CREATE UNIQUE INDEX "DailySalesReport_organizationId_reportDate_key" ON "DailySalesReport"("organizationId", "reportDate");

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
CREATE UNIQUE INDEX "Organization_subscriptionId_key" ON "Organization"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");

-- CreateIndex
CREATE INDEX "Organization_planId_idx" ON "Organization"("planId");

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
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "LoyaltyPoints" ADD CONSTRAINT "LoyaltyPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSegment" ADD CONSTRAINT "CustomerSegment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentVariant" ADD CONSTRAINT "ExperimentVariant_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentExposure" ADD CONSTRAINT "ExperimentExposure_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentExposure" ADD CONSTRAINT "ExperimentExposure_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ExperimentVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personalization" ADD CONSTRAINT "Personalization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personalization" ADD CONSTRAINT "Personalization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedOffer" ADD CONSTRAINT "PersonalizedOffer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsMetric" ADD CONSTRAINT "AnalyticsMetric_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortAnalysis" ADD CONSTRAINT "CohortAnalysis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BICustomerSegment" ADD CONSTRAINT "BICustomerSegment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictiveModel" ADD CONSTRAINT "PredictiveModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurnPrediction" ADD CONSTRAINT "ChurnPrediction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurnPrediction" ADD CONSTRAINT "ChurnPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionCampaign" ADD CONSTRAINT "RetentionCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionCampaignUser" ADD CONSTRAINT "RetentionCampaignUser_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "RetentionCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionCampaignUser" ADD CONSTRAINT "RetentionCampaignUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicPrice" ADD CONSTRAINT "DynamicPrice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicPrice" ADD CONSTRAINT "DynamicPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundle" ADD CONSTRAINT "ProductBundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueAction" ADD CONSTRAINT "RevenueAction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingWorkflow" ADD CONSTRAINT "MarketingWorkflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingWorkflow" ADD CONSTRAINT "MarketingWorkflow_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartReminder" ADD CONSTRAINT "CartReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertLog" ADD CONSTRAINT "StockAlertLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertLog" ADD CONSTRAINT "StockAlertLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySalesReport" ADD CONSTRAINT "DailySalesReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
