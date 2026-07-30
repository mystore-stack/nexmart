// src/app/api/admin/cms/mystery-boxes/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  startingPrice: z.number().positive(),
  rating: z.number().default(4.9),
  reviewCount: z.number().int().default(1000),
  image: z.string().min(1),
  link: z.string().default("/products?tag=mystery-box"),
  ctaText: z.string().default("Découvrir"),
  active: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const boxes = await prisma.mysteryBoxConfig.findMany({ orderBy: { createdAt: "desc" } });
    return ok(boxes);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const box = await prisma.mysteryBoxConfig.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    return created(box);
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
    const box = await prisma.mysteryBoxConfig.update({ where: { id }, data: updates });
    return ok(box);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.mysteryBoxConfig.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
