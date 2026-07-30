// src/app/api/admin/cms/bundle-builder/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  title: z.string().default("CRÉEZ VOTRE BUNDLE"),
  subtitle: z.string().default("Choisissez vos produits préférés et économisez jusqu'à 30%"),
  maxDiscountPercent: z.number().int().default(30),
  items: z.any().optional(),
  ctaText: z.string().default("Créer mon bundle"),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const config = await prisma.bundleConfig.findFirst({ orderBy: { createdAt: "desc" } });
    return ok(config);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.bundleConfig.findFirst();
    if (existing) {
      const updated = await prisma.bundleConfig.update({ where: { id: existing.id }, data });
      return ok(updated);
    }
    const createdItem = await prisma.bundleConfig.create({ data });
    return created(createdItem);
  } catch (err) {
    return handleApiError(err);
  }
}
