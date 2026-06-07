import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { z } from "zod";
import { rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const trackSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// GET /api/orders/track/[orderNumber] - Public order tracking
export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    // Rate limit by IP
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimit(`order:track:${clientIp}`, 20, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    // Validate email or phone is provided
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: "Email or phone number required" },
        { status: 400 }
      );
    }

    const organizationId = await getDefaultOrganizationId();

    // Find order with matching order number and email/phone
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        organizationId,
        OR: [
          { user: { email: email || undefined } },
          { Customer: { email: email || undefined } },
          { address: { phone: phone || undefined } },
        ],
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: { select: { id: true, name: true, value: true } },
          },
        },
        address: true,
        trackingHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate timeline steps
    const timeline = getTimelineSteps(order.status, order.trackingHistory);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        currency: order.currency,
        trackingNumber: order.trackingNumber,
        courier: order.courier,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items,
        address: {
          name: order.address.name,
          phone: order.address.phone,
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          state: order.address.state,
          country: order.address.country,
          zip: order.address.zip,
        },
        trackingHistory: order.trackingHistory,
        timeline,
      },
    });
  } catch (error) {
    console.error("[ORDER_TRACK_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

function getTimelineSteps(
  currentStatus: string,
  trackingHistory: any[]
): Array<{ status: string; label: string; completed: boolean; date?: Date }> {
  const steps = [
    { status: "PENDING", label: "Order Placed" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "PROCESSING", label: "Processing" },
    { status: "SHIPPED", label: "Shipped" },
    { status: "DELIVERED", label: "Delivered" },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return steps.map((step, index) => {
    const completed = index <= currentIndex && currentStatus !== "CANCELLED" && currentStatus !== "REFUNDED";
    const historyEntry = trackingHistory.find((h) => h.status === step.status);
    
    return {
      status: step.status,
      label: step.label,
      completed,
      date: historyEntry?.createdAt,
    };
  });
}
