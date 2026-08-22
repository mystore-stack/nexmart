import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { z } from "zod";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  content: z.string().min(1, "Content is required"),
  productId: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

// GET - Get testimonials
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const testimonials = await prisma.testimonial.findMany({
      where: { organizationId },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    console.error("[TESTIMONIALS GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create testimonial
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = testimonialSchema.parse(body);

    const testimonial = await prisma.testimonial.create({
      data: {
        organizationId,
        ...data,
      },
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    console.error("[TESTIMONIALS POST ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
