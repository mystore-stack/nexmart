import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { z } from "zod";
import { rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  courier: z.string().optional(),
  notes: z.string().max(500).optional(),
  estimatedDelivery: z.string().datetime().optional(),
});

// POST /api/orders/update-status - Admin endpoint to update order status
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const organizationId = await getOrganizationIdForUser(user);
    
    // Check if user is admin or super admin
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const rl = await rateLimit(`order:update:${user.userId}`, 30, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const body = updateStatusSchema.parse(await req.json());

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: body.orderId,
        organizationId,
      },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Update order status and tracking info
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.order.update({
        where: { id: body.orderId },
        data: {
          status: body.status,
          trackingNumber: body.trackingNumber,
          courier: body.courier,
          estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null,
        },
        include: {
          user: true,
          items: true,
          address: true,
        },
      });

      // Create tracking history entry
      await tx.orderTracking.create({
        data: {
          orderId: body.orderId,
          status: body.status,
          trackingNumber: body.trackingNumber,
          courier: body.courier,
          notes: body.notes,
        },
      });

      return updated;
    });

    // Send notification to user
    await sendOrderStatusNotification(order.user, order.orderNumber, body.status, body.trackingNumber, body.courier);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${body.status}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error("[ORDER_UPDATE_STATUS_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

async function sendOrderStatusNotification(
  user: any,
  orderNumber: string,
  status: string,
  trackingNumber?: string,
  courier?: string
) {
  try {
    // Create in-app notification
    const statusMessages: Record<string, string> = {
      CONFIRMED: "Your order has been confirmed",
      PROCESSING: "Your order is being processed",
      SHIPPED: "Your order has been shipped",
      DELIVERED: "Your order has been delivered",
      CANCELLED: "Your order has been cancelled",
      REFUNDED: "Your order has been refunded",
    };

    const message = statusMessages[status] || `Order status updated to ${status}`;
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "ORDER_UPDATE",
        title: `Order #${orderNumber} Update`,
        body: trackingNumber 
          ? `${message}. Tracking: ${trackingNumber} via ${courier || "Courier"}`
          : message,
      },
    });

    // TODO: Add email notification integration
    // TODO: Add SMS notification integration (optional)
  } catch (error) {
    console.error("[NOTIFICATION_ERROR]", error);
    // Don't fail the order update if notification fails
  }
}
