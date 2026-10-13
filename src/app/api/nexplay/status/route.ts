// src/app/api/nexplay/status/route.ts
// GET /api/nexplay/status - Returns user's NexPlay wallet, daily challenges, roulette eligibility
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { getMoroccoDate, getNextMoroccoMidnight } from '@/lib/nexplay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const moroccoDate = getMoroccoDate();

    // Get or create wallet
    let wallet = await prisma.nexPlayWallet.findUnique({
      where: { userId: session.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.nexPlayWallet.create({
        data: {
          userId: session.userId,
          points: 0,
          level: 1,
          levelLabel: 'Débutant',
          nextLevel: 100,
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    // Get active daily challenges
    const challenges = await prisma.nexPlayChallenge.findMany({
      where: {
        active: true,
        dailyReset: true,
        AND: [
          { validFrom: { lte: new Date() } },
          { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
        ],
      },
    });

    // Get user's challenge completions for today
    const completions = await prisma.nexPlayChallengeCompletion.findMany({
      where: {
        userId: session.userId,
        dailyResetDate: moroccoDate,
      },
    });

    const completionMap = new Map(
      completions.map((c) => [c.challengeId, c])
    );

    const challengesWithStatus = challenges.map((challenge) => {
      const completion = completionMap.get(challenge.id);
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        reward: challenge.reward,
        goal: challenge.goal,
        progress: completion?.progress || 0,
        completed: completion?.completed || false,
        claimed: !!completion?.claimedAt,
      };
    });

    // Get roulette eligibility (1 free spin per day)
    const todaySpin = await prisma.nexPlayRouletteSpin.findFirst({
      where: {
        userId: session.userId,
        spinDate: moroccoDate,
      },
    });

    const rouletteEligible = !todaySpin || todaySpin.spinsUsed < 1;
    const spinsLeft = rouletteEligible ? 1 - (todaySpin?.spinsUsed || 0) : 0;

    // Get available coupons
    const coupons = await prisma.nexPlayCoupon.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
        ],
      },
    });

    // Get user's redeemed coupons
    const redemptions = await prisma.nexPlayCouponRedemption.findMany({
      where: { userId: session.userId },
      select: { couponId: true },
    });

    const redeemedIds = new Set(redemptions.map((r) => r.couponId));
    const availableCoupons = coupons
      .filter((c) => !redeemedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        code: c.code,
        label: c.label,
        description: c.description,
        type: c.type,
        value: c.value,
        cost: c.cost,
        validUntil: c.validUntil,
        canAfford: wallet.points >= c.cost,
      }));

    return NextResponse.json({
      success: true,
      wallet: {
        points: wallet.points,
        level: wallet.level,
        levelLabel: wallet.levelLabel,
        nextLevel: wallet.nextLevel,
      },
      challenges: challengesWithStatus,
      roulette: {
        eligible: rouletteEligible,
        spinsLeft,
        nextEligibleAt: !rouletteEligible ? getNextMoroccoMidnight().toISOString() : null,
      },
      coupons: availableCoupons,
    });
  } catch (error: any) {
    console.error('[NEXPLAY STATUS]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NexPlay status' },
      { status: 500 }
    );
  }
}
