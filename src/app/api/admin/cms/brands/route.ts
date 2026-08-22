// src/app/api/admin/cms/brands/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  fontStyle: z.string().optional(),
  iconText: z.string().optional(),
  link: z.string().default("/products"),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const brands = await prisma.brandPartner.findMany({ orderBy: { order: "asc" } });
    return ok(brands);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const brand = await prisma.brandPartner.create({ data });
    return created(brand);
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
    const brand = await prisma.brandPartner.update({ where: { id }, data: updates });
    return ok(brand);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.brandPartner.delete({ where: { id } });
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
        prisma.brandPartner.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
