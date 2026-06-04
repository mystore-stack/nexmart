// src/app/api/auth/addresses/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, created, unauthorized, handleApiError } from "@/lib/api";

const addressSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  line1: z.string().min(5).max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  zip: z.string().min(3).max(12),
  isDefault: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const addresses = await prisma.address.findMany({
      where: { userId: payload.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return ok(addresses);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const body = await req.json();
    const data = addressSchema.parse(body);

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...data, userId: payload.userId },
    });
    return created(address);
  } catch (err) {
    return handleApiError(err);
  }
}
