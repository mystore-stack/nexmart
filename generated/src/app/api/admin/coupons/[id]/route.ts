// src/app/api/admin/coupons/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, noContent, forbidden, notFound, handleApiError } from "@/lib/api";

async function requireAdmin(req: NextRequest) {
  const payload = await getAuthFromRequest(req);
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden");
  }
}

const updateSchema = z.object({
  code: z.string().min(2).max(30).toUpperCase().optional(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value: z.number().positive().optional(),
  minOrder: z.number().positive().nullable().optional(),
  maxDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  userLimit: z.number().int().positive().optional(),
  endDate: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const data = updateSchema.parse(body);

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...data,
        endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : undefined,
      },
    });
    return ok(coupon);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Coupon not found");
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(req);
    await prisma.coupon.delete({ where: { id: params.id } });
    return noContent();
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Coupon not found");
    return handleApiError(err);
  }
}
