// src/app/api/admin/cms/banners/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const bannerSchema = z.object({
  bannerType: z.enum(["HERO", "PROMO"]).default("HERO"),
  title: z.string().min(2),
  eyebrow: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Image URL is required"),
  link: z.string().default("/products"),
  ctaText: z.string().default("Découvrir"),
  gradient: z.string().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const bannerType = req.nextUrl.searchParams.get("bannerType") || undefined;
    const active = req.nextUrl.searchParams.get("active");

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { subtitle: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(bannerType && { bannerType }),
      ...(active !== null && active !== undefined && { active: active === "true" }),
    };

    const banners = await prisma.homeBanner.findMany({
      where,
      orderBy: { order: "asc" },
    });

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

    const banner = await prisma.homeBanner.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
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

    if (!id) throw new Error("Banner ID is required");

    const banner = await prisma.homeBanner.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.startDate !== undefined && { startDate: updates.startDate ? new Date(updates.startDate) : null }),
        ...(updates.endDate !== undefined && { endDate: updates.endDate ? new Date(updates.endDate) : null }),
      },
    });

    return ok(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("Banner ID is required");

    await prisma.homeBanner.delete({ where: { id } });
    return ok({ success: true, message: "Banner deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { items } = await req.json(); // Array of { id: string, order: number }

    if (!Array.isArray(items)) throw new Error("Items array is required for reordering");

    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.homeBanner.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return ok({ success: true, message: "Order updated successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
