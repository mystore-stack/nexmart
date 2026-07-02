import { prisma } from '@/lib/prisma';
import type { 
  GoogleIntegration, 
  GoogleService, 
  IntegrationStatus,
  GoogleAnalyticsEvent,
  GoogleMerchantFeed,
  GoogleSearchConsoleSite,
  GoogleBusinessProfile,
  GoogleMapsLocation,
  GoogleIntegrationDashboard
} from '@/types/google-integrations';

export class GoogleIntegrationService {
  static async getIntegrations(organizationId: string): Promise<GoogleIntegration[]> {
    return prisma.googleIntegration.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getIntegration(
    organizationId: string,
    service: GoogleService
  ): Promise<GoogleIntegration | null> {
    return prisma.googleIntegration.findUnique({
      where: {
        organizationId_service: {
          organizationId,
          service,
        },
      },
    });
  }

  static async createIntegration(
    organizationId: string,
    service: GoogleService,
    config: Record<string, any>
  ): Promise<GoogleIntegration> {
    return prisma.googleIntegration.create({
      data: {
        organizationId,
        service,
        config,
        enabled: true,
        status: 'PENDING',
      },
    });
  }

  static async updateIntegration(
    id: string,
    data: Partial<GoogleIntegration>
  ): Promise<GoogleIntegration> {
    return prisma.googleIntegration.update({
      where: { id },
      data,
    });
  }

  static async deleteIntegration(id: string): Promise<void> {
    await prisma.googleIntegration.delete({
      where: { id },
    });
  }

  static async trackAnalyticsEvent(
    organizationId: string,
    integrationId: string,
    eventType: string,
    eventData: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): Promise<GoogleAnalyticsEvent> {
    return prisma.googleAnalyticsEvent.create({
      data: {
        organizationId,
        integrationId,
        eventType,
        eventData: eventData as any,
        userId,
        sessionId,
      },
    }) as any;
  }

  static async getAnalyticsEvents(
    organizationId: string,
    limit: number = 100
  ): Promise<GoogleAnalyticsEvent[]> {
    return prisma.googleAnalyticsEvent.findMany({
      where: { organizationId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    }) as any;
  }

  static async getMerchantFeeds(organizationId: string): Promise<GoogleMerchantFeed[]> {
    return prisma.googleMerchantFeed.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createMerchantFeed(
    organizationId: string,
    integrationId: string,
    feedName: string,
    feedUrl?: string
  ): Promise<GoogleMerchantFeed> {
    return prisma.googleMerchantFeed.create({
      data: {
        organizationId,
        integrationId,
        feedName,
        feedUrl,
        status: 'PENDING',
      },
    });
  }

  static async getSearchConsoleSites(organizationId: string): Promise<GoogleSearchConsoleSite[]> {
    return prisma.googleSearchConsoleSite.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async addSearchConsoleSite(
    organizationId: string,
    siteUrl: string
  ): Promise<GoogleSearchConsoleSite> {
    return prisma.googleSearchConsoleSite.create({
      data: {
        organizationId,
        siteUrl,
      },
    });
  }

  static async getBusinessProfiles(organizationId: string): Promise<GoogleBusinessProfile[]> {
    return prisma.googleBusinessProfile.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getMapsLocations(organizationId: string): Promise<GoogleMapsLocation[]> {
    const locations = await prisma.googleMapsLocation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return locations as any;
  }

  static async addMapsLocation(
    organizationId: string,
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    locationType: 'STORE' | 'WAREHOUSE' | 'DELIVERY_ZONE' | 'PICKUP_POINT'
  ): Promise<GoogleMapsLocation> {
    return prisma.googleMapsLocation.create({
      data: {
        organizationId,
        name,
        address,
        latitude,
        longitude,
        locationType,
      },
    }) as any;
  }

  static async getDashboardData(organizationId: string): Promise<GoogleIntegrationDashboard> {
    const [
      integrations,
      analyticsEvents,
      merchantFeeds,
      searchConsoleSites,
      businessProfiles,
      mapsLocations,
    ] = await Promise.all([
      this.getIntegrations(organizationId),
      this.getAnalyticsEvents(organizationId, 1000),
      this.getMerchantFeeds(organizationId),
      this.getSearchConsoleSites(organizationId),
      this.getBusinessProfiles(organizationId),
      this.getMapsLocations(organizationId),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = analyticsEvents.filter(e => e.timestamp >= today);
    const revenue = analyticsEvents
      .filter(e => e.eventType === 'purchase')
      .reduce((sum, e) => sum + (e.eventData.value || 0), 0);

    const sessions = new Set(analyticsEvents.map(e => e.sessionId)).size;
    const users = new Set(analyticsEvents.map(e => e.userId)).size;

    const connectedCount = integrations.filter(i => i.status === 'CONNECTED').length;
    const totalCount = integrations.length;
    const healthScore = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;

    const lastSync = integrations.reduce((latest, integration) => {
      return integration.lastSyncAt && (!latest || integration.lastSyncAt > latest)
        ? integration.lastSyncAt
        : latest;
    }, null as Date | null);

    const recommendations: string[] = [];
    
    if (!integrations.find(i => i.service === 'ANALYTICS' && i.enabled)) {
      recommendations.push('Enable Google Analytics 4 to track user behavior and conversions');
    }
    if (!integrations.find(i => i.service === 'MERCHANT_CENTER' && i.enabled)) {
      recommendations.push('Connect Google Merchant Center to showcase products on Google Shopping');
    }
    if (!integrations.find(i => i.service === 'SEARCH_CONSOLE' && i.enabled)) {
      recommendations.push('Verify your site with Google Search Console for SEO insights');
    }
    if (healthScore < 50) {
      recommendations.push('Review disconnected services and resolve configuration errors');
    }

    return {
      integrations,
      analytics: {
        totalEvents: analyticsEvents.length,
        todayEvents: todayEvents.length,
        revenue,
        sessions,
        users,
      },
      merchantFeeds,
      searchConsoleSites,
      businessProfiles,
      mapsLocations,
      healthScore,
      lastSync,
      recommendations,
    };
  }
}
