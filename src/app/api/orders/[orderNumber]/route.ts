// src/app/api/orders/[orderNumber]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";
import { ok, unauthorized, notFound, handleApiError } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const session = await requireAuth();
    const organizationId = session.organizationId;

    const order = await prisma.order.findFirst({
      where: {
        organizationId,
        orderNumber,
        // Admins can view any order; users only their own
        ...(session.role === "USER" ? { userId: session.userId } : {}),
      },
      include: {
        items: {
          include: {
            variant: true,
            product: { select: { name: true, images: true, slug: true } },
          },
        },
        address: true,
        coupon: { select: { code: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return notFound("Order not found");
    return ok(order);
  } catch (err) {
    return handleApiError(err);
  }
}
