// src/app/api/admin/cms/service-banners/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const bannerSchema = z.object({
  bannerKey: z.string().min(1),
  title: z.string().min(2),
  highlightText: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1),
  link: z.string().default("/shipping"),
  ctaText: z.string().default("En savoir plus"),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const banners = await prisma.homeServiceBanner.findMany({ orderBy: { order: "asc" } });
    return ok(banners);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = bannerSchema.parse(body);

    const banner = await prisma.homeServiceBanner.upsert({
      where: { bannerKey: data.bannerKey },
      create: data,
      update: data,
    });
    return created(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) throw new Error("Service Banner ID is required");

    const banner = await prisma.homeServiceBanner.update({ where: { id }, data: updates });
    return ok(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("Service Banner ID is required");

    await prisma.homeServiceBanner.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
