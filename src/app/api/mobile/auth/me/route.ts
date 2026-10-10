// src/app/api/mobile/auth/me/route.ts
// Mobile current user endpoint - Bearer token authentication
import { NextRequest, NextResponse } from 'next/server';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileAuth(req);

    // Get additional user data from database
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        organizationId: session.organizationId,
      },
    });
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('[MOBILE AUTH] Me endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
