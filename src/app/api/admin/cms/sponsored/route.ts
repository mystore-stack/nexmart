// src/app/api/admin/cms/sponsored/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2),
  price: z.number().positive(),
  image: z.string().min(1),
  badgeText: z.string().default("Sponsored"),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.sponsoredProduct.findMany({ orderBy: { order: "asc" } });
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
    const item = await prisma.sponsoredProduct.create({ data });
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
    if (!id) throw new Error("Sponsored product ID required");
    const item = await prisma.sponsoredProduct.update({ where: { id }, data: updates });
    return ok(item);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("Sponsored product ID required");
    await prisma.sponsoredProduct.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
