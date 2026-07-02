/**
 * Migration Script: HomepageConfig to Page Builder
 * 
 * This script migrates data from the legacy HomepageConfig system to the unified Page Builder system.
 * It preserves all existing content and maps section types appropriately.
 * 
 * Usage:
 *   npx tsx scripts/migrate-homepage-to-page-builder.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping from HomepageSectionType to PageSectionType
const SECTION_TYPE_MAPPING: Record<string, string> = {
  'HERO': 'HERO',
  'FEATURED_PRODUCTS': 'FEATURED_PRODUCTS',
  'CATEGORIES': 'CATEGORIES',
  'FLASH_DEALS': 'FLASH_DEALS',
  'NEW_ARRIVALS': 'NEW_ARRIVALS',
  'BRANDS': 'BRAND_LOGOS',
  'TESTIMONIALS': 'TESTIMONIALS',
  'FAQ': 'FAQ',
  'NEWSLETTER': 'NEWSLETTER',
  'CUSTOM_HTML': 'CUSTOM_HTML',
  'AI_RECOMMENDATIONS': 'RECOMMENDED_PRODUCTS',
};

async function migrateHomepageToPageBuilder() {
  console.log('🚀 Starting migration from HomepageConfig to Page Builder...');

  try {
    // Check if migration already ran
    const existingHomePage = await prisma.pageBuilderPage.findFirst({
      where: {
        pageType: 'HOME',
      },
    });

    if (existingHomePage) {
      console.log('⚠️  Home page already exists in Page Builder. Skipping migration.');
      console.log('   To re-run migration, delete the existing HOME page first.');
      return;
    }

    // Fetch all HomepageConfig records
    const homepageConfigs = await prisma.homepageConfig.findMany({
      include: {
        sections: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (homepageConfigs.length === 0) {
      console.log('ℹ️  No HomepageConfig records found. Nothing to migrate.');
      return;
    }

    console.log(`📦 Found ${homepageConfigs.length} HomepageConfig records to migrate.`);

    let migratedCount = 0;

    for (const config of homepageConfigs) {
      console.log(`\n📝 Migrating HomepageConfig: ${config.id}`);

      // Create PageBuilderPage for each active HomepageConfig
      const pageBuilderPage = await prisma.pageBuilderPage.create({
        data: {
          organizationId: config.organizationId,
          pageType: 'HOME',
          name: 'Home Page',
          slug: 'home',
          status: config.status,
          enabled: config.isActive,
          featured: false,
          publishDate: config.publishedAt,
          unpublishDate: null,
          displayOrder: 0,
          seoTitle: 'Home',
          seoDescription: 'Welcome to our store',
          seoKeywords: null,
          canonicalUrl: null,
          ogImage: null,
          twitterImage: null,
          accentColor: '#0F766E',
          sectionBackground: '#ffffff',
          buttonStyle: 'default',
          cardStyle: 'default',
          borderRadius: 'medium',
          shadow: 'medium',
          gradient: null,
        },
      });

      console.log(`   ✅ Created PageBuilderPage: ${pageBuilderPage.id}`);

      // Migrate sections
      for (const section of config.sections) {
        const mappedSectionType = SECTION_TYPE_MAPPING[section.type] || 'CUSTOM_HTML';

        await prisma.pageSection.create({
          data: {
            pageId: pageBuilderPage.id,
            sectionType: mappedSectionType as any,
            enabled: section.isVisible,
            displayOrder: section.displayOrder,
            startDate: null,
            endDate: null,
            visibility: 'ALL',
            backgroundColor: '#ffffff',
            backgroundImage: null,
            overlayColor: null,
            overlayOpacity: 0,
            layoutStyle: 'default',
            themeVariant: 'light',
            spacing: 'medium',
            config: section.config as any,
          },
        });

        console.log(`   ✅ Migrated section: ${section.type} -> ${mappedSectionType}`);
      }

      // Create initial version
      await prisma.pageVersion.create({
        data: {
          pageId: pageBuilderPage.id,
          versionNumber: 1,
          createdBy: null,
          changeNote: 'Migrated from HomepageConfig',
          snapshot: {
            sections: config.sections,
            config: {
              featuredCategories: config.featuredCategories,
              featuredProducts: config.featuredProducts,
              featuredBrands: config.featuredBrands,
              testimonials: config.testimonials,
              newsletterEnabled: config.newsletterEnabled,
              newsletterTitle: config.newsletterTitle,
              newsletterSubtitle: config.newsletterSubtitle,
            },
          },
          isAutoSave: false,
        },
      });

      console.log(`   ✅ Created initial version`);

      migratedCount++;
    }

    console.log(`\n✨ Migration completed successfully!`);
    console.log(`   📊 Migrated ${migratedCount} HomepageConfig records to Page Builder`);
    console.log(`\n⚠️  IMPORTANT: After migration:`);
    console.log(`   1. Test the new Home page at /`);
    console.log(`   2. Verify all sections render correctly`);
    console.log(`   3. Update the Home page component to use Page Builder`);
    console.log(`   4. Once verified, you can safely delete HomepageConfig tables`);
    console.log(`   5. Run: npx prisma db push to apply schema changes`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateHomepageToPageBuilder()
  .then(() => {
    console.log('\n🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
