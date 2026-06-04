// src/app/api/admin/orders/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, forbidden, handleApiError, getPaginationParams, buildPaginationMeta } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return forbidden();
    }
    const organizationId = await getOrganizationIdForUser(payload);

    const { page, limit, skip } = getPaginationParams(req.nextUrl.searchParams);
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const dateFrom = req.nextUrl.searchParams.get("from");
    const dateTo = req.nextUrl.searchParams.get("to");

    const where: any = {
      organizationId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          items: { include: { product: { select: { name: true, images: true } } } },
          address: true,
          coupon: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return ok({ data: orders, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) {
    return handleApiError(err);
  }
}
