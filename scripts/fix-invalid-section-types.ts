import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSections() {
  console.log('=== MIGRATING SECTIONS FROM HomepageSection TO PageSection ===\n');

  // Get the HOME page
  const homePage = await prisma.$queryRaw`
    SELECT id, "pageType"::text as "pageType"
    FROM "PageBuilderPage"
    WHERE "pageType"::text = 'HOME'
  ` as any[];

  if (homePage.length === 0) {
    console.log('No HOME page found in PageBuilderPage');
    return;
  }

  const pageId = homePage[0].id;
  console.log(`Found HOME page with id: ${pageId}`);

  // Get all HomepageSection records
  const homepageSections = await prisma.$queryRaw`
    SELECT id, type::text as type, title, subtitle, config, "displayOrder", "isVisible"
    FROM "HomepageSection"
    ORDER BY "displayOrder" ASC
  ` as any[];

  console.log(`Found ${homepageSections.length} HomepageSection records to migrate`);

  // Map HomepageSectionType to PageSectionType
  const typeMapping: Record<string, string> = {
    'HERO': 'HERO',
    'FEATURED_PRODUCTS': 'FEATURED_PRODUCTS',
    'CATEGORIES': 'CATEGORIES',
    'FLASH_DEALS': 'FLASH_DEALS',
    'NEW_ARRIVALS': 'NEW_ARRIVALS',
    'BRANDS': 'BRAND_LOGOS',
    'TESTIMONIALS': 'TESTIMONIALS',
    'NEWSLETTER': 'NEWSLETTER',
    'FAQ': 'FAQ',
    'CUSTOM_HTML': 'CUSTOM_HTML',
    'AI_RECOMMENDATIONS': 'RECOMMENDED_PRODUCTS',
  };

  // Delete existing PageSection records for this page
  await prisma.$executeRaw`
    DELETE FROM "PageSection"
    WHERE "pageId" = ${pageId}::uuid
  `;
  console.log('Deleted existing PageSection records for HOME page');

  // Migrate each section
  for (const section of homepageSections) {
    const mappedType = typeMapping[section.type] || section.type;
    
    await prisma.$executeRaw`
      INSERT INTO "PageSection" (
        id, "pageId", "sectionType", enabled, "displayOrder", config, 
        "backgroundColor", "backgroundImage", "overlayColor", "overlayOpacity",
        "layoutStyle", "themeVariant", "spacing", "createdAt", "updatedAt"
      )
      VALUES (
        ${section.id}::uuid,
        ${pageId}::uuid,
        ${mappedType}::"PageSectionType",
        ${section.isVisible}::boolean,
        ${section.displayOrder}::int,
        ${JSON.stringify(section.config)}::jsonb,
        '#ffffff'::text,
        NULL::text,
        NULL::text,
        0.0::float8,
        'default'::text,
        'light'::text,
        'medium'::text,
        NOW()::timestamp,
        NOW()::timestamp
      )
    `;
    console.log(`Migrated section ${section.id}: ${section.type} -> ${mappedType}`);
  }

  console.log('\n=== MIGRATION COMPLETE ===');
  
  // Verify migration
  const pageSections = await prisma.$queryRaw`
    SELECT "sectionType"::text as "sectionType", enabled, "displayOrder"
    FROM "PageSection"
    WHERE "pageId" = ${pageId}::uuid
    ORDER BY "displayOrder" ASC
  ` as any[];
  
  console.log('PageSection records after migration:', pageSections);
}

migrateSections()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
