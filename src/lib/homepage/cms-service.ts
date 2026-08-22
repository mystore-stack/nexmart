import { prisma } from "@/lib/prisma";
import { HomepageSectionType } from "@prisma/client";

export async function getHomepageBuilderData(organizationId: string) {
  try {
    const builder = await prisma.homepageBuilder.findFirst({
      where: { 
        organizationId,
        isActive: true,
        isPublished: true,
      },
      include: {
        sections: {
          where: {
            isEnabled: true,
            publishStatus: "PUBLISHED",
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!builder) {
      return null;
    }

    return {
      builder,
      sections: builder.sections,
    };
  } catch (error) {
    console.error("Error fetching homepage builder data:", error);
    throw error;
  }
}

export async function getSectionConfig(sectionType: HomepageSectionType, organizationId: string) {
  try {
    switch (sectionType) {
      case "ANNOUNCEMENT_BAR":
        return await prisma.announcementBar.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "PROFESSIONAL_HERO":
        return await prisma.professionalHero.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "SPONSORED_PRODUCTS":
        return await prisma.sponsoredProductsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "FLASH_DEALS":
        return await prisma.flashDealsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "MYSTERY_BOX":
        return await prisma.mysteryBoxSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "BUNDLE_DEALS":
        return await prisma.bundleDealsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "SUPER_DEALS":
        return await prisma.superDealsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "SUMMER_PROMOTION":
        return await prisma.summerPromotionSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "WEATHER_SECTION":
        return await prisma.weatherSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "POPULAR_CATEGORIES":
        return await prisma.popularCategoriesSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "TRENDING_PRODUCTS":
        return await prisma.trendingProductsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "NEW_ARRIVALS":
        return await prisma.newArrivalsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "RECOMMENDED_FOR_YOU":
        return await prisma.recommendedForYouSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "BEST_SELLERS":
        return await prisma.bestSellersSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "FEATURED_BRANDS":
        return await prisma.featuredBrandsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "VIDEO_BANNER":
        return await prisma.videoBannerSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "TESTIMONIALS":
        return await prisma.testimonialsSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "OUR_ADVANTAGES":
        return await prisma.ourAdvantagesSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "NEWSLETTER":
        return await prisma.newsletterSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "INSTAGRAM_FEED":
        return await prisma.instagramFeedSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      case "PREMIUM_FOOTER":
        return await prisma.premiumFooterSection.findFirst({
          where: { organizationId, isEnabled: true },
        });
      default:
        return null;
    }
  } catch (error) {
    console.error("Error fetching section config:", error);
    return null;
  }
}

export async function createHomepageBuilder(organizationId: string) {
  try {
    return await prisma.homepageBuilder.create({
      data: {
        organizationId,
        name: "Homepage",
        isActive: true,
        isPublished: false,
      },
    });
  } catch (error) {
    console.error("Error creating homepage builder:", error);
    throw error;
  }
}

export async function addHomepageSection(
  builderId: string,
  sectionType: HomepageSectionType,
  displayOrder: number,
  config: any = {}
) {
  try {
    return await prisma.homepageSection.create({
      data: {
        builderId,
        sectionType,
        displayOrder,
        config,
        isEnabled: true,
        publishStatus: "DRAFT",
        translations: {},
      },
    });
  } catch (error) {
    console.error("Error adding homepage section:", error);
    throw error;
  }
}
