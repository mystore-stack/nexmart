// src/app/api/admin/cms/hero/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(2),
  titleAccent: z.string().optional(),
  subtitle: z.string().optional(),
  cta: z.string().default("Explorer la boutique"),
  ctaSecondary: z.string().optional(),
  href: z.string().default("/products"),
  hrefSecondary: z.string().optional(),
  badge: z.string().optional(),
  stat: z.string().optional(),
  statLabel: z.string().optional(),
  image: z.string().min(1),
  accentColor: z.string().default("#0F766E"),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
    return ok(slides);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const slide = await prisma.heroSlide.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    return created(slide);
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
    const slide = await prisma.heroSlide.update({ where: { id }, data: updates });
    return ok(slide);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.heroSlide.delete({ where: { id } });
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
        prisma.heroSlide.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
