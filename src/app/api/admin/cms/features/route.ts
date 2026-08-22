// src/app/api/admin/cms/features/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(2),
  iconName: z.string().default("Truck"),
  colorClass: z.string().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const features = await prisma.homeFeature.findMany({ orderBy: { order: "asc" } });
    return ok(features);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const feature = await prisma.homeFeature.create({ data });
    return created(feature);
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
    const feature = await prisma.homeFeature.update({ where: { id }, data: updates });
    return ok(feature);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.homeFeature.delete({ where: { id } });
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
        prisma.homeFeature.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
