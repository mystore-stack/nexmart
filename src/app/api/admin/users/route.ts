// src/app/api/admin/users/route.ts
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
    const search = req.nextUrl.searchParams.get("search") || undefined;

    const userWhere: any = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    const where = { organizationId, User: userWhere };

    const [memberships, total] = await Promise.all([
      prisma.membership.findMany({
        where,
        select: {
          User: {
            select: {
              id: true, name: true, email: true, avatar: true,
              role: true, emailVerified: true, createdAt: true,
              _count: { select: { orders: true, reviews: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.membership.count({ where }),
    ]);

    const users = memberships.map((membership) => membership.User);
    return ok({ data: users, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) {
    return handleApiError(err);
  }
}
