// src/app/api/admin/cms/promo-banners/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  iconName: z.string().default("Zap"),
  eyebrow: z.string().optional(),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  cta: z.string().default("Profiter"),
  href: z.string().default("/products"),
  gradient: z.string().default("from-brand-800 via-brand-700 to-brand-600"),
  accentColor: z.string().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.promoBannerItem.findMany({ orderBy: { order: "asc" } });
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
    const item = await prisma.promoBannerItem.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
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
    const item = await prisma.promoBannerItem.update({ where: { id }, data: updates });
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
    await prisma.promoBannerItem.delete({ where: { id } });
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
        prisma.promoBannerItem.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
