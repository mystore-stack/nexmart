// src/app/api/orders/[orderNumber]/shipment/route.ts
// Mobile shipment tracking endpoint - Bearer token authentication
// Provides shipment/tracking information for authenticated user's orders
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMobileAuth, MobileAuthError } from '@/lib/mobile-auth-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/orders/[orderNumber]/shipment
 * Get shipment tracking for an order
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
              },
            },
          },
        },
        address: true,
        trackingHistory: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Extract shipment-specific data for mobile app
    const shipment = {
      number: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      eta: order.estimatedDelivery,
      destination: {
        city: order.address.city,
        state: order.address.state,
        country: order.address.country,
      },
      customerName: order.user.name,
      customerPhone: order.user.phone,
      itemsCount: order.items.length,
      items: order.items.map(item => ({
        id: item.id,
        title: item.name,
        qty: item.quantity,
        image: item.image,
      })),
      events: order.trackingHistory.map(history => ({
        status: history.status,
        notes: history.notes,
        timestamp: history.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      shipment,
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

    console.error('[SHIPMENT] GET error:', { message, code, status, isConnectionError });
    return NextResponse.json({ success: false, error: message, code }, { status });
  }
}
