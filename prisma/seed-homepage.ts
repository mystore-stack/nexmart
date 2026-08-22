import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHomepage() {
  console.log('🌱 Starting homepage seed...');

  // Create or get admin user
  let user = await prisma.user.findFirst({
    where: { email: 'admin@nexmart.ma' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@nexmart.ma',
        name: 'Admin User',
        password: 'hashed_password_here',
      },
    });
  }

  console.log(`✅ User: ${user.name} (${user.id})`);

  // Get or create default organization
  let organization = await prisma.organization.findFirst({
    where: { slug: 'nexmart' },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'NexMart Morocco',
        slug: 'nexmart',
        ownerId: user.id,
      },
    });
  }

  console.log(`✅ Organization: ${organization.name} (${organization.id})`);

  // Create Homepage Builder
  let homepageBuilder = await prisma.homepageBuilder.findFirst({
    where: { organizationId: organization.id },
  });

  if (!homepageBuilder) {
    homepageBuilder = await prisma.homepageBuilder.create({
      data: {
        organizationId: organization.id,
        name: 'Main Homepage',
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  console.log(`✅ Homepage Builder: ${homepageBuilder.id}`);

  // Create Homepage Sections for the builder
  const sectionTypes = [
    'ANNOUNCEMENT_BAR',
    'PROFESSIONAL_HERO',
    'SPONSORED_PRODUCTS',
    'FLASH_DEALS',
    'MYSTERY_BOX',
    'BUNDLE_DEALS',
    'SUPER_DEALS',
    'SUMMER_PROMOTION',
    'WEATHER_SECTION',
    'POPULAR_CATEGORIES',
    'TRENDING_PRODUCTS',
    'NEW_ARRIVALS',
    'RECOMMENDED_FOR_YOU',
    'BEST_SELLERS',
    'FEATURED_BRANDS',
    'VIDEO_BANNER',
    'TESTIMONIALS',
    'OUR_ADVANTAGES',
    'NEWSLETTER',
    'INSTAGRAM_FEED',
    'PREMIUM_FOOTER',
  ];

  for (let i = 0; i < sectionTypes.length; i++) {
    const sectionType = sectionTypes[i];
    
    const existingSection = await prisma.homepageSection.findFirst({
      where: {
        builderId: homepageBuilder.id,
        sectionType: sectionType as any,
      },
    });

    if (!existingSection) {
      await prisma.homepageSection.create({
        data: {
          builderId: homepageBuilder.id,
          sectionType: sectionType as any,
          displayOrder: i,
          isEnabled: true,
          publishStatus: 'PUBLISHED',
          config: {},
          translations: {},
          visibility: 'PUBLIC',
          analyticsEnabled: true,
        },
      });
    } else {
      await prisma.homepageSection.update({
        where: { id: existingSection.id },
        data: {
          displayOrder: i,
          isEnabled: true,
          publishStatus: 'PUBLISHED',
        },
      });
    }
  }

  console.log(`✅ Homepage Sections created (${sectionTypes.length} sections)`);

  // Create sample categories
  const categories = [
    { name: 'Fashion', slug: 'fashion', description: 'Luxury fashion items' },
    { name: 'Electronics', slug: 'electronics', description: 'Premium electronics' },
    { name: 'Home & Living', slug: 'home-living', description: 'Home decor and living' },
    { name: 'Beauty', slug: 'beauty', description: 'Beauty and cosmetics' },
    { name: 'Sports', slug: 'sports', description: 'Sports and fitness' },
    { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { 
        organizationId_slug: {
          organizationId: organization.id,
          slug: category.slug,
        }
      },
      update: {},
      create: {
        ...category,
        organizationId: organization.id,
      },
    });
  }

  console.log(`✅ Sample categories created (${categories.length} categories)`);

  // Create sample brands
  const brands = [
    { name: 'Luxury Brand 1', slug: 'luxury-brand-1', description: 'Premium luxury brand' },
    { name: 'Designer Brand 2', slug: 'designer-brand-2', description: 'Designer collection' },
    { name: 'Moroccan Artisan', slug: 'moroccan-artisan', description: 'Local craftsmanship' },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { 
        organizationId_slug: {
          organizationId: organization.id,
          slug: brand.slug,
        }
      },
      update: {},
      create: {
        ...brand,
        organizationId: organization.id,
      },
    });
  }

  console.log(`✅ Sample brands created (${brands.length} brands)`);

  console.log('🎉 Homepage seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Organization: ${organization.name}`);
  console.log(`- Homepage Builder: ${homepageBuilder.id}`);
  console.log(`- Homepage Sections: ${sectionTypes.length}`);
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Brands: ${brands.length}`);
  console.log('\n🌐 Admin URL: http://localhost:3000/admin/homepage-builder');
  console.log('🏠 Homepage URL: http://localhost:3000');
}

seedHomepage()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
