// src/app/api/auth/profile/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, unauthorized, handleApiError } from "@/lib/api";

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data,
      select: { id: true, name: true, email: true, avatar: true, phone: true, role: true, emailVerified: true },
    });

    return ok(user);
  } catch (err) {
    return handleApiError(err);
  }
}
