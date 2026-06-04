// src/app/api/auth/change-password/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, unauthorized, error, handleApiError } from "@/lib/api";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password too weak"),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const body = await req.json();
    const { currentPassword, newPassword } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return unauthorized();

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return error("Current password is incorrect", 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: payload.userId }, data: { password: hashed } });

    return ok({ message: "Password updated successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
