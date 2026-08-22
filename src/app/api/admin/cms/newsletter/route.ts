// src/app/api/admin/cms/newsletter/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const schema = z.object({
  eyebrow: z.string().default("Newsletter exclusive"),
  title: z.string().min(2),
  highlightTitle: z.string().optional(),
  description: z.string().min(5),
  placeholder: z.string().default("Votre adresse email"),
  buttonText: z.string().default("S'abonner"),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const config = await prisma.newsletterConfig.findFirst({ orderBy: { createdAt: "desc" } });
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

    const existing = await prisma.newsletterConfig.findFirst();
    if (existing) {
      const updated = await prisma.newsletterConfig.update({ where: { id: existing.id }, data });
      return ok(updated);
    }
    const item = await prisma.newsletterConfig.create({ data });
    return created(item);
  } catch (err) {
    return handleApiError(err);
  }
}
