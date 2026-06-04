// src/app/api/orders/[orderNumber]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, unauthorized, notFound, handleApiError } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();
    const organizationId = await getOrganizationIdForUser(payload);

    const order = await prisma.order.findFirst({
      where: {
        organizationId,
        orderNumber: params.orderNumber,
        // Admins can view any order; users only their own
        ...(payload.role === "USER" ? { userId: payload.userId } : {}),
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
