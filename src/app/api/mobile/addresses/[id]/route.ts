// src/app/api/mobile/addresses/[id]/route.ts
// Mobile address delete endpoint - Bearer token authentication
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * DELETE /api/mobile/addresses/[id]
 * Delete an address
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const { id } = await params;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = err instanceof MobileAuthError ? err.statusCode : 500;
    console.error('[MOBILE ADDRESSES] DELETE error:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
