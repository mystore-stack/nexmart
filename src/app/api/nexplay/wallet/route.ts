// src/app/api/nexplay/wallet/route.ts
// GET /api/nexplay/wallet - Returns user's wallet and transaction history
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);

    // Get or create wallet
    let wallet = await prisma.nexPlayWallet.findUnique({
      where: { userId: session.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
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
            take: 20,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        points: wallet.points,
        level: wallet.level,
        levelLabel: wallet.levelLabel,
        nextLevel: wallet.nextLevel,
      },
      transactions: wallet.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        label: t.label,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('[NEXPLAY WALLET]', error);
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
