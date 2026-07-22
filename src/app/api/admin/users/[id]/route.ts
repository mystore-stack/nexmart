// src/app/api/admin/users/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, forbidden, notFound, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  emailVerified: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { organizationId } = await requireAdmin();
    // Prevent demoting super admins
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: params.id, organizationId } },
      include: { User: true },
    });
    const target = membership?.User;
    if (!target) return notFound("User not found");
    if (target.role === "SUPER_ADMIN") return forbidden("Cannot modify a super admin");

    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return ok(user);
  } catch (err) {
    return handleApiError(err);
  }
}
