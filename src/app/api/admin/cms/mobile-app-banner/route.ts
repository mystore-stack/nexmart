// src/app/api/admin/cms/mobile-app-banner/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  appStoreUrl: z.string().optional(),
  googlePlayUrl: z.string().optional(),
  qrCodeImage: z.string().optional(),
  features: z.any().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const banner = await prisma.mobileAppBanner.findFirst({ orderBy: { createdAt: "desc" } });
    return ok(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);
    const banner = await prisma.mobileAppBanner.create({ data });
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
    if (!id) throw new Error("ID required");
    const banner = await prisma.mobileAppBanner.update({ where: { id }, data: updates });
    return ok(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) throw new Error("ID required");
    await prisma.mobileAppBanner.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
