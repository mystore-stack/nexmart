// src/app/api/admin/users/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, forbidden, handleApiError, getPaginationParams, buildPaginationMeta } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;

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

    const responseData = { data: users, pagination: buildPaginationMeta(total, page, limit) };

    console.log("[ADMIN USERS] RESPONSE PAYLOAD:", JSON.stringify(responseData, null, 2));

    return ok(responseData);
  } catch (err) {
    return handleApiError(err);
  }
}
