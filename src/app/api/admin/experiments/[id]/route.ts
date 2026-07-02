import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { z } from "zod";

const abTestUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  variantA: z.any().optional(),
  variantB: z.any().optional(),
  trafficSplit: z.number().min(1).max(99).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["draft", "running", "paused", "completed"]).optional(),
});

// GET single A/B test
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();

    const test = await prisma.aBTest.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!test) {
      return NextResponse.json(
        { success: false, error: "A/B test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: test });
  } catch (error: any) {
    console.error("[AB TEST GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch A/B test" },
      { status: 500 }
    );
  }
}

// PUT update A/B test
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();

    const body = await req.json();
    const data = abTestUpdateSchema.parse(body);

    const test = await prisma.aBTest.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ success: true, data: test });
  } catch (error: any) {
    console.error("[AB TEST UPDATE ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update A/B test" },
      { status: 500 }
    );
  }
}

// DELETE A/B test
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();

    await prisma.aBTest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[AB TEST DELETE ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete A/B test" },
      { status: 500 }
    );
  }
}
