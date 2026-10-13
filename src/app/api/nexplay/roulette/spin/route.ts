// src/app/api/nexplay/roulette/spin/route.ts
// POST /api/nexplay/roulette/spin - Spin the roulette wheel (server-side random selection)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { getMoroccoDate, selectWeightedPrize, generateIdempotencyKey, getNextMoroccoMidnight } from '@/lib/nexplay';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const spinSchema = z.object({
  idempotencyKey: z.string().min(1).max(255).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);
    const body = await req.json();
    const validation = spinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { idempotencyKey: clientKey } = validation.data;
    const moroccoDate = getMoroccoDate();

    // If client provided idempotency key, check for existing result
    if (clientKey) {
      const existingSpin = await prisma.nexPlayRouletteSpin.findUnique({
        where: { idempotencyKey: clientKey },
      });

      if (existingSpin && existingSpin.userId === session.userId) {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          result: existingSpin.result,
          pointsEarned: existingSpin.result?.points || 0,
        });
      }
    }

    // Get active prizes
    const prizes = await prisma.nexPlayPrize.findMany({
      where: { active: true },
    });

    if (prizes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No prizes available', code: 'NO_PRIZES' },
        { status: 400 }
      );
    }

    // Server-side weighted random selection
    const selectedPrize = selectWeightedPrize(prizes);

    // Calculate points earned
    let pointsEarned = 0;
    if (selectedPrize.type === 'POINTS' && selectedPrize.value) {
      pointsEarned = selectedPrize.value;
    }

    // Record spin transactionally with unique constraint enforcement
    const result = await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.nexPlayWallet.findUnique({
        where: { userId: session.userId },
      });

      if (!wallet) {
        wallet = await tx.nexPlayWallet.create({
          data: {
            userId: session.userId,
            points: 0,
            level: 1,
            levelLabel: 'Débutant',
            nextLevel: 100,
          },
        });
      }

      // Create spin record - unique constraint on (userId, spinDate) enforces daily limit
      const spin = await tx.nexPlayRouletteSpin.create({
        data: {
          userId: session.userId,
          spinDate: moroccoDate,
          spinsUsed: 1,
          result: {
            prizeId: selectedPrize.id,
            type: selectedPrize.type,
            value: selectedPrize.value,
            label: selectedPrize.label,
          },
          prizeId: selectedPrize.id,
          walletId: wallet.id,
          idempotencyKey: clientKey || null,
        },
      });

      // Update wallet points if earned
      if (pointsEarned > 0) {
        const updatedWallet = await tx.nexPlayWallet.update({
          where: { id: wallet.id },
          data: { points: { increment: pointsEarned } },
        });

        // Record transaction
        await tx.nexPlayTransaction.create({
          data: {
            walletId: wallet.id,
            userId: session.userId,
            type: 'EARN',
            amount: pointsEarned,
            balanceAfter: updatedWallet.points,
            label: 'Roulette Win',
            metadata: { prizeId: selectedPrize.id, spinId: spin.id },
          },
        });

        return { spin, pointsEarned, wallet: updatedWallet };
      }

      return { spin, pointsEarned, wallet };
    });

    return NextResponse.json({
      success: true,
      result: result.spin.result,
      pointsEarned: result.pointsEarned,
      wallet: {
        points: result.wallet.points,
        level: result.wallet.level,
        levelLabel: result.wallet.levelLabel,
      },
      spinsLeft: result.spin.spinsUsed >= 1 ? 0 : 1,
    });
  } catch (error: any) {
    console.error('[NEXPLAY ROULETTE SPIN]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    if (error.code === 'P2002') {
      // Unique constraint violation (idempotency key)
      return NextResponse.json(
        { success: false, error: 'Duplicate request', code: 'DUPLICATE' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to process spin' },
      { status: 500 }
    );
  }
}
