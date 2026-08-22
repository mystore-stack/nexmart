import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
// Inline normalizeSectionType to avoid importing TS modules
function normalizeSectionType(raw) {
  if (!raw) return null;
  const CANONICAL_KEYS = new Set([
    'HERO','PROFESSIONAL_HERO','ANNOUNCEMENT_BAR','SPONSORED_PRODUCTS','FLASH_DEALS','CATEGORIES','POPULAR_CATEGORIES','FEATURED_PRODUCTS','NEW_ARRIVALS','TRENDING_PRODUCTS','BRANDS','FEATURED_BRANDS','NEWSLETTER','CUSTOM_HTML','TESTIMONIALS','FAQ','AI_RECOMMENDATIONS','LUXURY_COLLECTIONS','BUNDLE_DEALS','MYSTERY_BOXES','MYSTERY_BOX','SUPER_DEALS','INSTAGRAM_GALLERY','INSTAGRAM_FEED','SUMMER_PROMOTION','WEATHER_SECTION','RECOMMENDED_FOR_YOU','BEST_SELLERS','VIDEO_BANNER','OUR_ADVANTAGES','PREMIUM_FOOTER','FOOTER','WHY_NEXMART','MOBILE_APP'
  ]);

  const ALIAS_MAP = {
    hero: 'HERO',
    professionalhero: 'PROFESSIONAL_HERO',
    flashsale: 'FLASH_DEALS', flash_deals: 'FLASH_DEALS', flash_deals_: 'FLASH_DEALS', flashdeals: 'FLASH_DEALS',
    categories: 'CATEGORIES', category: 'CATEGORIES', popularcategories: 'POPULAR_CATEGORIES', popular_categories: 'POPULAR_CATEGORIES',
    featuredproducts: 'FEATURED_PRODUCTS', featured_products: 'FEATURED_PRODUCTS', featured: 'FEATURED_PRODUCTS',
    newarrivals: 'NEW_ARRIVALS', new_arrivals: 'NEW_ARRIVALS', trending: 'TRENDING_PRODUCTS', trendingproducts: 'TRENDING_PRODUCTS', trending_products: 'TRENDING_PRODUCTS',
    brands: 'FEATURED_BRANDS', brandcarousel: 'FEATURED_BRANDS',
    newsletter: 'NEWSLETTER', customhtml: 'CUSTOM_HTML', custom_html: 'CUSTOM_HTML', testimonials: 'TESTIMONIALS', faq: 'FAQ',
    airecommendations: 'AI_RECOMMENDATIONS', ai_recommendations: 'AI_RECOMMENDATIONS',
    luxurycollections: 'LUXURY_COLLECTIONS', bundledeals: 'BUNDLE_DEALS', bundle_deals: 'BUNDLE_DEALS',
    mysterybox: 'MYSTERY_BOXES', mystery_box: 'MYSTERY_BOXES', mystery_boxes: 'MYSTERY_BOXES', mysterybox_: 'MYSTERY_BOXES',
    superdeals: 'SUPER_DEALS', super_deals: 'SUPER_DEALS',
    instagram: 'INSTAGRAM_GALLERY', instagramfeed: 'INSTAGRAM_GALLERY', instagram_feed: 'INSTAGRAM_GALLERY', instagram_gallery: 'INSTAGRAM_GALLERY',
    summerpromotion: 'SUMMER_PROMOTION', weather: 'WEATHER_SECTION', weather_section: 'WEATHER_SECTION', recommended: 'RECOMMENDED_FOR_YOU', bestsellers: 'BEST_SELLERS', best_sellers: 'BEST_SELLERS', video_banner: 'VIDEO_BANNER', ouradvantages: 'OUR_ADVANTAGES', premiumfooter: 'PREMIUM_FOOTER', footer: 'FOOTER', why_nexmart: 'WHY_NEXMART', whynexmart: 'WHY_NEXMART', mobileapp: 'MOBILE_APP', mobile_app: 'MOBILE_APP'
  };

  const cleaned = String(raw).trim();
  if (CANONICAL_KEYS.has(cleaned)) return cleaned;
  const low = cleaned.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  if (ALIAS_MAP[low]) return ALIAS_MAP[low];
  const upper = cleaned.toUpperCase();
  if (CANONICAL_KEYS.has(upper)) return upper;
  return null;
}

// WARNING: Run this script only after reviewing changes. It will update DB rows.
// Usage: node --experimental-modules scripts/normalize-homepage-sections.mjs

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching homepage sections...');
  const model = prisma.homepageSection || prisma.homePageSection || prisma.HomePageSection;
  if (!model) throw new Error('Prisma model for homepage sections not found on client');
  const sections = await model.findMany();
  console.log(`Found ${sections.length} sections`);

  for (const s of sections) {
    const raw = s.type;
    const canonical = normalizeSectionType(String(raw)) || raw;
    if (canonical !== raw) {
      console.log(`Updating ${s.id}: ${raw} -> ${canonical}`);
      await prisma.homepageSection.update({ where: { id: s.id }, data: { type: canonical } });
    }
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
