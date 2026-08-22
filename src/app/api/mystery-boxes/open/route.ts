// src/app/api/mystery-boxes/open/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const openBoxSchema = z.object({
  boxId: z.string().uuid(),
});

// Weighted random selection algorithm
function selectWeightedRandomItem(items: { id: string; weight: number }[]): string {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.id;
    }
  }
  
  return items[items.length - 1].id;
}

// Fair random selection with profit control
function selectItemWithProfitControl(
  items: Array<{ id: string; value: number; weight: number; rarity: string }>,
  boxPrice: number,
  minGuaranteedValue?: number,
  maxProfitPercent?: number
): { itemId: string; itemValue: number; profit: number } {
  // Filter items that meet minimum guaranteed value if specified
  let eligibleItems = items;
  if (minGuaranteedValue) {
    eligibleItems = items.filter((item) => item.value >= minGuaranteedValue);
    // If no items meet the minimum, use all items
    if (eligibleItems.length === 0) {
      eligibleItems = items;
    }
  }

  // Filter items that don't exceed max profit if specified
  if (maxProfitPercent) {
    const maxItemValue = boxPrice * (1 + maxProfitPercent / 100);
    eligibleItems = eligibleItems.filter((item) => item.value <= maxItemValue);
    // If no items meet the max profit, use all eligible items
    if (eligibleItems.length === 0) {
      eligibleItems = items.filter((item) => item.value >= (minGuaranteedValue || 0));
    }
  }

  // Use weighted random selection
  const weightedItems = eligibleItems.map((item) => ({
    id: item.id,
    weight: item.weight,
  }));
  
  const selectedItemId = selectWeightedRandomItem(weightedItems);
  const selectedItem = items.find((item) => item.id === selectedItemId)!;
  
  const profit = selectedItem.value - boxPrice;
  
  return {
    itemId: selectedItemId,
    itemValue: selectedItem.value,
    profit,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { boxId } = openBoxSchema.parse(body);

    // Fetch the mystery box with its items
    const box = await prisma.mysteryBox.findUnique({
      where: { id: boxId },
      include: {
        items: true,
      },
    });

    if (!box) {
      return NextResponse.json(
        { success: false, error: "Boîte mystère introuvable" },
        { status: 404 }
      );
    }

    if (!box.isActive) {
      return NextResponse.json(
        { success: false, error: "Cette boîte mystère n'est pas active" },
        { status: 400 }
      );
    }

    if (box.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cette boîte mystère ne contient aucun article" },
        { status: 400 }
      );
    }

    // Select item using profit control logic
    const { itemId, itemValue, profit } = selectItemWithProfitControl(
      box.items,
      box.price,
      box.minGuaranteedValue || undefined,
      box.maxProfitPercent || undefined
    );

    // Record the opening
    const boxOpen = await prisma.mysteryBoxOpen.create({
      data: {
        boxId,
        itemId,
        userId: session?.userId || null,
        itemValue,
        profit,
      },
      include: {
        item: true,
        box: true,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        id: boxOpen.id,
        item: {
          id: boxOpen.item.id,
          name: boxOpen.item.name,
          image: boxOpen.item.image,
          value: boxOpen.item.value,
          rarity: boxOpen.item.rarity,
        },
        box: {
          id: boxOpen.box.id,
          title: boxOpen.box.title,
          price: boxOpen.box.price,
        },
        profit: boxOpen.profit,
        openedAt: boxOpen.openedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[MYSTERY BOX OPEN API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
