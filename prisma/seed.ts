// prisma/seed.ts
import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL || "";
const DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED || "";

function pickDatabaseUrl() {
  const looksLocalhost = DATABASE_URL.toLowerCase().includes("localhost") || DATABASE_URL.toLowerCase().includes("127.0.0.1");
  if (looksLocalhost && DATABASE_URL_UNPOOLED) return DATABASE_URL_UNPOOLED;
  return DATABASE_URL;
}

const seedDatabaseUrl = pickDatabaseUrl();

const prisma = new PrismaClient({
  datasources: {
    db: { url: seedDatabaseUrl },
  },
});

if (!seedDatabaseUrl) {
  throw new Error("Missing DATABASE_URL. Check .env.local/.env.");
}

function slugifyText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=250&q=80" },
  { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=250&q=80" },
  { name: "Beauty", slug: "beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=250&q=80" },
  { name: "Home & Living", slug: "home-living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=250&q=80" },
  { name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=250&q=80" },
  { name: "Books", slug: "books", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=250&q=80" },
  { name: "Automotive", slug: "automotive", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=250&q=80" },
  { name: "Gaming", slug: "gaming", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=250&q=80" },
];

const CATEGORY_BLUEPRINTS: Record<string, Array<{ name: string; descriptor: string; feature: string; basePrice: number }>> = {
  electronics: [
    { name: "Smartphone", descriptor: "AI", feature: "adaptive camera systems", basePrice: 749 },
    { name: "Laptop", descriptor: "Ultra-light", feature: "all-day battery life", basePrice: 1299 },
    { name: "Earbuds", descriptor: "Studio", feature: "spatial audio", basePrice: 179 },
    { name: "Smartwatch", descriptor: "Health", feature: "precision health insights", basePrice: 299 },
    { name: "Tablet", descriptor: "Canvas", feature: "fluid multitasking", basePrice: 499 },
    { name: "Monitor", descriptor: "Vision", feature: "4K clarity", basePrice: 329 },
    { name: "Portable Speaker", descriptor: "Pulse", feature: "room-filling sound", basePrice: 159 },
    { name: "Dock", descriptor: "Hub", feature: "fast charging", basePrice: 89 },
  ],
  fashion: [
    { name: "Coat", descriptor: "Minimal", feature: "premium wool finishes", basePrice: 189 },
    { name: "Tote", descriptor: "City", feature: "structured silhouettes", basePrice: 149 },
    { name: "Jacket", descriptor: "Tempo", feature: "breathable shells", basePrice: 119 },
    { name: "Sneaker", descriptor: "Urban", feature: "cushioned soles", basePrice: 129 },
    { name: "Bag", descriptor: "Studio", feature: "daily organization", basePrice: 169 },
    { name: "Scarf", descriptor: "Luxe", feature: "soft drape", basePrice: 79 },
    { name: "Jacket", descriptor: "Classic", feature: "timeless fits", basePrice: 109 },
    { name: "Dress", descriptor: "Evening", feature: "fluid movement", basePrice: 159 },
  ],
  beauty: [
    { name: "Serum", descriptor: "Glow", feature: "deep hydration", basePrice: 69 },
    { name: "Roller", descriptor: "Rose", feature: "soothing massage", basePrice: 39 },
    { name: "Dryer", descriptor: "Silk", feature: "ionic precision", basePrice: 89 },
    { name: "Set", descriptor: "Studio", feature: "long-wear finishes", basePrice: 59 },
    { name: "Lotion", descriptor: "Velvet", feature: "nutrient-rich care", basePrice: 29 },
    { name: "Perfume", descriptor: "Velour", feature: "layered aromas", basePrice: 129 },
    { name: "Mask", descriptor: "Calm", feature: "restorative care", basePrice: 24 },
    { name: "Kit", descriptor: "Restore", feature: "daily rituals", basePrice: 74 },
  ],
  "home-living": [
    { name: "Lamp", descriptor: "Aura", feature: "warm ambient glow", basePrice: 89 },
    { name: "Blanket", descriptor: "Cloud", feature: "soft woven comfort", basePrice: 59 },
    { name: "Table", descriptor: "Modular", feature: "clean modern lines", basePrice: 299 },
    { name: "Organizer", descriptor: "Focus", feature: "minimal workspace utility", basePrice: 49 },
    { name: "Purifier", descriptor: "Pure", feature: "quiet filtration", basePrice: 199 },
    { name: "Blender", descriptor: "Nourish", feature: "smooth texture control", basePrice: 129 },
    { name: "Candle", descriptor: "Maison", feature: "slow burn fragrances", basePrice: 34 },
    { name: "Basket", descriptor: "Tidy", feature: "woven organization", basePrice: 29 },
  ],
  sports: [
    { name: "Mat", descriptor: "Flow", feature: "non-slip grip", basePrice: 49 },
    { name: "Band", descriptor: "Core", feature: "portable training", basePrice: 29 },
    { name: "Helmet", descriptor: "Ride", feature: "impact protection", basePrice: 79 },
    { name: "Bottle", descriptor: "Hydra", feature: "double-wall insulation", basePrice: 24 },
    { name: "Treadmill", descriptor: "Sprint", feature: "foldable design", basePrice: 799 },
    { name: "Tracker", descriptor: "Pulse", feature: "real-time metrics", basePrice: 129 },
    { name: "Backpack", descriptor: "Summit", feature: "weather-ready storage", basePrice: 109 },
    { name: "Roller", descriptor: "Recover", feature: "post-workout comfort", basePrice: 39 },
  ],
  books: [
    { name: "Guide", descriptor: "Modern", feature: "fresh ideas and practical inspiration", basePrice: 34 },
    { name: "Cookbook", descriptor: "Moroccan", feature: "weeknight recipes", basePrice: 29 },
    { name: "Journal", descriptor: "Atlas", feature: "city notes and sketches", basePrice: 19 },
    { name: "Book", descriptor: "Studio", feature: "editorial visual stories", basePrice: 44 },
    { name: "Playbook", descriptor: "Scale", feature: "clear frameworks", basePrice: 39 },
    { name: "Manual", descriptor: "Balance", feature: "daily rituals", basePrice: 24 },
    { name: "Novel", descriptor: "Harbor", feature: "immersive storytelling", basePrice: 19 },
    { name: "Workbook", descriptor: "Ink", feature: "guided prompts", basePrice: 21 },
  ],
  automotive: [
    { name: "Vacuum", descriptor: "Clean", feature: "cordless suction", basePrice: 109 },
    { name: "Mount", descriptor: "Drive", feature: "secure hands-free utility", basePrice: 29 },
    { name: "Inflator", descriptor: "Air", feature: "rapid inflation", basePrice: 79 },
    { name: "Organizer", descriptor: "Cargo", feature: "smart storage", basePrice: 39 },
    { name: "Mat", descriptor: "Guard", feature: "all-weather protection", basePrice: 69 },
    { name: "Starter", descriptor: "Boost", feature: "emergency power", basePrice: 119 },
    { name: "Cam", descriptor: "Vision", feature: "night recording", basePrice: 149 },
    { name: "Kit", descriptor: "Shine", feature: "premium detailing", basePrice: 54 },
  ],
  gaming: [
    { name: "Keyboard", descriptor: "Tactile", feature: "responsive switches", basePrice: 129 },
    { name: "Controller", descriptor: "Play", feature: "low-latency connection", basePrice: 79 },
    { name: "Headset", descriptor: "Arena", feature: "immersive audio", basePrice: 99 },
    { name: "Monitor", descriptor: "Frame", feature: "high refresh rates", basePrice: 349 },
    { name: "Mouse", descriptor: "Swift", feature: "precision tracking", basePrice: 59 },
    { name: "Card", descriptor: "Stream", feature: "4K capture", basePrice: 199 },
    { name: "Chair", descriptor: "Pro", feature: "ergonomic support", basePrice: 399 },
    { name: "Mat", descriptor: "Arena", feature: "premium surfaces", basePrice: 39 },
  ],
};

const IMAGE_POOL: Record<string, string[]> = {
  electronics: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=80",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80",
  ],
  "home-living": [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80",
    "https://images.unsplash.com/photo-1448630360428-65456885c650?w=900&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80",
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900&q=80",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900&q=80",
  ],
  automotive: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=900&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&q=80",
  ],
  gaming: [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80",
    "https://images.unsplash.com/photo-1511882150382-421056c89033?w=900&q=80",
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=900&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=900&q=80",
  ],
};

const MOROCCAN_FIRST_NAMES = ["Yassine", "Salma", "Karim", "Meryem", "Omar", "Lina", "Nabil", "Fatima", "Amine", "Hind", "Bilal", "Sofia", "Hassan", "Imane", "Riad", "Zohra", "Samira", "Anas", "Nadia", "Mehdi"];
const MOROCCAN_LAST_NAMES = ["Benali", "El Idrissi", "Tazi", "Mansouri", "Ait Baha", "Chraibi", "Boudou", "Kabbaj", "Berrada", "Lahlou", "Ziani", "Rami", "El Youssfi", "Mouline", "Haddad", "Mourad", "Lamrani", "Bennani", "Safi", "Alaoui"];
const COUPONS = [
  { code: "WELCOME10", type: "PERCENTAGE", value: 10, description: "10% off your first order", usageLimit: 1000, userLimit: 1 },
  { code: "NEXMART10", type: "PERCENTAGE", value: 10, description: "10% off sitewide", usageLimit: 500, userLimit: 3 },
  { code: "SAVE20", type: "FIXED", value: 20, description: "$20 off orders over $100", minOrder: 100 },
  { code: "FREESHIP", type: "FIXED", value: 9.99, description: "Free shipping on any order" },
];

type ProductSeed = {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  compareAtPrice: number;
  discount: number;
  stock: number;
  sku: string;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  galleryImages: string[];
  featuredImage: string;
  badges: string[];
  tags: string[];
  featured: boolean;
  published: boolean;
};

function buildProductSeed(categorySlug: string, index: number): ProductSeed {
  const blueprints = CATEGORY_BLUEPRINTS[categorySlug];
  const blueprint = blueprints[index % blueprints.length];
  const brand = randomFrom(["NexMart", "Luma", "Aro", "Mira", "Vanta", "Luxe", "Atlas", "Nova", "Sora", "Kairo"]);
  const color = randomFrom(["Midnight", "Birch", "Slate", "Emerald", "Cobalt", "Sage", "Terracotta", "Ivory"]);
  const material = randomFrom(["Signature", "Edition", "Max", "Pro", "Studio", "Lite", "Urban", "Air", "Flex"]);
  const price = roundCurrency(blueprint.basePrice + (index % 7) * 21 + (index % 3) * 9);
  const discountPercent = [10, 12, 15, 18, 20, 22, 25][index % 7];
  const comparePrice = roundCurrency(price * (1 + discountPercent / 100));
  const rating = roundCurrency(Number((4.2 + (index % 8) * 0.08 + (index % 3) * 0.04).toFixed(1)));
  const reviewCount = 120 + (index * 37) % 9800 + 110;
  const stock = 12 + ((index * 17) % 240);
  const badgePool = ["Best Seller", "New", "Trending", "Limited", "Premium", "Editor's Choice"];
  const badges = [badgePool[index % badgePool.length], badgePool[(index + 2) % badgePool.length]];
  const productName = `${brand} ${blueprint.descriptor} ${blueprint.name} ${color}`.trim();
  const shortDescription = `${productName} brings ${blueprint.feature} together with refined craftsmanship and a premium finish.`;
  const longDescription = `${productName} is designed for shoppers who want dependable performance, modern aesthetics, and everyday comfort. Its thoughtful engineering balances style, durability, and practicality for both home and travel.`;
  const images = IMAGE_POOL[categorySlug];
  const galleryImages = [images[index % images.length], images[(index + 1) % images.length], images[(index + 2) % images.length]];
  const categoryPrefix = categorySlug.replace(/[^a-z0-9]+/g, "").slice(0, 4).toUpperCase();
  const sku = `${categoryPrefix}-${String(index + 1).padStart(4, "0")}`;
  const slug = slugifyText(`${categorySlug}-${brand.toLowerCase()}-${blueprint.name.toLowerCase()}-${color.toLowerCase()}-${index + 1}`);

  return {
    name: productName,
    slug,
    shortDescription,
    longDescription,
    price,
    compareAtPrice: comparePrice,
    discount: discountPercent,
    stock,
    sku,
    brand,
    category: categorySlug,
    rating,
    reviewCount,
    galleryImages,
    featuredImage: galleryImages[0],
    badges,
    tags: [categorySlug, `brand:${brand.toLowerCase()}`, `material:${material.toLowerCase()}`, `badge:${badges[0].toLowerCase().replace(/\s+/g, "-")}`],
    featured: index % 5 === 0,
    published: true,
  };
}

async function main() {
  console.log("🌱 Seeding database...");

  const adminPw = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexmart.com" },
    update: {},
    create: { email: "admin@nexmart.com", name: "Admin User", password: adminPw, role: "ADMIN", emailVerified: true },
  });

  const userPw = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@nexmart.com" },
    update: {},
    create: { email: "user@nexmart.com", name: "Demo User", password: userPw, role: "USER", emailVerified: true },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "nexmart" },
    update: {},
    create: { name: "NexMart", slug: "nexmart", ownerId: admin.id },
  });

  await prisma.$executeRaw`INSERT INTO "Membership" ("id", "userId", "organizationId", "role", "createdAt", "updatedAt") VALUES (gen_random_uuid(), ${admin.id}::uuid, ${organization.id}::uuid, CAST(${"OWNER"} AS "OrgRole"), now(), now()) ON CONFLICT ("userId", "organizationId") DO UPDATE SET "role" = EXCLUDED."role", "updatedAt" = EXCLUDED."updatedAt";`;
  await prisma.$executeRaw`INSERT INTO "Membership" ("id", "userId", "organizationId", "role", "createdAt", "updatedAt") VALUES (gen_random_uuid(), ${demoUser.id}::uuid, ${organization.id}::uuid, CAST(${"MEMBER"} AS "OrgRole"), now(), now()) ON CONFLICT ("userId", "organizationId") DO UPDATE SET "role" = EXCLUDED."role", "updatedAt" = EXCLUDED."updatedAt";`;

  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { organizationId_slug: { organizationId: organization.id, slug: cat.slug } },
      update: { name: cat.name, image: cat.image },
      create: { organizationId: organization.id, name: cat.name, slug: cat.slug, image: cat.image },
    });
    const category = await prisma.category.findFirst({ where: { organizationId: organization.id, slug: cat.slug }, select: { id: true } });
    if (category) categoryMap[cat.slug] = category.id;
  }
  console.log(`✅ ${CATEGORIES.length} categories seeded`);

  const productSeeds: ProductSeed[] = [];
  const productCounts = [30, 30, 30, 30, 30, 30, 30, 30];
  for (const [index, categorySlug] of Object.keys(CATEGORY_BLUEPRINTS).entries()) {
    for (let offset = 0; offset < productCounts[index]; offset += 1) {
      productSeeds.push(buildProductSeed(categorySlug, offset));
    }
  }

  // Track seen product slugs to prevent duplicates in seed data itself
  const seenSlugs = new Set<string>();
  const seenSkus = new Set<string>();
  const uniqueProductSeeds: ProductSeed[] = [];

  for (const productSeed of productSeeds) {
    // Skip if this product's slug or sku was already seen in the seed data
    if (seenSlugs.has(productSeed.slug) || seenSkus.has(productSeed.sku)) {
      console.warn(`⚠️ Skipping duplicate product in seed data: ${productSeed.slug} / ${productSeed.sku}`);
      continue;
    }
    seenSlugs.add(productSeed.slug);
    seenSkus.add(productSeed.sku);
    uniqueProductSeeds.push(productSeed);
  }

  for (const productSeed of uniqueProductSeeds) {
    const categoryId = categoryMap[productSeed.category];
    if (!categoryId) continue;

    const existingProduct = await prisma.product.findFirst({
      where: {
        organizationId: organization.id,
        OR: [{ slug: productSeed.slug }, { sku: productSeed.sku }],
      },
      select: { id: true },
    });

    const payload = {
      organizationId: organization.id,
      name: productSeed.name,
      slug: productSeed.slug,
      description: `${productSeed.shortDescription}\n\n${productSeed.longDescription}`,
      price: productSeed.price,
      comparePrice: productSeed.compareAtPrice,
      categoryId,
      images: productSeed.galleryImages,
      tags: productSeed.tags,
      sku: productSeed.sku,
      stock: productSeed.stock,
      published: productSeed.published,
      featured: productSeed.featured,
      rating: productSeed.rating,
      reviewCount: productSeed.reviewCount,
    };

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: payload,
      });
    } else {
      await prisma.product.create({ data: payload });
    }
  }
  console.log(`✅ ${uniqueProductSeeds.length} products seeded (skipped ${productSeeds.length - uniqueProductSeeds.length} duplicates)`);

  const productIds = await prisma.product.findMany({ where: { organizationId: organization.id, published: true }, select: { id: true }, orderBy: { createdAt: "asc" } });

  const users: Array<{ id: string; email: string; name: string }> = [];
  for (let i = 0; i < 24; i += 1) {
    const firstName = randomFrom(MOROCCAN_FIRST_NAMES);
    const lastName = randomFrom(MOROCCAN_LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@nexmart.test`;
    const passwordHash = await bcrypt.hash(`NexMart${i + 1}!`, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: `${firstName} ${lastName}`, password: passwordHash, role: "USER", emailVerified: true },
    });
    users.push({ id: user.id, email: user.email, name: user.name });
  }
  console.log(`✅ ${users.length} demo customers seeded`);

  for (const user of users) {
    await prisma.address.create({
      data: {
        userId: user.id,
        name: user.name,
        phone: `+2126${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
        line1: `${Math.floor(Math.random() * 200) + 1} ${randomFrom(["Rue", "Boulevard", "Avenue", "Place"])} ${randomFrom(["Moulay", "Hassan", "Fès", "Casablanca", "Rabat", "Marrakech"])} `,
        city: randomFrom(["Casablanca", "Rabat", "Marrakech", "Fès", "Tangier", "Agadir"]),
        state: randomFrom(["Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès", "Tangier-Tetouan"]),
        country: "Morocco",
        zip: `${String(Math.floor(Math.random() * 90000) + 10000)}`,
        isDefault: true,
      },
    });
  }

  for (const coupon of COUPONS) {
    await prisma.coupon.upsert({
      where: { organizationId_code: { organizationId: organization.id, code: coupon.code } },
      update: { description: coupon.description, type: coupon.type, value: coupon.value, minOrder: (coupon as any).minOrder ?? null, usageLimit: coupon.usageLimit ?? null, userLimit: coupon.userLimit ?? 1, active: true },
      create: { organizationId: organization.id, code: coupon.code, description: coupon.description, type: coupon.type, value: coupon.value, minOrder: (coupon as any).minOrder ?? null, usageLimit: coupon.usageLimit ?? null, userLimit: coupon.userLimit ?? 1, active: true },
    });
  }
  console.log(`✅ ${COUPONS.length} coupons seeded`);

  const sectionDefinitions = [
    { key: "hero", title: "Hero", subtitle: "Featured banner carousel", description: "Main hero banner with slides and CTAs", badge: "Featured" },
    { key: "categories", title: "Categories", subtitle: "Browse by category", description: "Category navigation with icons", badge: "Browse" },
    { key: "flashSale", title: "Flash Sale", subtitle: "Limited time offers", description: "Flash sale products with countdown timer", badge: "Hot" },
    { key: "trendingProducts", title: "Trending", subtitle: "What shoppers are loving now", description: "The products everyone is talking about", badge: "Trending" },
    { key: "featuredProducts", title: "Featured Products", subtitle: "Handpicked for the homepage", description: "The best mix of innovation and everyday elegance", badge: "Featured" },
    { key: "brandCarousel", title: "Partner Brands", subtitle: "Top brands", description: "Scrolling brand carousel", badge: "Brands" },
    { key: "newsletter", title: "Newsletter", subtitle: "Join our community", description: "Newsletter subscription section", badge: "Subscribe" },
  ];

  for (const [index, section] of sectionDefinitions.entries()) {
    await prisma.homePageSection.upsert({
      where: { sectionKey: section.key },
      update: { title: section.title, subtitle: section.subtitle, description: section.description, order: index, displayOrder: index, active: true, maxProducts: 8, hideIfEmpty: false },
      create: { sectionKey: section.key, title: section.title, subtitle: section.subtitle, description: section.description, viewAllButton: "Voir tout", destinationUrl: "/products", order: index, displayOrder: index, active: true, maxProducts: 8, hideIfEmpty: false },
    });
  }

  const sectionRows = await prisma.homePageSection.findMany({ select: { id: true, sectionKey: true } });
  const sectionMap = new Map(sectionRows.map((section) => [section.sectionKey, section.id]));
  for (const sectionId of Array.from(sectionMap.values())) {
    const picks = productIds.slice(0, 8).map((item) => item.id);
    for (const [orderIndex, productId] of picks.entries()) {
      await prisma.homepageSectionProduct.upsert({
        where: { sectionId_productId: { sectionId, productId } },
        update: { order: orderIndex, active: true },
        create: { sectionId, productId, order: orderIndex, active: true },
      });
    }
  }

  const reviewPool = productIds.slice(0, 120);
  for (let i = 0; i < reviewPool.length; i += 1) {
    const user = users[i % users.length];
    const product = reviewPool[i];
    const rating = 4 + (i % 3);
    const reviewTitle = randomFrom(["Excellent quality", "Exceeded expectations", "Smooth experience", "Great value", "Lovely finish"]);
    const reviewBody = `${user.name} was impressed by the build quality and fast delivery. The item feels premium and the finish is both modern and practical.`;
    await prisma.review.upsert({
      where: { productId_userId: { productId: product.id, userId: user.id } },
      update: {},
      create: { productId: product.id, userId: user.id, rating, title: reviewTitle, body: reviewBody, verifiedPurchase: true, helpfulCount: 3 + (i % 9) },
    });
  }
  console.log(`✅ ${reviewPool.length} reviews seeded`);

  const orderCount = 38;
  for (let index = 0; index < orderCount; index += 1) {
    const customer = users[index % users.length];
    const address = await prisma.address.findFirst({ where: { userId: customer.id }, select: { id: true } });
    if (!address) continue;

    const customerRecord = await prisma.customer.upsert({
      where: { organizationId_email: { organizationId: organization.id, email: customer.email } },
      update: { name: customer.name },
      create: { organizationId: organization.id, email: customer.email, name: customer.name },
    });

    const productsForOrder = productIds.slice(index % 10, (index % 10) + 2).map((item) => item.id);
    const subtotal = productsForOrder.reduce((sum, _item) => sum + 99, 0);
    const order = await prisma.order.create({
      data: {
        organizationId: organization.id,
        orderNumber: `ORD-${String(index + 1).padStart(4, "0")}-${Date.now().toString().slice(-4)}`,
        userId: customer.id,
        customerId: customerRecord.id,
        addressId: address.id,
        status: index % 3 === 0 ? "DELIVERED" : index % 3 === 1 ? "SHIPPED" : "PROCESSING",
        paymentStatus: "PAID",
        paymentMethod: index % 2 === 0 ? "STRIPE" : "CASH_ON_DELIVERY",
        subtotal,
        discount: index % 5 === 0 ? 15 : 0,
        shipping: 15,
        tax: subtotal * 0.2,
        total: subtotal + 15 + subtotal * 0.2 - (index % 5 === 0 ? 15 : 0),
        currency: "MAD",
        deliveryCity: randomFrom(["Casablanca", "Rabat", "Marrakech", "Tangier", "Fès"]),
      },
    });

    for (const [itemIndex, productId] of productsForOrder.entries()) {
      const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true, images: true, price: true } });
      if (!product) continue;
      await prisma.orderItem.create({ data: { orderId: order.id, productId, name: product.name, image: product.images[0] ?? "", price: product.price, quantity: itemIndex + 1 } });
    }
  }
  console.log(`✅ ${orderCount} orders seeded`);

  for (const user of users.slice(0, 12)) {
    const productId = productIds[Math.floor(Math.random() * productIds.length)]?.id;
    if (!productId) continue;
    await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: user.id, productId } }, update: {}, create: { userId: user.id, productId } });
  }
  console.log("✅ wishlist seeded");

  for (const user of users.slice(0, 10)) {
    const productId = productIds[Math.floor(Math.random() * productIds.length)]?.id;
    if (!productId) continue;
    await prisma.cartItem.createMany({
      data: [{ userId: user.id, productId, quantity: 1 }],
      skipDuplicates: true,
    });
  }
  console.log("✅ carts seeded");

  const analyticsProducts = productIds.slice(0, 25);
  for (let index = 0; index < analyticsProducts.length; index += 1) {
    const eventType = index % 3 === 0 ? "VIEW" : index % 3 === 1 ? "ADD_TO_CART" : "PURCHASE";
    await prisma.aiEvent.create({
      data: {
        organizationId: organization.id,
        userId: users[index % users.length]?.id ?? demoUser.id,
        productId: analyticsProducts[index].id,
        type: eventType as any,
        query: `demo event ${index + 1}`,
        score: Number((0.7 + (index % 4) * 0.07).toFixed(2)),
      },
    });
  }
  console.log("✅ analytics events seeded");

  await prisma.homeBanner.createMany({
    data: [
      { bannerType: "HERO", title: "Moroccan luxury meets everyday convenience", eyebrow: "New season", subtitle: "Discover premium essentials across fashion, tech, and home living.", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80", link: "/products", ctaText: "Shop now", gradient: "from-amber-600 via-amber-500 to-orange-500", order: 1, active: true },
      { bannerType: "HERO", title: "Fast delivery and curated collections", eyebrow: "Best sellers", subtitle: "Next-day arrival for your favorite goods in Morocco.", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400&q=80", link: "/products?sort=bestsellers", ctaText: "Explore", gradient: "from-rose-600 via-pink-500 to-fuchsia-500", order: 2, active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.heroSlide.createMany({
    data: [
      { eyebrow: "Flash Sale", title: "Premium picks", titleAccent: "at a smart price", subtitle: "Made for modern homes, polished wardrobes, and daily routines.", cta: "Browse deals", href: "/deals", badge: "Limited time", stat: "30%", statLabel: "off selected items", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80", accentColor: "#0F766E", order: 1, active: true },
      { eyebrow: "Trending", title: "The latest in", titleAccent: "tech and fashion", subtitle: "From smart devices to elevated staples, discover what is in demand.", cta: "Shop trending", href: "/products?sort=trending", badge: "Hot right now", stat: "4.8/5", statLabel: "average rating", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80", accentColor: "#7C3AED", order: 2, active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.flashDealItem.createMany({
    data: [
      { productId: productIds[0]?.id ?? null, name: "Limited time wireless audio", price: 149, originalPrice: 199, discountPercent: 25, rating: 4.8, reviewCount: 1240, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80", stock: 42, maxStock: 80, countdownEndTime: new Date(Date.now() + 1000 * 60 * 60 * 8), order: 1, active: true },
      { productId: productIds[1]?.id ?? null, name: "Smart home bundle", price: 219, originalPrice: 299, discountPercent: 27, rating: 4.7, reviewCount: 912, image: "https://images.unsplash.com/photo-1515023677547-593d7c2e6b16?w=900&q=80", stock: 28, maxStock: 60, countdownEndTime: new Date(Date.now() + 1000 * 60 * 60 * 12), order: 2, active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.sponsoredProduct.createMany({
    data: [
      { productId: productIds[2]?.id ?? null, name: "Signature weekend edit", price: 179, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80", badgeText: "Sponsored", order: 1, active: true },
      { productId: productIds[3]?.id ?? null, name: "Premium comfort essentials", price: 119, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80", badgeText: "Featured", order: 2, active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.bestsellerConfig.createMany({
    data: [
      { productId: productIds[4]?.id ?? null, rank: 1, name: "Top rated everyday pick", price: 159, rating: 4.8, reviewCount: 2840, image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80", active: true },
      { productId: productIds[5]?.id ?? null, rank: 2, name: "Boulevard favorite", price: 87, rating: 4.7, reviewCount: 1940, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80", active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.newArrivalConfig.createMany({
    data: [
      { productId: productIds[6]?.id ?? null, name: "Fresh arrival: modern daily utility", price: 109, badgeText: "New", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&q=80", order: 1, active: true },
      { productId: productIds[7]?.id ?? null, name: "Fresh arrival: premium comfort", price: 144, badgeText: "New", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80", order: 2, active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.brandPartner.createMany({
    data: [
      { name: "Luma", logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80", link: "/products", order: 1, active: true },
      { name: "Aro", logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&q=80", link: "/products", order: 2, active: true },
      { name: "Vanta", logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&q=80", link: "/products", order: 3, active: true },
    ],
    skipDuplicates: true,
  });

  await prisma.homeFeature.createMany({
    data: [
      { title: "Fast delivery", subtitle: "Dispatch within 24 hours", iconName: "Truck", colorClass: "from-amber-500 to-orange-500", order: 1, active: true },
      { title: "Secure checkout", subtitle: "Protected payments and instant confirmation", iconName: "ShieldCheck", colorClass: "from-emerald-500 to-green-500", order: 2, active: true },
      { title: "Trusted reviews", subtitle: "Real customer feedback from Morocco", iconName: "Star", colorClass: "from-sky-500 to-cyan-500", order: 3, active: true },
    ],
    skipDuplicates: true,
  });

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("📧 Admin login: admin@nexmart.com / Admin@123456");
  console.log("📧 User login:  user@nexmart.com  / User@123456");
  console.log("🛍️  Products generated:", productSeeds.length);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });