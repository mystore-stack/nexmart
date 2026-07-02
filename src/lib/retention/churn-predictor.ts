// src/lib/retention/churn-predictor.ts
import { prisma } from '@/lib/prisma';

export class ChurnPredictor {
  /**
   * Predict churn risk for a user
   */
  static async predictRisk(userId: string, organizationId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: { where: { status: 'COMPLETED' as any } },
        loyaltyPoints: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const features = await this.calculateFeatures(user, organizationId);
    const riskScore = this.calculateRiskScore(features);
    const riskLevel = this.determineRiskLevel(riskScore);

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

    // Save prediction
    const prediction = await prisma.churnPrediction.create({
      data: {
        organizationId,
        userId,
        riskScore,
        riskLevel: riskLevel as any,
        confidence: 0.85,
        factors: features,
        validUntil,
      },
    });

    return prediction;
  }

  /**
   * Calculate churn risk features for a user
   */
  private static async calculateFeatures(user: any, organizationId: string) {
    const userId = user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Purchase frequency (orders in last 30 days)
    const recentOrders = user.orders.filter((o: any) => 
      new Date(o.createdAt) >= thirtyDaysAgo
    );
    const purchaseFrequency = recentOrders.length;

    // Recency (days since last order)
    const lastOrder = user.orders[user.orders.length - 1];
    const recency = lastOrder 
      ? Math.floor((now.getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Average order value
    const totalSpent = user.orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const averageOrderValue = user.orders.length > 0 ? totalSpent / user.orders.length : 0;

    // Engagement score (based on analytics events)
    const engagementScore = await this.calculateEngagementScore(userId, organizationId);

    // Support tickets count
    const supportTickets = await this.countSupportTickets(userId);

    // Returns count
    const returns = await this.countReturns(userId);

    // Loyalty tier
    const loyaltyTier = user.loyaltyPoints?.tier || 'BRONZE';

    return {
      purchaseFrequency,
      recency,
      averageOrderValue,
      engagementScore,
      supportTickets,
      returns,
      loyaltyTier,
    };
  }

  /**
   * Calculate risk score from features
   */
  private static calculateRiskScore(features: any): number {
    let score = 0;

    // Recency: higher is worse
    if (features.recency > 90) score += 40;
    else if (features.recency > 60) score += 30;
    else if (features.recency > 30) score += 20;
    else if (features.recency > 14) score += 10;

    // Purchase frequency: lower is worse
    if (features.purchaseFrequency === 0) score += 30;
    else if (features.purchaseFrequency < 2) score += 20;
    else if (features.purchaseFrequency < 5) score += 10;

    // Average order value: lower is worse
    if (features.averageOrderValue < 50) score += 10;

    // Engagement score: lower is worse
    if (features.engagementScore < 20) score += 20;
    else if (features.engagementScore < 50) score += 10;

    // Support tickets: higher is worse
    if (features.supportTickets > 5) score += 15;
    else if (features.supportTickets > 3) score += 10;

    // Returns: higher is worse
    if (features.returns > 3) score += 15;
    else if (features.returns > 1) score += 5;

    // Loyalty tier: lower is worse
    if (features.loyaltyTier === 'BRONZE') score += 10;
    else if (features.loyaltyTier === 'SILVER') score += 5;

    return Math.min(score, 100);
  }

  /**
   * Determine risk level from score
   */
  private static determineRiskLevel(score: number): string {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate engagement score from analytics events
   */
  private static async calculateEngagementScore(userId: string, organizationId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = await prisma.analyticsEvent.count({
      where: {
        userId,
        organizationId,
        occurredAt: { gte: thirtyDaysAgo },
      },
    });

    return Math.min(events, 100);
  }

  /**
   * Count support tickets for a user
   */
  private static async countSupportTickets(userId: string): Promise<number> {
    // This would integrate with a support system
    // For now, return 0
    return 0;
  }

  /**
   * Count returns for a user
   */
  private static async countReturns(userId: string): Promise<number> {
    // This would integrate with a returns system
    // For now, return 0
    return 0;
  }

  /**
   * Batch predict churn for all users in an organization
   */
  static async predictForOrganization(organizationId: string) {
    const users = await prisma.user.findMany({
      where: { organizationId } as any,
    });

    const predictions = [];

    for (const user of users) {
      try {
        const prediction = await this.predictRisk(user.id, organizationId);
        predictions.push(prediction);
      } catch (error) {
        console.error(`Failed to predict churn for user ${user.id}:`, error);
      }
    }

    return predictions;
  }
}
