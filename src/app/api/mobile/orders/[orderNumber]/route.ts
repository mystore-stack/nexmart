// src/app/api/mobile/orders/[orderNumber]/route.ts
// Mobile order detail endpoint - Bearer token authentication
// Uses requireMobileAuth() - does NOT modify auth-api.ts or NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/mobile/orders/[orderNumber]
 * Get order details by order number
 * User can only view their own orders
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await requireMobileAuth(req);
    const organizationId = session.organizationId;
    const { orderNumber } = await params;

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.userId, // User can only view their own orders
        organizationId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
        address: true,
        trackingHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    
    // Detect database connection errors
    const isConnectionError = typeof message === 'string' && (
      message.toLowerCase().includes('connection') ||
      message.toLowerCase().includes('closed') ||
      message.toLowerCase().includes('database') ||
      message.toLowerCase().includes('pool') ||
      message.toLowerCase().includes('timeout')
    );
    
    const status = err instanceof MobileAuthError 
      ? err.statusCode 
      : isConnectionError ? 503 : 500;
      
    const code = err instanceof MobileAuthError 
      ? err.code 
      : isConnectionError ? 'DATABASE_UNAVAILABLE' : 'SERVER_ERROR';

    console.error('[MOBILE ORDERS] Detail GET error:', { message, code, status, isConnectionError });
    return NextResponse.json({ success: false, error: message, code }, { status });
  }
}
