// src/app/api/personalization/profile/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { UserProfileService } from '@/lib/personalization/user-profile.service';

export const GET = withApi(async ({ session }) => {
  if (!session) throw new Error("Session required");
  const profile = await UserProfileService.getOrCreateProfile(
    session!.userId,
    session!.organizationId
  );

  // Get personalized recommendations
  const recommendations = await getPersonalizedRecommendations(session!.userId, session!.organizationId);

  // Get personalized offers
  const offers = await getPersonalizedOffers(session!.userId, session!.organizationId, profile.segment);

  return { success: true, profile, recommendations, offers };
}, { requireAuth: true });

export const POST = withApi(async ({ req, session }) => {
  if (!session) throw new Error("Session required");
  const body = await req.json();
  const { preferences } = body;

  const { prisma } = await import('@/lib/prisma');

  const profile = await prisma.userProfile.update({
    where: { userId: session!.userId },
    data: {
      preferredCategories: preferences?.categories || [],
      preferredPriceRange: preferences?.priceRange || {},
      preferredBrands: preferences?.brands || [],
    },
  });

  // Clear cache
  await UserProfileService.clearCache(session!.userId);

  return { success: true, profile };
}, { requireAuth: true });

async function getPersonalizedRecommendations(userId: string, organizationId: string) {
  const { prisma } = await import('@/lib/prisma');
  const profile = await UserProfileService.getOrCreateProfile(userId, organizationId);

  // Get preferred categories
  const preferredCategories = (profile.preferredCategories as any[]) || [];
  const categoryIds = preferredCategories.map((c) => c.id).slice(0, 3);

  // Get products from preferred categories
  const products = await prisma.product.findMany({
    where: {
      organizationId,
      categoryId: { in: categoryIds },
      published: true,
    },
    take: 10,
    orderBy: { rating: 'desc' },
  });

  return products.map((product) => ({
    item: product,
    score: calculateRecommendationScore(product, profile),
    reason: 'Based on your category preferences',
  }));
}

async function getPersonalizedOffers(userId: string, organizationId: string, segment: string | null) {
  const { prisma } = await import('@/lib/prisma');
  const now = new Date();

  const offers = await prisma.personalizedOffer.findMany({
    where: {
      organizationId,
      startDate: { lte: now },
      endDate: { gte: now },
      targetSegments: {
        path: [],
        string_contains: segment || 'NEW',
      },
    },
    take: 5,
  });

  return offers;
}

function calculateRecommendationScore(product: any, profile: any): number {
  let score = 0;

  // Category affinity
  const preferredCategories = (profile.preferredCategories as any[]) || [];
  const categoryAffinity = preferredCategories.find((c) => c.id === product.categoryId);
  if (categoryAffinity) {
    score += categoryAffinity.count * 10;
  }

  // Product rating
  score += product.rating * 5;

  // Product popularity
  score += product.soldCount * 0.1;

  return Math.min(score, 100);
}
