// src/app/api/nexplay/challenges/[challengeId]/complete/route.ts
// POST /api/nexplay/challenges/:challengeId/complete - Claim reward for completed challenge
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { getMoroccoDate, generateIdempotencyKey } from '@/lib/nexplay';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const completeSchema = z.object({
  idempotencyKey: z.string().min(1).max(255).optional(),
  evidence: z.any().refine(
    (val) => val === undefined || JSON.stringify(val).length <= 10000,
    'Evidence data too large (max 10KB)'
  ).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const { challengeId } = await params;
    const body = await req.json();
    const validation = completeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { idempotencyKey: clientKey, evidence } = validation.data;
    const moroccoDate = getMoroccoDate();

    // If client provided idempotency key, check for existing result
    if (clientKey) {
      const existingCompletion = await prisma.nexPlayChallengeCompletion.findUnique({
        where: { idempotencyKey: clientKey },
      });

      if (existingCompletion && existingCompletion.userId === session.userId) {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          reward: existingCompletion.claimedAt ? challenge.reward : 0,
        });
      }
    }

    // Get challenge
    const challenge = await prisma.nexPlayChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found', code: 'CHALLENGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get wallet
    const wallet = await prisma.nexPlayWallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found', code: 'WALLET_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get completion record
    const completion = await prisma.nexPlayChallengeCompletion.findUnique({
      where: {
        userId_challengeId_dailyResetDate: {
          userId: session.userId,
          challengeId,
          dailyResetDate: moroccoDate,
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { success: false, error: 'Challenge not started', code: 'NOT_STARTED' },
        { status: 400 }
      );
    }

    if (!completion.completed) {
      return NextResponse.json(
        { success: false, error: 'Challenge not completed', code: 'NOT_COMPLETED' },
        { status: 400 }
      );
    }

    if (completion.claimedAt) {
      return NextResponse.json(
        { success: false, error: 'Reward already claimed', code: 'ALREADY_CLAIMED' },
        { status: 400 }
      );
    }

    // Process reward transactionally
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet
      const updatedWallet = await tx.nexPlayWallet.update({
        where: { id: wallet.id },
        data: { points: { increment: challenge.reward } },
      });

      // Record transaction
      await tx.nexPlayTransaction.create({
        data: {
          walletId: wallet.id,
          userId: session.userId,
          type: 'EARN',
          amount: challenge.reward,
          balanceAfter: updatedWallet.points,
          label: `Challenge: ${challenge.title}`,
          metadata: { challengeId, challengeTitle: challenge.title, idempotencyKey: clientKey, evidence },
        },
      });

      // Mark as claimed and store evidence
      const updatedCompletion = await tx.nexPlayChallengeCompletion.update({
        where: { id: completion.id },
        data: {
          claimedAt: new Date(),
          idempotencyKey: clientKey || null,
        },
      });

      return { wallet: updatedWallet, completion: updatedCompletion };
    });

    return NextResponse.json({
      success: true,
      reward: challenge.reward,
      wallet: {
        points: result.wallet.points,
        level: result.wallet.level,
        levelLabel: result.wallet.levelLabel,
      },
    });
  } catch (error: any) {
    console.error('[NEXPLAY CHALLENGE COMPLETE]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    if (error.code === 'P2002') {
      // Unique constraint violation - concurrent duplicate claim
      return NextResponse.json(
        { success: false, error: 'Reward already claimed', code: 'ALREADY_CLAIMED' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to claim reward' },
      { status: 500 }
    );
  }
}
