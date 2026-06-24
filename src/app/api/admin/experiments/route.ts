import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { z } from "zod";

const experimentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  trafficSplit: z.number().min(1).max(99).default(50),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name is required"),
    description: z.string().optional(),
    config: z.any().optional(),
  })).min(2, "At least 2 variants required"),
});

// GET all experiments
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const experiments = await prisma.experiment.findMany({
      where: { organizationId },
      include: {
        variants: true,
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, experiments });
  } catch (error: any) {
    console.error("[EXPERIMENTS GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}

// POST create new experiment
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const body = await req.json();
    const data = experimentSchema.parse(body);

    // Create experiment with variants
    const experiment = await prisma.experiment.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        trafficSplit: data.trafficSplit,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: "draft",
        variants: {
          create: data.variants,
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ success: true, experiment });
  } catch (error: any) {
    console.error("[EXPERIMENT CREATE ERROR]", error);
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
      { success: false, error: "Failed to create experiment" },
      { status: 500 }
    );
  }
}
