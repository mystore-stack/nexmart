// src/app/api/nexplay/challenges/[challengeId]/participate/route.ts
// POST /api/nexplay/challenges/:challengeId/participate - Record progress toward a challenge
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { getMoroccoDate } from '@/lib/nexplay';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const participateSchema = z.object({
  progress: z.number().int().min(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const { challengeId } = await params;
    const body = await req.json();
    const validation = participateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { progress } = validation.data;
    const moroccoDate = getMoroccoDate();

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

    if (!challenge.active) {
      return NextResponse.json(
        { success: false, error: 'Challenge is not active', code: 'CHALLENGE_INACTIVE' },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await prisma.nexPlayWallet.findUnique({
      where: { userId: session.userId },
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
      });
    }

    // Get or create completion record
    const completion = await prisma.nexPlayChallengeCompletion.upsert({
      where: {
        userId_challengeId_dailyResetDate: {
          userId: session.userId,
          challengeId,
          dailyResetDate: moroccoDate,
        },
      },
      create: {
        userId: session.userId,
        challengeId,
        walletId: wallet.id,
        progress,
        completed: progress >= challenge.goal,
        completedAt: progress >= challenge.goal ? new Date() : null,
        dailyResetDate: moroccoDate,
      },
      update: {
        progress: Math.max(progress, 0),
        completed: progress >= challenge.goal,
        completedAt: progress >= challenge.goal ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      progress: completion.progress,
      completed: completion.completed,
      goal: challenge.goal,
      reward: challenge.reward,
    });
  } catch (error: any) {
    console.error('[NEXPLAY CHALLENGE PARTICIPATE]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to record progress' },
      { status: 500 }
    );
  }
}
