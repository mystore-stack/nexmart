// src/app/api/admin/orders/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, forbidden, notFound, handleApiError } from "@/lib/api";
import { queueNotification } from "@/lib/queues";
import { sendShippingUpdate } from "@/lib/email";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return forbidden();
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { email: true, name: true } },
        items: true,
      },
    });

    // Notify user
    if (data.status) {
      await queueNotification({
        userId: order.userId,
        type: "ORDER_UPDATE",
        title: `Order ${data.status}`,
        body: `Your order #${order.orderNumber} is now ${data.status.toLowerCase()}.`,
        link: `/orders/${order.orderNumber}`,
      });

      // Send email for key status changes
      if (["SHIPPED", "DELIVERED"].includes(data.status)) {
        await sendShippingUpdate(
          order.user.email,
          order.user.name,
          order.orderNumber,
          data.trackingNumber || order.trackingNumber || "",
          data.status
        );
      }
    }

    return ok(order);
  } catch (err: any) {
    if (err?.code === "P2025") return notFound("Order not found");
    return handleApiError(err);
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: { include: { product: true, variant: true } },
        address: true,
        coupon: true,
      },
    });
    if (!order) return notFound("Order not found");
    return ok(order);
  } catch (err) {
    return handleApiError(err);
  }
}
