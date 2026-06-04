// src/app/api/coupons/validate/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, error, unauthorized, handleApiError } from "@/lib/api";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();
    const organizationId = await getOrganizationIdForUser(payload);

    const body = await req.json();
    const { code, subtotal } = schema.parse(body);

    const coupon = await prisma.coupon.findFirst({
      where: {
        organizationId,
        code: code.toUpperCase(),
        active: true,
        startDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    if (!coupon) return error("Coupon not found or expired.");
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return error("This coupon has reached its usage limit.");
    }
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return error(`Minimum order of $${coupon.minOrder.toFixed(2)} required for this coupon.`);
    }

    // Check per-user usage
    if (coupon.userLimit) {
      const userUsage = await prisma.order.count({
        where: { organizationId, userId: payload.userId, couponId: coupon.id },
      });
      if (userUsage >= coupon.userLimit) {
        return error("You have already used this coupon.");
      }
    }

    return ok(coupon);
  } catch (err) {
    return handleApiError(err);
  }
}
