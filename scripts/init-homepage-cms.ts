import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initHomepageCMS() {
  console.log("Initializing Homepage CMS...");

  try {
    // Step 1: Get all organizations
    const organizations = await prisma.organization.findMany();
    console.log(`Found ${organizations.length} organizations`);

    // Step 2: Create HomepageBuilder for each organization
    for (const org of organizations) {
      const existingBuilder = await prisma.homepageBuilder.findFirst({
        where: { organizationId: org.id },
      });

      if (!existingBuilder) {
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

        // Step 3: Create default sections
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

        console.log(`Created ${defaultSections.length} default sections for ${org.name}`);
      } else {
        console.log(`HomepageBuilder already exists for: ${org.name}`);
      }
    }

    console.log("\n✓ Homepage CMS initialization completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Access the Homepage Builder in the admin dashboard");
    console.log("2. Configure section settings and content");
    console.log("3. Publish the homepage when ready");

  } catch (error) {
    console.error("Initialization failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initHomepageCMS()
  .then(() => {
    console.log("Initialization script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Initialization script failed:", error);
    process.exit(1);
  });
