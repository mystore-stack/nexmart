import { prisma } from "@/lib/prisma";
import { GoogleIntegrationService } from "./index";

export class GoogleSearchConsoleService {
  static async verifySite(
    organizationId: string,
    siteUrl: string,
    verificationMethod: "META" | "HTML_FILE" | "DNS" | "GOOGLE_ANALYTICS" | "GOOGLE_TAG_MANAGER" | "DOMAIN_NAME"
  ): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
    try {
      const verificationToken = this.generateVerificationToken();

      const site = await GoogleIntegrationService.addSearchConsoleSite(organizationId, siteUrl);
      
      await prisma.googleSearchConsoleSite.update({
        where: { id: site.id },
        data: {
          verificationMethod,
        },
      });

      return {
        success: true,
        verificationToken,
      };
    } catch (error) {
      console.error("Search Console verification error:", error);
      return {
        success: false,
        error: "Failed to verify site",
      };
    }
  }

  static async submitSitemap(
    organizationId: string,
    siteUrl: string,
    sitemapUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const site = await prisma.googleSearchConsoleSite.findFirst({
        where: {
          organizationId,
          siteUrl,
        },
      });

      if (!site) {
        return {
          success: false,
          error: "Site not found",
        };
      }

      await prisma.googleSearchConsoleSite.update({
        where: { id: site.id },
        data: {
          sitemapUrl,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Sitemap submission error:", error);
      return {
        success: false,
        error: "Failed to submit sitemap",
      };
    }
  }

  static async getIndexStatus(
    organizationId: string,
    siteUrl: string
  ): Promise<{ indexedPages: number; crawlErrors: number; lastCrawlAt: Date | null }> {
    try {
      const site = await prisma.googleSearchConsoleSite.findFirst({
        where: {
          organizationId,
          siteUrl,
        },
      });

      if (!site) {
        return {
          indexedPages: 0,
          crawlErrors: 0,
          lastCrawlAt: null,
        };
      }

      return {
        indexedPages: site.indexedPages,
        crawlErrors: site.crawlErrors,
        lastCrawlAt: site.lastCrawlAt,
      };
    } catch (error) {
      console.error("Index status error:", error);
      return {
        indexedPages: 0,
        crawlErrors: 0,
        lastCrawlAt: null,
      };
    }
  }

  static async updateCrawlData(
    organizationId: string,
    siteUrl: string,
    indexedPages: number,
    crawlErrors: number
  ): Promise<void> {
    await prisma.googleSearchConsoleSite.updateMany({
      where: {
        organizationId,
        siteUrl,
      },
      data: {
        indexedPages,
        crawlErrors,
        lastCrawlAt: new Date(),
      },
    });
  }

  static async getCoverageReport(
    organizationId: string,
    siteUrl: string
  ): Promise<{ valid: number; excluded: number; error: number }> {
    try {
      const site = await prisma.googleSearchConsoleSite.findFirst({
        where: {
          organizationId,
          siteUrl,
        },
      });

      if (!site) {
        return {
          valid: 0,
          excluded: 0,
          error: 0,
        };
      }

      const valid = site.indexedPages;
      const error = site.crawlErrors;
      const excluded = Math.floor(valid * 0.1);

      return {
        valid,
        excluded,
        error,
      };
    } catch (error) {
      console.error("Coverage report error:", error);
      return {
        valid: 0,
        excluded: 0,
        error: 0,
      };
    }
  }

  static async getPerformanceOverview(
    organizationId: string,
    siteUrl: string
  ): Promise<{ clicks: number; impressions: number; ctr: number; position: number }> {
    try {
      return {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      };
    } catch (error) {
      console.error("Performance overview error:", error);
      return {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      };
    }
  }

  private static generateVerificationToken(): string {
    return `google-site-verification=${Math.random().toString(36).substring(2, 15)}`;
  }

  static async getSites(organizationId: string) {
    return GoogleIntegrationService.getSearchConsoleSites(organizationId);
  }

  static async removeSite(organizationId: string, siteUrl: string) {
    await prisma.googleSearchConsoleSite.deleteMany({
      where: {
        organizationId,
        siteUrl,
      },
    });
  }
}
