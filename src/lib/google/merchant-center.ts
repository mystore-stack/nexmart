import { prisma } from "@/lib/prisma";
import { GoogleIntegrationService } from "./index";

interface ProductFeedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  availability: "in_stock" | "out_of_stock" | "preorder";
  brand: string;
  category: string;
  images: string[];
  gtin?: string;
  mpn?: string;
  shipping?: {
    country: string;
    service: string;
    price: number;
  };
  tax?: {
    country: string;
    rate: number;
    tax_ship: boolean;
  };
}

export class GoogleMerchantCenterService {
  static async createFeed(
    organizationId: string,
    integrationId: string,
    feedName: string
  ) {
    return GoogleIntegrationService.createMerchantFeed(
      organizationId,
      integrationId,
      feedName
    );
  }

  static async generateProductFeed(
    organizationId: string,
    feedId: string
  ): Promise<{ success: boolean; feedUrl?: string; error?: string }> {
    try {
      const feed = await prisma.googleMerchantFeed.findUnique({
        where: { id: feedId },
        include: { integration: true },
      });

      if (!feed) {
        return {
          success: false,
          error: "Feed not found",
        };
      }

      const products = await prisma.product.findMany({
        where: {
          organizationId,
          published: true,
        },
        include: {
          category: true,
          images: true,
        },
      });

      const feedItems: ProductFeedItem[] = products.map((product) => ({
        id: product.id,
        title: product.name,
        description: product.description || "",
        price: product.price,
        availability: product.stock > 0 ? "in_stock" : "out_of_stock",
        brand: "NexMart",
        category: product.category?.name || "",
        images: product.images.map((img) => img.url),
        gtin: product.gtin || undefined,
        mpn: product.mpn || undefined,
      }));

      const feedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/feeds/google/${feed.feedName}.xml`;

      await prisma.googleMerchantFeed.update({
        where: { id: feedId },
        data: {
          feedUrl,
          totalProducts: products.length,
          processedProducts: products.length,
          status: "ACTIVE",
          lastGeneratedAt: new Date(),
        },
      });

      return {
        success: true,
        feedUrl,
      };
    } catch (error) {
      console.error("Product feed generation error:", error);
      return {
        success: false,
        error: "Failed to generate product feed",
      };
    }
  }

  static async refreshFeed(
    organizationId: string,
    feedId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const feed = await prisma.googleMerchantFeed.findUnique({
        where: { id: feedId },
      });

      if (!feed) {
        return {
          success: false,
          error: "Feed not found",
        };
      }

      await prisma.googleMerchantFeed.update({
        where: { id: feedId },
        data: {
          status: "PROCESSING",
        },
      });

      const result = await this.generateProductFeed(organizationId, feedId);

      if (!result.success) {
        await prisma.googleMerchantFeed.update({
          where: { id: feedId },
          data: {
            status: "ERROR",
            error: result.error,
          },
        });
        return result;
      }

      await prisma.googleMerchantFeed.update({
        where: { id: feedId },
        data: {
          status: "ACTIVE",
          lastSyncAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Feed refresh error:", error);
      return {
        success: false,
        error: "Failed to refresh feed",
      };
    }
  }

  static async getFeeds(organizationId: string) {
    return GoogleIntegrationService.getMerchantFeeds(organizationId);
  }

  static async deleteFeed(feedId: string) {
    await prisma.googleMerchantFeed.delete({
      where: { id: feedId },
    });
  }

  static async enableFeed(feedId: string) {
    await prisma.googleMerchantFeed.update({
      where: { id: feedId },
      data: { status: "ACTIVE" },
    });
  }

  static async disableFeed(feedId: string) {
    await prisma.googleMerchantFeed.update({
      where: { id: feedId },
      data: { status: "DISABLED" },
    });
  }

  static async getFeedStats(organizationId: string) {
    const feeds = await this.getFeeds(organizationId);

    const totalProducts = feeds.reduce((sum, feed) => sum + feed.totalProducts, 0);
    const activeFeeds = feeds.filter((f) => f.status === "ACTIVE").length;
    const errorFeeds = feeds.filter((f) => f.status === "ERROR").length;

    return {
      totalFeeds: feeds.length,
      totalProducts,
      activeFeeds,
      errorFeeds,
    };
  }
}
