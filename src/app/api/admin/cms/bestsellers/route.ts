// src/app/api/admin/cms/bestsellers/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  productId: z.string().optional(),
  rank: z.number().int().min(1).max(10),
  name: z.string().min(2),
  price: z.number().positive(),
  rating: z.number().default(5.0),
  reviewCount: z.number().int().default(100),
  image: z.string().min(1),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.bestsellerConfig.findMany({ orderBy: { rank: "asc" } });
    return ok(items);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const item = await prisma.bestsellerConfig.create({ data });
    return created(item);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) throw new Error("ID required");
    const item = await prisma.bestsellerConfig.update({ where: { id }, data: updates });
    return ok(item);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.bestsellerConfig.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
