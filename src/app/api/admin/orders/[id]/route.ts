// src/app/api/admin/orders/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, forbidden, notFound, handleApiError } from "@/lib/api";
import { queueNotification } from "@/lib/queues";
import { sendShippingUpdate } from "@/lib/email";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

const fullUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  shippingCost: z.number().optional(),
  tax: z.number().optional(),
  discount: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();

    const body = await req.json();
    const data = updateSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id, organizationId },
      data,
      include: {
        user: { select: { email: true, name: true } },
        items: true,
      },
    });

    // Create tracking history entry when status changes
    if (data.status) {
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: data.status,
          trackingNumber: data.trackingNumber || order.trackingNumber,
          courier: order.courier,
          notes: body.notes,
        },
      });

      // Notify user
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();

    const body = await req.json();
    const data = fullUpdateSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id, organizationId },
      data,
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: true, variant: true } },
        address: true,
        coupon: true,
      },
    });

    // Create tracking history entry when status changes
    if (data.status) {
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: data.status,
          trackingNumber: data.trackingNumber || order.trackingNumber,
          courier: order.courier,
          notes: data.notes,
        },
      });
    }

    // Notify user
    await queueNotification({
      userId: order.userId,
      type: "ORDER_UPDATE",
      title: `Order Updated`,
      body: `Your order #${order.orderNumber} has been updated.`,
      link: `/orders/${order.orderNumber}`,
    });

    return ok(order);
  } catch (err: any) {
    if (err?.code === "P2025") return notFound("Order not found");
    return handleApiError(err);
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();
    const order = await prisma.order.findFirst({
      where: { id: params.id, organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: { include: { product: true, variant: true } },
        address: true,
        coupon: true,
        trackingHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!order) return notFound("Order not found");
    return ok(order);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();

    const order = await prisma.order.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!order) return notFound("Order not found");

    await prisma.order.delete({
      where: { id: params.id },
    });

    return ok({ message: "Order deleted successfully" });
  } catch (err: any) {
    if (err?.code === "P2025") return notFound("Order not found");
    return handleApiError(err);
  }
}
