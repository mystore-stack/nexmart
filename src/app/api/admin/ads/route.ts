// src/app/api/admin/ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, getPaginationParams, buildPaginationMeta, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

export const dynamic = "force-dynamic";

const adSchema = z.object({
  name: z.string().min(2).max(200),
  productId: z.string().uuid(),
  budget: z.number().positive(),
  bidAmount: z.number().positive().optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED']).default('DRAFT'),
});

export async function GET(req: NextRequest) {
  try {
    console.log("[ADMIN ADS] GET - Starting request");
    const { organizationId, userId } = await requireAdmin();
    console.log("[ADMIN ADS] userId:", userId, "organizationId:", organizationId);
    
    if (!organizationId) {
      console.error("[ADMIN ADS] No organizationId found for user");
      throw new Error("No organization found for user. Please contact support.");
    }
    
    const { page, limit, skip } = getPaginationParams(req.nextUrl.searchParams);
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const status = req.nextUrl.searchParams.get("status") || undefined;

    console.log("[ADMIN ADS] Query params:", { page, limit, skip, search, status });

    const where: any = {
      organizationId,
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(status && { status: status.toUpperCase() }),
    };

    console.log("[ADMIN ADS] Prisma where clause:", JSON.stringify(where, null, 2));

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: { Product: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.advertisement.count({ where }),
    ]);

    console.log("[ADMIN ADS] Ads found:", ads.length, "Total count:", total);

    // Calculate CTR for each ad and format data
    const adsWithStats = ads.map((ad: any) => ({
      id: ad.id,
      title: ad.name,
      type: 'banner', // Default type since schema doesn't have it
      status: ad.status.toLowerCase(),
      imageUrl: ad.Product?.images?.[0] || '/placeholder.png',
      targetUrl: `/products/${ad.Product?.slug || ad.productId}`,
      startDate: ad.startsAt,
      endDate: ad.endsAt,
      budget: ad.budget,
      impressions: ad.impressions || 0,
      clicks: ad.clicks || 0,
      ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0,
      productId: ad.productId,
    }));

    const adsArray = Array.isArray(adsWithStats) ? adsWithStats : [];

    const responseData = {
      success: true,
      data: adsArray,
      pagination: buildPaginationMeta(total, page, limit)
    };

    console.log("[ADMIN ADS] RESPONSE PAYLOAD:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, userId } = await requireAdmin();
    console.log("[ADMIN ADS] POST - userId:", userId, "organizationId:", organizationId);
    
    const body = await req.json();
    const data = adSchema.parse(body);
    
    const ad = await prisma.advertisement.create({
      data: {
        name: data.name,
        productId: data.productId,
        budget: data.budget,
        bidAmount: data.bidAmount,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        status: data.status,
        organizationId,
        impressions: 0,
        clicks: 0,
        spend: 0,
      },
    });
    
    console.log("[ADMIN ADS] Ad created:", ad.id, "for organization:", organizationId);
    return created(ad);
  } catch (err) {
    return handleApiError(err);
  }
}
