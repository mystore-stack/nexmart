-- Migration: Add NexPlay Loyalty & Gamification System
-- This migration adds the NexPlay wallet, challenges, roulette, and coupon system

-- Create NexPlayWallet table
CREATE TABLE "NexPlayWallet" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "levelLabel" TEXT NOT NULL DEFAULT 'Débutant',
    "nextLevel" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NexPlayWallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NexPlayWallet_userId_key" ON "NexPlayWallet"("userId");

-- Add foreign key from NexPlayWallet to User
ALTER TABLE "NexPlayWallet" ADD CONSTRAINT "NexPlayWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create NexPlayTransaction table
CREATE TABLE "NexPlayTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "walletId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NexPlayTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NexPlayTransaction_walletId_idx" ON "NexPlayTransaction"("walletId");
CREATE INDEX "NexPlayTransaction_userId_idx" ON "NexPlayTransaction"("userId");
CREATE INDEX "NexPlayTransaction_createdAt_idx" ON "NexPlayTransaction"("createdAt");
CREATE INDEX "NexPlayTransaction_type_idx" ON "NexPlayTransaction"("type");

-- Create NexPlayChallenge table
CREATE TABLE "NexPlayChallenge" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "goal" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "dailyReset" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NexPlayChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NexPlayChallenge_active_idx" ON "NexPlayChallenge"("active");
CREATE INDEX "NexPlayChallenge_dailyReset_idx" ON "NexPlayChallenge"("dailyReset");
CREATE INDEX "NexPlayChallenge_validFrom_idx" ON "NexPlayChallenge"("validFrom");
CREATE INDEX "NexPlayChallenge_validUntil_idx" ON "NexPlayChallenge"("validUntil");

-- Create NexPlayChallengeCompletion table
CREATE TABLE "NexPlayChallengeCompletion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "dailyResetDate" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NexPlayChallengeCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NexPlayChallengeCompletion_userId_challengeId_dailyResetDate_key" ON "NexPlayChallengeCompletion"("userId", "challengeId", "dailyResetDate");
CREATE UNIQUE INDEX "nexplay_challenge_completion_idempotency_key" ON "NexPlayChallengeCompletion"("idempotencyKey");
CREATE INDEX "NexPlayChallengeCompletion_userId_idx" ON "NexPlayChallengeCompletion"("userId");
CREATE INDEX "NexPlayChallengeCompletion_challengeId_idx" ON "NexPlayChallengeCompletion"("challengeId");
CREATE INDEX "NexPlayChallengeCompletion_dailyResetDate_idx" ON "NexPlayChallengeCompletion"("dailyResetDate");
CREATE INDEX "NexPlayChallengeCompletion_completed_idx" ON "NexPlayChallengeCompletion"("completed");

-- Create NexPlayRouletteSpin table
CREATE TABLE "NexPlayRouletteSpin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "spinDate" TEXT NOT NULL,
    "spinsUsed" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "prizeId" UUID,
    "walletId" UUID NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NexPlayRouletteSpin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nexplay_roulette_spin_idempotency_key" ON "NexPlayRouletteSpin"("idempotencyKey");
CREATE UNIQUE INDEX "nexplay_roulette_spin_daily_limit" ON "NexPlayRouletteSpin"("userId", "spinDate");
CREATE INDEX "NexPlayRouletteSpin_userId_idx" ON "NexPlayRouletteSpin"("userId");
CREATE INDEX "NexPlayRouletteSpin_spinDate_idx" ON "NexPlayRouletteSpin"("spinDate");
CREATE INDEX "NexPlayRouletteSpin_walletId_idx" ON "NexPlayRouletteSpin"("walletId");

-- Create NexPlayPrize table
CREATE TABLE "NexPlayPrize" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NexPlayPrize_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NexPlayPrize_active_idx" ON "NexPlayPrize"("active");
CREATE INDEX "NexPlayPrize_weight_idx" ON "NexPlayPrize"("weight");

-- Create NexPlayCoupon table
CREATE TABLE "NexPlayCoupon" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "description" JSONB,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "cost" INTEGER NOT NULL,
    "minOrder" DOUBLE PRECISION,
    "validUntil" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "redemptionsCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NexPlayCoupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NexPlayCoupon_code_key" ON "NexPlayCoupon"("code");
CREATE INDEX "NexPlayCoupon_active_idx" ON "NexPlayCoupon"("active");
CREATE INDEX "NexPlayCoupon_validUntil_idx" ON "NexPlayCoupon"("validUntil");

-- Create NexPlayCouponRedemption table
CREATE TABLE "NexPlayCouponRedemption" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "couponId" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "idempotencyKey" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NexPlayCouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nexplay_coupon_redemption_idempotency_key" ON "NexPlayCouponRedemption"("idempotencyKey");
CREATE INDEX "NexPlayCouponRedemption_userId_idx" ON "NexPlayCouponRedemption"("userId");
CREATE INDEX "NexPlayCouponRedemption_couponId_idx" ON "NexPlayCouponRedemption"("couponId");
CREATE INDEX "NexPlayCouponRedemption_walletId_idx" ON "NexPlayCouponRedemption"("walletId");
CREATE INDEX "NexPlayCouponRedemption_redeemedAt_idx" ON "NexPlayCouponRedemption"("redeemedAt");

-- Create NexPlayMission table
CREATE TABLE "NexPlayMission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "reward" INTEGER NOT NULL,
    "goal" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NexPlayMission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NexPlayMission_type_idx" ON "NexPlayMission"("type");
CREATE INDEX "NexPlayMission_active_idx" ON "NexPlayMission"("active");

-- Add foreign keys
ALTER TABLE "NexPlayTransaction" ADD CONSTRAINT "NexPlayTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "NexPlayWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NexPlayChallengeCompletion" ADD CONSTRAINT "NexPlayChallengeCompletion_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "NexPlayChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NexPlayChallengeCompletion" ADD CONSTRAINT "NexPlayChallengeCompletion_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "NexPlayWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NexPlayRouletteSpin" ADD CONSTRAINT "NexPlayRouletteSpin_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "NexPlayWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NexPlayRouletteSpin" ADD CONSTRAINT "NexPlayRouletteSpin_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "NexPlayPrize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NexPlayCouponRedemption" ADD CONSTRAINT "NexPlayCouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "NexPlayCoupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NexPlayCouponRedemption" ADD CONSTRAINT "NexPlayCouponRedemption_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "NexPlayWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create enums
DO $$ BEGIN
    CREATE TYPE "NexPlayTransactionType" AS ENUM ('EARN', 'REDEEM', 'SPEND', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NexPlayPrizeType" AS ENUM ('POINTS', 'COUPON_PERCENT', 'COUPON_FIXED', 'DELIVERY', 'MISS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
