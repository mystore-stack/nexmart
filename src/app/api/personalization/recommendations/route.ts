// src/app/api/personalization/recommendations/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';

export const GET = withApi(async ({ req, session }) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'product';
  const limit = parseInt(searchParams.get('limit') || '10');
  const context = searchParams.get('context') || 'homepage';

  const recommendations = await getRecommendations(
    session.userId,
    session.organizationId,
    type,
    limit,
    context
  );

  return { success: true, recommendations };
}, { requireAuth: true });

async function getRecommendations(
  userId: string,
  organizationId: string,
  type: string,
  limit: number,
  context: string
) {
  const { UserProfileService } = await import('@/lib/personalization/user-profile.service');
  const { prisma } = await import('@/lib/prisma');

  const profile = await UserProfileService.getOrCreateProfile(userId, organizationId);

  if (type === 'product') {
    return getProductRecommendations(profile, organizationId, limit);
  } else if (type === 'category') {
    return getCategoryRecommendations(profile, organizationId, limit);
  } else if (type === 'offer') {
    return getOfferRecommendations(profile, organizationId, limit);
  }

  return [];
}

async function getProductRecommendations(profile: any, organizationId: string, limit: number) {
  const { prisma } = await import('@/lib/prisma');

  const preferredCategories = (profile.preferredCategories as any[]) || [];
  const categoryIds = preferredCategories.map((c) => c.id).slice(0, 3);

  if (categoryIds.length === 0) {
    // Return popular products if no preferences
    return await prisma.product.findMany({
      where: { organizationId, published: true },
      take: limit,
      orderBy: { soldCount: 'desc' },
    });
  }

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      categoryId: { in: categoryIds },
      published: true,
    },
    take: limit,
    orderBy: { rating: 'desc' },
  });

  return products.map((product) => ({
    item: product,
    score: calculateRecommendationScore(product, profile),
    reason: 'Based on your category preferences',
  }));
}

async function getCategoryRecommendations(profile: any, organizationId: string, limit: number) {
  const { prisma } = await import('@/lib/prisma');

  const preferredCategories = (profile.preferredCategories as any[]) || [];
  const categoryIds = preferredCategories.map((c) => c.id).slice(0, limit);

  const categories = await prisma.category.findMany({
    where: {
      organizationId,
      id: { in: categoryIds },
    },
  });

  return categories.map((category) => ({
    item: category,
    score: preferredCategories.find((c) => c.id === category.id)?.count || 0,
    reason: 'Based on your browsing history',
  }));
}

async function getOfferRecommendations(profile: any, organizationId: string, limit: number) {
  const { prisma } = await import('@/lib/prisma');
  const now = new Date();

  const offers = await prisma.personalizedOffer.findMany({
    where: {
      organizationId,
      startDate: { lte: now },
      endDate: { gte: now },
      targetSegments: {
        path: [],
        string_contains: profile.segment || 'NEW',
      },
    },
    take: limit,
  });

  return offers.map((offer) => ({
    item: offer,
    score: 100,
    reason: 'Personalized offer for your segment',
  }));
}

function calculateRecommendationScore(product: any, profile: any): number {
  let score = 0;

  const preferredCategories = (profile.preferredCategories as any[]) || [];
  const categoryAffinity = preferredCategories.find((c) => c.id === product.categoryId);
  if (categoryAffinity) {
    score += categoryAffinity.count * 10;
  }

  score += product.rating * 5;
  score += product.soldCount * 0.1;

  return Math.min(score, 100);
}
