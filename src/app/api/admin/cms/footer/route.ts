// src/app/api/admin/cms/footer/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  brandName: z.string().default("NexMart"),
  tagline: z.string().default("Maroc · Premium"),
  description: z.string().min(5),
  address: z.string().default("Casablanca, Maroc"),
  phone: z.string().default("+212 5XX-XXXXXX"),
  email: z.string().email(),
  copyrightText: z.string().default("© 2026 NexMart Maroc. Tous droits réservés."),
  linkGroups: z.any().optional(),
  socials: z.any().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const config = await prisma.footerConfig.findFirst({ orderBy: { createdAt: "desc" } });
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

    const existing = await prisma.footerConfig.findFirst();
    if (existing) {
      const updated = await prisma.footerConfig.update({ where: { id: existing.id }, data });
      return ok(updated);
    }
    const item = await prisma.footerConfig.create({ data });
    return created(item);
  } catch (err) {
    return handleApiError(err);
  }
}
