// src/app/api/admin/cms/mystery-boxes/manage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const boxSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().nullable(),
  image: z.string().url(),
  price: z.number().positive(),
  oldPrice: z.number().nullable(),
  isActive: z.boolean().default(true),
  minGuaranteedValue: z.number().nullable(),
  maxProfitPercent: z.number().nullable(),
  order: z.number().default(0),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const box = await prisma.mysteryBox.findUnique({
        where: { id },
        include: {
          items: true,
          _count: {
            select: {
              items: true,
              opens: true,
            },
          },
        },
      });

      if (!box) {
        return NextResponse.json({ success: false, error: "Box not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, box });
    }

    const boxes = await prisma.mysteryBox.findMany({
      include: {
        items: true,
        _count: {
          select: {
            items: true,
            opens: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, boxes });
  } catch (error) {
    console.error("[MYSTERY BOXES MANAGE API] Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = boxSchema.parse(body);

    const box = await prisma.mysteryBox.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price,
        oldPrice: data.oldPrice,
        isActive: data.isActive,
        minGuaranteedValue: data.minGuaranteedValue,
        maxProfitPercent: data.maxProfitPercent,
        order: data.order,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, box });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("[MYSTERY BOXES MANAGE API] Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = boxSchema.parse(body);

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const box = await prisma.mysteryBox.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price,
        oldPrice: data.oldPrice,
        isActive: data.isActive,
        minGuaranteedValue: data.minGuaranteedValue,
        maxProfitPercent: data.maxProfitPercent,
        order: data.order,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, box });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("[MYSTERY BOXES MANAGE API] Error:", error);
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

    await prisma.mysteryBox.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MYSTERY BOXES MANAGE API] Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
