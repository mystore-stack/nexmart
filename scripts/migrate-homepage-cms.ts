import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateHomepageCMS() {
  console.log("Starting Homepage CMS migration...");

  try {
    // Step 1: Backup existing homepage data
    console.log("Step 1: Backing up existing homepage data...");
    
    const existingHomepageConfig = await prisma.homepageConfig.findMany();
    const existingAnnouncementBars = await prisma.announcementBar.findMany();
    const existingHomepageSections = await prisma.homepageSection.findMany();
    const existingHomepageVersions = await prisma.homepageVersion.findMany();

    console.log(`Found ${existingHomepageConfig.length} homepage configs`);
    console.log(`Found ${existingAnnouncementBars.length} announcement bars`);
    console.log(`Found ${existingHomepageSections.length} homepage sections`);
    console.log(`Found ${existingHomepageVersions.length} homepage versions`);

    // Step 2: Create HomepageBuilder for each organization
    console.log("Step 2: Creating HomepageBuilder records...");
    
    const organizations = await prisma.organization.findMany();
    
    for (const org of organizations) {
      // Check if builder already exists
      const existingBuilder = await prisma.homepageBuilder.findFirst({
        where: { organizationId: org.id },
      });

      if (!existingBuilder) {
        // Create new HomepageBuilder
        const builder = await prisma.homepageBuilder.create({
          data: {
            organizationId: org.id,
            name: "Homepage",
            isActive: true,
            isPublished: false,
            version: 1,
            autoSaveEnabled: true,
            analyticsEnabled: true,
            abTestingEnabled: false,
          },
        });

        console.log(`Created HomepageBuilder for organization: ${org.name}`);

        // Step 3: Migrate existing AnnouncementBar to new structure
        console.log("Step 3: Migrating AnnouncementBars...");
        
        const orgAnnouncementBar = existingAnnouncementBars.find(
          (bar) => bar.organizationId === org.id
        );

        if (orgAnnouncementBar) {
          await prisma.announcementBar.create({
            data: {
              organizationId: org.id,
              isEnabled: orgAnnouncementBar.isVisible,
              displayOrder: orgAnnouncementBar.displayOrder,
              text: orgAnnouncementBar.text,
              backgroundColor: orgAnnouncementBar.backgroundColor,
              textColor: orgAnnouncementBar.textColor,
              link: orgAnnouncementBar.ctaLink,
              linkText: orgAnnouncementBar.ctaText,
              icon: orgAnnouncementBar.icon,
              animation: "slide",
              autoHide: !orgAnnouncementBar.stickyMode,
              hideAfter: null,
              translations: {},
            },
          });

          console.log(`Migrated AnnouncementBar for organization: ${org.name}`);
        }

        // Step 4: Migrate existing HomepageSections to new structure
        console.log("Step 4: Migrating HomepageSections...");
        
        const orgHomepageConfig = existingHomepageConfig.find(
          (config) => config.organizationId === org.id
        );

        if (orgHomepageConfig) {
          const orgSections = existingHomepageSections.filter(
            (section) => section.homepageId === orgHomepageConfig.id
          );

          for (const section of orgSections) {
            // Map old section types to new section types
            const sectionTypeMap: Record<string, string> = {
              "HERO_SLIDER": "PROFESSIONAL_HERO",
              "ANNOUNCEMENT_BAR": "ANNOUNCEMENT_BAR",
              "FEATURED_PRODUCTS": "SPONSORED_PRODUCTS",
              "FLASH_DEALS": "FLASH_DEALS",
              "NEW_ARRIVALS": "NEW_ARRIVALS",
              "BEST_SELLERS": "BEST_SELLERS",
              "TRENDING_PRODUCTS": "TRENDING_PRODUCTS",
              "CATEGORIES": "POPULAR_CATEGORIES",
              "BRANDS": "FEATURED_BRANDS",
              "TESTIMONIALS": "TESTIMONIALS",
              "NEWSLETTER": "NEWSLETTER",
              "FOOTER": "PREMIUM_FOOTER",
              "VIDEO_BANNER": "VIDEO_BANNER",
              "INSTAGRAM_FEED": "INSTAGRAM_FEED",
            };

            const newSectionType = sectionTypeMap[section.type] || "PROFESSIONAL_HERO";

            await prisma.homepageSection.create({
              data: {
                builderId: builder.id,
                sectionType: newSectionType as any,
                isEnabled: section.isVisible,
                displayOrder: section.displayOrder,
                config: section.config,
                visibility: "PUBLIC",
                publishStatus: section.isPublished ? "PUBLISHED" : "DRAFT",
                translations: {},
                analyticsEnabled: true,
              },
            });

            console.log(`Migrated section: ${section.type} -> ${newSectionType}`);
          }
        }

        // Step 5: Create default sections if none exist
        console.log("Step 5: Creating default sections...");
        
        const sectionCount = await prisma.homepageSection.count({
          where: { builderId: builder.id },
        });

        if (sectionCount === 0) {
          const defaultSections = [
            { type: "ANNOUNCEMENT_BAR", order: 0 },
            { type: "PROFESSIONAL_HERO", order: 1 },
            { type: "SPONSORED_PRODUCTS", order: 2 },
            { type: "FLASH_DEALS", order: 3 },
            { type: "POPULAR_CATEGORIES", order: 4 },
            { type: "TRENDING_PRODUCTS", order: 5 },
            { type: "NEW_ARRIVALS", order: 6 },
            { type: "BEST_SELLERS", order: 7 },
            { type: "TESTIMONIALS", order: 8 },
            { type: "OUR_ADVANTAGES", order: 9 },
            { type: "NEWSLETTER", order: 10 },
            { type: "INSTAGRAM_FEED", order: 11 },
            { type: "PREMIUM_FOOTER", order: 12 },
          ];

          for (const section of defaultSections) {
            await prisma.homepageSection.create({
              data: {
                builderId: builder.id,
                sectionType: section.type as any,
                isEnabled: true,
                displayOrder: section.order,
                config: {},
                visibility: "PUBLIC",
                publishStatus: "PUBLISHED",
                translations: {},
                analyticsEnabled: true,
              },
            });
          }

          console.log(`Created ${defaultSections.length} default sections`);
        }
      }
    }

    // Step 6: Clean up old data (optional - comment out if you want to keep backup)
    console.log("Step 6: Cleaning up old data...");
    
    // Uncomment these lines to delete old data after successful migration
    // await prisma.homepageSectionVisibility.deleteMany({});
    // await prisma.homepageVersion.deleteMany({});
    // await prisma.homepageSection.deleteMany({});
    // await prisma.homepageConfig.deleteMany({});
    
    console.log("Migration completed successfully!");
    
    console.log("\nSummary:");
    console.log("- Created HomepageBuilder records for all organizations");
    console.log("- Migrated existing AnnouncementBars to new structure");
    console.log("- Migrated existing HomepageSections to new structure");
    console.log("- Created default sections for organizations without existing data");
    console.log("\nNext steps:");
    console.log("1. Review the migrated data in the database");
    console.log("2. Test the new Homepage Builder in the admin dashboard");
    console.log("3. Configure section settings in the CMS");
    console.log("4. Publish the homepage when ready");

  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateHomepageCMS()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
