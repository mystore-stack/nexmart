// src/app/api/mystery-boxes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CACHE_TTL, getCache, setCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cacheKey = `mystery-boxes:${searchParams.toString()}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, cached: true });
    }

    const boxes = await prisma.mysteryBox.findMany({
      where: {
        isActive: true,
        ...(searchParams.get("activeOnly") === "true" && { isActive: true }),
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            image: true,
            value: true,
            rarity: true,
            weight: true,
          },
        },
        _count: {
          select: {
            items: true,
            opens: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const payload = {
      boxes: boxes.map((box) => ({
        id: box.id,
        title: box.title,
        description: box.description,
        image: box.image,
        price: box.price,
        oldPrice: box.oldPrice,
        minGuaranteedValue: box.minGuaranteedValue,
        maxProfitPercent: box.maxProfitPercent,
        itemCount: box._count.items,
        openCount: box._count.opens,
        items: box.items,
        startDate: box.startDate,
        endDate: box.endDate,
      })),
    };

    await setCache(cacheKey, payload, CACHE_TTL.SHORT);
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("[MYSTERY BOXES API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
