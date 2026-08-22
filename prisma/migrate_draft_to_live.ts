// Migration script to safely migrate draft fields to live fields
// This script preserves data from draft fields before removing them

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDraftToLive() {
  console.log('Starting migration of draft fields to live fields...');

  try {
    // Get all sections that have draft data
    const sections = await prisma.homePageSection.findMany({
      where: {
        OR: [
          { draftActive: { not: null } },
          { draftDisplayOrder: { not: null } },
          { draftThemeSettings: { not: null } },
          { isDraft: true }
        ]
      }
    });

    console.log(`Found ${sections.length} sections with draft data`);

    // Migrate each section
    for (const section of sections) {
      const updateData: any = {};

      // If draft fields have values, use them for live fields
      if (section.draftActive !== null) {
        updateData.active = section.draftActive;
      }
      if (section.draftDisplayOrder !== null) {
        updateData.displayOrder = section.draftDisplayOrder;
      }
      if (section.draftThemeSettings !== null) {
        updateData.themeSettings = section.draftThemeSettings;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await prisma.homePageSection.update({
          where: { id: section.id },
          data: updateData
        });
        console.log(`Migrated section: ${section.sectionKey}`);
      }
    }

    console.log('Migration completed successfully');
    console.log('You can now run: npx prisma db push --accept-data-loss');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateDraftToLive()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
