// src/app/api/admin/cms/new-arrivals/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2),
  price: z.number().positive(),
  badgeText: z.string().default("Nouveau"),
  image: z.string().min(1),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.newArrivalConfig.findMany({ orderBy: { order: "asc" } });
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
    const item = await prisma.newArrivalConfig.create({ data });
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
    const item = await prisma.newArrivalConfig.update({ where: { id }, data: updates });
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
    await prisma.newArrivalConfig.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
