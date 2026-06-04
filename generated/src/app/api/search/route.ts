// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const q     = req.nextUrl.searchParams.get("q") || "";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    if (q.length < 2) return NextResponse.json({ success: true, results: [] });

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          published: true,
          OR: [
            { name:        { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags:        { has: q.toLowerCase() } },
          ],
        },
        include: { category: true },
        take: limit,
        orderBy: { soldCount: "desc" },
      }),
      prisma.category.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        take: 4,
      }),
    ]);

    return NextResponse.json({ success: true, products, categories });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur recherche" }, { status: 500 });
  }
}
