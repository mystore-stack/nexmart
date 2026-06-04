import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromRequest } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);
    const orgs = await prisma.organization.findMany({
      include: {
        User: { select: { id: true, name: true, email: true } },
        _count: { select: { Product: true, Order: true, Membership: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(orgs);
  } catch (err) {
    return handleApiError(err);
  }
}
