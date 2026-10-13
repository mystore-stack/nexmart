// src/app/api/nexplay/coupons/[couponId]/redeem/route.ts
// POST /api/nexplay/coupons/:couponId/redeem - Redeem a coupon with points
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';
import { generateIdempotencyKey } from '@/lib/nexplay';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const redeemSchema = z.object({
  idempotencyKey: z.string().min(1).max(255).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const { couponId } = await params;
    const body = await req.json();
    const validation = redeemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { idempotencyKey: clientKey } = validation.data;

    // Get wallet and coupon in parallel
    const [wallet, coupon] = await Promise.all([
      prisma.nexPlayWallet.findUnique({
        where: { userId: session.userId },
      }),
      prisma.nexPlayCoupon.findUnique({
        where: { id: couponId },
      }),
    ]);

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found', code: 'WALLET_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found', code: 'COUPON_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { success: false, error: 'Coupon is not active', code: 'COUPON_INACTIVE' },
        { status: 400 }
      );
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Coupon has expired', code: 'COUPON_EXPIRED' },
        { status: 400 }
      );
    }

    // If client provided idempotency key, check for existing result
    if (clientKey) {
      const existingRedemption = await prisma.nexPlayCouponRedemption.findUnique({
        where: { idempotencyKey: clientKey },
      });

      if (existingRedemption && existingRedemption.userId === session.userId) {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          couponCode: coupon.code,
          couponType: coupon.type,
          couponValue: coupon.value,
          wallet: {
            points: wallet.points,
            level: wallet.level,
            levelLabel: wallet.levelLabel,
          },
        });
      }
    }

    // Process redemption transactionally with atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Check and increment redemption count atomically
      if (coupon.maxRedemptions) {
        const updatedCoupon = await tx.$queryRaw<{ redemptionsCount: number }[]>`
          UPDATE "NexPlayCoupon"
          SET "redemptionsCount" = "redemptionsCount" + 1, "updatedAt" = NOW()
          WHERE "id" = $1 AND "redemptionsCount" < $2
          RETURNING "redemptionsCount"
        `([couponId, coupon.maxRedemptions]);

        if (!updatedCoupon || updatedCoupon.length === 0) {
          throw new Error('LIMIT_EXCEEDED');
        }
      } else {
        // No limit, just increment
        await tx.nexPlayCoupon.update({
          where: { id: couponId },
          data: { redemptionsCount: { increment: 1 } },
        });
      }

      // Atomic balance check and decrement using WHERE clause
      const updatedWallet = await tx.$queryRaw<{ points: number; level: string; levelLabel: string }[]>`
        UPDATE "NexPlayWallet"
        SET "points" = "points" - $1, "updatedAt" = NOW()
        WHERE "id" = $2 AND "points" >= $1
        RETURNING "points", "level", "levelLabel"
      `([coupon.cost, wallet.id]);

      if (!updatedWallet || updatedWallet.length === 0) {
        throw new Error('INSUFFICIENT_POINTS');
      }

      const walletData = updatedWallet[0];

      // Record transaction
      await tx.nexPlayTransaction.create({
        data: {
          walletId: wallet.id,
          userId: session.userId,
          type: 'REDEEM',
          amount: -coupon.cost,
          balanceAfter: walletData.points,
          label: `Coupon: ${coupon.code}`,
          metadata: { couponId, couponCode: coupon.code, idempotencyKey: clientKey },
        },
      });

      // Record redemption
      const redemption = await tx.nexPlayCouponRedemption.create({
        data: {
          userId: session.userId,
          couponId,
          walletId: wallet.id,
          idempotencyKey: clientKey || null,
        },
      });

      return { wallet: walletData, redemption };
    });

    return NextResponse.json({
      success: true,
      couponCode: coupon.code,
      couponType: coupon.type,
      couponValue: coupon.value,
      wallet: {
        points: result.wallet.points,
        level: result.wallet.level,
        levelLabel: result.wallet.levelLabel,
      },
    });
  } catch (error: any) {
    console.error('[NEXPLAY COUPON REDEEM]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Duplicate redemption', code: 'DUPLICATE' },
        { status: 409 }
      );
    }
    if (error.message === 'INSUFFICIENT_POINTS') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient points',
          code: 'INSUFFICIENT_POINTS',
          required: coupon.cost,
          available: wallet.points,
        },
        { status: 400 }
      );
    }
    if (error.message === 'LIMIT_EXCEEDED') {
      return NextResponse.json(
        { success: false, error: 'Coupon redemption limit reached', code: 'LIMIT_EXCEEDED' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to redeem coupon' },
      { status: 500 }
    );
  }
}
