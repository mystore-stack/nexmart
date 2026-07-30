// src/app/api/admin/cms/flash-deals/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const flashDealSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  discountPercent: z.number().int().min(1).max(99),
  rating: z.number().default(5.0),
  reviewCount: z.number().int().default(100),
  image: z.string().min(1),
  stock: z.number().int().default(10),
  maxStock: z.number().int().default(50),
  countdownEndTime: z.string().nullable().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const active = req.nextUrl.searchParams.get("active");

    const where: any = {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(active !== null && active !== undefined && { active: active === "true" }),
    };

    const deals = await prisma.flashDealItem.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return ok(deals);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = flashDealSchema.parse(body);

    const deal = await prisma.flashDealItem.create({
      data: {
        ...data,
        countdownEndTime: data.countdownEndTime ? new Date(data.countdownEndTime) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return created(deal);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) throw new Error("Flash Deal ID is required");

    const deal = await prisma.flashDealItem.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.countdownEndTime !== undefined && {
          countdownEndTime: updates.countdownEndTime ? new Date(updates.countdownEndTime) : null,
        }),
      },
    });

    return ok(deal);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("Flash Deal ID is required");

    await prisma.flashDealItem.delete({ where: { id } });
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
        prisma.flashDealItem.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
