// src/lib/personalization/user-profile.service.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export class UserProfileService {
  /**
   * Get or create user profile
   */
  static async getOrCreateProfile(userId: string, organizationId: string) {
    const cacheKey = `user-profile:${userId}`;
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          organizationId,
          preferredCategories: [],
          preferredPriceRange: {},
          preferredBrands: [],
        },
      });
    }

    // Cache for 15 minutes
    await redis.setex(cacheKey, 900, JSON.stringify(profile));

    return profile;
  }

  /**
   * Update user profile based on event
   */
  static async updateProfileFromEvent(
    userId: string,
    eventType: string,
    eventData: any
  ) {
    const profile = await this.getOrCreateProfile(
      userId,
      eventData.organizationId
    );

    const updateData: any = {
      lastActivityAt: new Date(),
    };

    // Update behavioral counts
    switch (eventType) {
      case 'PRODUCT_VIEW':
        updateData.viewCount = { increment: 1 };
        updateData.engagementScore = { increment: 1 };
        break;
      case 'ADD_TO_CART':
        updateData.cartCount = { increment: 1 };
        updateData.engagementScore = { increment: 2 };
        break;
      case 'PURCHASE':
        updateData.purchaseCount = { increment: 1 };
        updateData.purchaseScore = { increment: 5 };
        break;
      case 'SEARCH_QUERY':
        updateData.searchCount = { increment: 1 };
        updateData.activityScore = { increment: 1 };
        break;
    }

    // Update preferences based on event data
    if (eventData.productId) {
      await this.updateProductPreferences(profile.id, eventData.productId);
    }

    if (eventData.categoryId) {
      await this.updateCategoryPreferences(profile.id, eventData.categoryId);
    }

    // Recalculate overall score
    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    await this.recalculateScores(updatedProfile.id);

    // Clear cache
    await redis.del(`user-profile:${userId}`);

    return updatedProfile;
  }

  /**
   * Update product preferences
   */
  private static async updateProductPreferences(profileId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) return;

    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) return;

    const preferredCategories = profile.preferredCategories as any[];
    const categoryIndex = preferredCategories.findIndex(
      (c) => c.id === product.categoryId
    );

    if (categoryIndex >= 0) {
      preferredCategories[categoryIndex].count += 1;
    } else {
      preferredCategories.push({
        id: product.categoryId,
        name: product.category.name,
        count: 1,
      });
    }

    // Sort by count and keep top 10
    preferredCategories.sort((a, b) => b.count - a.count);
    const topCategories = preferredCategories.slice(0, 10);

    await prisma.userProfile.update({
      where: { id: profileId },
      data: { preferredCategories: topCategories },
    });
  }

  /**
   * Update category preferences
   */
  private static async updateCategoryPreferences(profileId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return;

    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) return;

    const preferredCategories = profile.preferredCategories as any[];
    const categoryIndex = preferredCategories.findIndex(
      (c) => c.id === categoryId
    );

    if (categoryIndex >= 0) {
      preferredCategories[categoryIndex].count += 1;
    } else {
      preferredCategories.push({
        id: categoryId,
        name: category.name,
        count: 1,
      });
    }

    preferredCategories.sort((a, b) => b.count - a.count);
    const topCategories = preferredCategories.slice(0, 10);

    await prisma.userProfile.update({
      where: { id: profileId },
      data: { preferredCategories: topCategories },
    });
  }

  /**
   * Recalculate user scores
   */
  private static async recalculateScores(profileId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) return;

    // Calculate overall score (weighted average)
    const overallScore =
      profile.engagementScore * 0.3 +
      profile.purchaseScore * 0.5 +
      profile.activityScore * 0.2;

    // Determine segment based on score
    let segment = 'NEW';
    if (overallScore > 100) segment = 'VIP';
    else if (overallScore > 50) segment = 'LOYAL';
    else if (overallScore > 20) segment = 'ACTIVE';

    await prisma.userProfile.update({
      where: { id: profileId },
      data: {
        overallScore,
        segment,
      },
    });
  }

  /**
   * Clear profile cache
   */
  static async clearCache(userId: string) {
    await redis.del(`user-profile:${userId}`);
  }
}
