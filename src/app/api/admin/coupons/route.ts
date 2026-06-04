// src/app/api/admin/coupons/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, created, forbidden, handleApiError } from "@/lib/api";

const couponSchema = z.object({
  code: z.string().min(2).max(30).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  userLimit: z.number().int().positive().default(1),
  endDate: z.string().optional(),
  active: z.boolean().default(true),
});

async function requireAdmin(req: NextRequest) {
  const payload = await getAuthFromRequest(req);
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden");
  }
  return { payload, organizationId: await getOrganizationIdForUser(payload) };
}

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin(req);
    const coupons = await prisma.coupon.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return ok(coupons);
  } catch (err) {
    if ((err as Error).message === "Forbidden") return forbidden();
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin(req);
    const body = await req.json();
    const data = couponSchema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        organizationId,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    return created(coupon);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2002") return handleApiError(new Error("Coupon code already exists."));
    return handleApiError(err);
  }
}
