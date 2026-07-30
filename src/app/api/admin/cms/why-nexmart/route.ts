// src/app/api/admin/cms/why-nexmart/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  iconName: z.string().default("Award"),
  title: z.string().min(2),
  description: z.string().min(2),
  stat: z.string().optional(),
  statLabel: z.string().optional(),
  color: z.string().default("from-brand-700 to-brand-600"),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const values = await prisma.whyNexMartValue.findMany({ orderBy: { order: "asc" } });
    return ok(values);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const value = await prisma.whyNexMartValue.create({ data });
    return created(value);
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
    const value = await prisma.whyNexMartValue.update({ where: { id }, data: updates });
    return ok(value);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.whyNexMartValue.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { items } = await req.json();
    if (!Array.isArray(items)) throw new Error("Items array is required for reordering");

    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.whyNexMartValue.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
