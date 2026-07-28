// src/app/api/admin/ads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError, notFound } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

export const dynamic = "force-dynamic";

const updateAdSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  productId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED']).optional(),
  budget: z.number().positive().optional(),
  bidAmount: z.number().positive().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId } = await requireAdmin();
    
    const ad = await prisma.advertisement.findFirst({
      where: { id, organizationId },
      include: { Product: true },
    });
    
    if (!ad) return notFound("Ad not found");
    
    return ok(ad);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, userId } = await requireAdmin();
    const { id } = await params;
    
    const body = await req.json();
    const data = updateAdSchema.parse(body);
    
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.productId) updateData.productId = data.productId;
    if (data.status) updateData.status = data.status;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.bidAmount !== undefined) updateData.bidAmount = data.bidAmount;
    if (data.startsAt) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    
    const ad = await prisma.advertisement.update({
      where: { 
        id,
        organizationId,
      },
      data: updateData,
      include: { Product: true },
    });
    
    return ok(ad);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, userId } = await requireAdmin();
    const { id } = await params;
    
    await prisma.advertisement.delete({
      where: { 
        id,
        organizationId,
      },
    });
    
    return ok({ message: 'Ad deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
