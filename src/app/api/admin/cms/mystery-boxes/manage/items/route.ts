// src/app/api/admin/cms/mystery-boxes/manage/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  image: z.string().url(),
  value: z.number().positive(),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY"]).default("COMMON"),
  weight: z.number().default(1.0),
  boxId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = itemSchema.parse(body);

    // Verify box exists
    const box = await prisma.mysteryBox.findUnique({
      where: { id: data.boxId },
    });

    if (!box) {
      return NextResponse.json({ success: false, error: "Box not found" }, { status: 404 });
    }

    const item = await prisma.mysteryItem.create({
      data: {
        name: data.name,
        image: data.image,
        value: data.value,
        rarity: data.rarity,
        weight: data.weight,
        boxId: data.boxId,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("[MYSTERY BOX ITEMS API] Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = itemSchema.parse(body);

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const item = await prisma.mysteryItem.update({
      where: { id },
      data: {
        name: data.name,
        image: data.image,
        value: data.value,
        rarity: data.rarity,
        weight: data.weight,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("[MYSTERY BOX ITEMS API] Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    await prisma.mysteryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MYSTERY BOX ITEMS API] Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
