// src/app/api/admin/cms/promotions/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const promoSchema = z.object({
  cardKey: z.string().min(1),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  image: z.string().min(1),
  link: z.string().default("/deals"),
  ctaText: z.string().default("Voir les offres"),
  badgeText: z.string().optional(),
  discountPills: z.any().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const promos = await prisma.homePromoCard.findMany({
      orderBy: { order: "asc" },
    });
    return ok(promos);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = promoSchema.parse(body);

    const promo = await prisma.homePromoCard.upsert({
      where: { cardKey: data.cardKey },
      create: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      update: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return created(promo);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) throw new Error("Promo ID is required");

    const promo = await prisma.homePromoCard.update({
      where: { id },
      data: updates,
    });
    return ok(promo);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("Promo ID is required");

    await prisma.homePromoCard.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { items } = await req.json();
    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.homePromoCard.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
