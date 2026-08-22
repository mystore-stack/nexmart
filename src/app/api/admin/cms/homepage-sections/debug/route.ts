// src/app/api/admin/cms/homepage-sections/debug/route.ts
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const count = await prisma.homePageSection.count();
    const sections = await prisma.homePageSection.findMany({ orderBy: { order: "asc" } });
    return ok({ count, sections });
  } catch (err: any) {
    return ok({ error: err.message, count: 0, sections: [] });
  }
}
