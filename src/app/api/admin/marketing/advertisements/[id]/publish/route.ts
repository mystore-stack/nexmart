import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const publishSchema = z.object({
  action: z.enum(["publish", "unpublish"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    const { action } = publishSchema.parse(await req.json());

    const existing = await prisma.advertisement.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const ad = await prisma.advertisement.update({
      where: { id },
      data: { status: action === "publish" ? "PUBLISHED" : "DRAFT" },
    });

    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true, data: ad });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to update status" },
      { status: err.statusCode ?? 500 }
    );
  }
}
