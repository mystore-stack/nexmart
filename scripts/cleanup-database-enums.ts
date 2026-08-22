import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDatabaseEnums() {
  console.log("Cleaning up database enum conflicts...");

  try {
    // Drop all tables that use the conflicting enums first
    const tablesToDrop = [
      "HomepageSectionVisibility",
      "AnnouncementBarAnalytics", 
      "HomepageVersion",
      "HomepageSection",
      "HomepageConfig",
      "AnnouncementBar",
      "HomepageBuilder",
      "SectionAnalytics",
      "SectionVersion",
      "HomepageABTest",
      "HomepageAnalytics",
      "AnnouncementBar",
      "ProfessionalHero",
      "SponsoredProductsSection",
      "FlashDealsSection",
      "MysteryBoxSection",
      "BundleDealsSection",
      "SuperDealsSection",
      "SummerPromotionSection",
      "WeatherSection",
      "PopularCategoriesSection",
      "TrendingProductsSection",
      "NewArrivalsSection",
      "RecommendedForYouSection",
      "BestSellersSection",
      "FeaturedBrandsSection",
      "VideoBannerSection",
      "TestimonialsSection",
      "OurAdvantagesSection",
      "NewsletterSection",
      "InstagramFeedSection",
      "PremiumFooterSection",
      "LuxuryNavigationSection",
      "PageBuilderPage",
      "PageSection"
    ];

    for (const table of tablesToDrop) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
      console.log(`Dropped table: ${table}`);
    }

    // Drop the old enum types
    const enumsToDrop = [
      "HomepageSectionType",
      "PageSectionType",
      "SectionVisibility",
      "PublishStatus",
      "ABTestStatus",
      "AnalyticsEventType"
    ];

    for (const enumName of enumsToDrop) {
      await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "${enumName}" CASCADE;`);
      console.log(`Dropped enum: ${enumName}`);
    }

    console.log("✓ Database enum cleanup completed");

  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabaseEnums()
  .then(() => {
    console.log("Cleanup script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Cleanup script failed:", error);
    process.exit(1);
  });
