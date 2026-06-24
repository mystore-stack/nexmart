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

console.log("DATABASE_URL (seed) =", DATABASE_URL);
console.log("DATABASE_URL_UNPOOLED (seed) =", DATABASE_URL_UNPOOLED);
console.log("process.env.DATABASE_URL =", process.env.DATABASE_URL);
console.log("process.env.DATABASE_URL_UNPOOLED =", process.env.DATABASE_URL_UNPOOLED);
console.log("seedDatabaseUrl (final) =", seedDatabaseUrl);
console.log("process.env.SSLMODE =", process.env.SSLMODE);

const prisma = new PrismaClient({
  datasources: {
    db: { url: seedDatabaseUrl },
  },
});

if (!seedDatabaseUrl) {
  throw new Error("Missing DATABASE_URL. Check .env.local/.env.");
}

const CATEGORIES = [

  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80" },
  { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80" },
  { name: "Home & Living", slug: "home-living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80" },
  { name: "Sports & Outdoors", slug: "sports", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80" },
  { name: "Beauty & Health", slug: "beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80" },
  { name: "Books & Media", slug: "books", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&q=80" },
  { name: "Toys & Games", slug: "toys", image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&q=80" },
  { name: "Automotive", slug: "automotive", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80" },
];

const PRODUCTS = [
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise canceling with two processors and 8 microphones. Up to 30 hours battery life. Exceptional call quality with beamforming microphone array.",
    price: 279.99,
    comparePrice: 399.99,
    sku: "SONY-WH1000XM5-BLK",
    stock: 145,
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
    ],
    tags: ["headphones", "sony", "wireless", "noise-canceling"],
    featured: true,
    published: true,
    rating: 4.8,
    reviewCount: 2847,
    soldCount: 5201,
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    slug: "apple-airpods-pro-2",
    description: "Active Noise Cancellation reduces unwanted background noise. Adaptive Audio seamlessly blends Active Noise Cancellation and Transparency. Personalized Spatial Audio with dynamic head tracking.",
    price: 189.00,
    comparePrice: 249.00,
    sku: "APPLE-APP2-WHT",
    stock: 89,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80"],
    tags: ["airpods", "apple", "wireless", "earbuds"],
    featured: true,
    published: true,
    rating: 4.9,
    reviewCount: 5432,
    soldCount: 12300,
  },
  {
    name: "Nike Air Max 270",
    slug: "nike-air-max-270",
    description: "The Nike Air Max 270 delivers visible cushioning under every step. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh colorways.",
    price: 119.99,
    comparePrice: 150.00,
    sku: "NIKE-AM270-BLK-10",
    stock: 312,
    category: "fashion",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    ],
    tags: ["nike", "shoes", "running", "sneakers"],
    featured: true,
    published: true,
    rating: 4.6,
    reviewCount: 1923,
    soldCount: 8910,
  },
  {
    name: "Dyson V15 Detect Absolute",
    slug: "dyson-v15-detect",
    description: "Laser Detect technology reveals invisible dust. Dynamically adapts suction power to floor type. 60 minutes of powerful fade-free suction. HEPA filtration captures 99.97% of particles.",
    price: 649.99,
    comparePrice: 799.99,
    sku: "DYSON-V15-DET",
    stock: 34,
    lowStockAt: 10,
    category: "home-living",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
    tags: ["dyson", "vacuum", "cordless", "home"],
    featured: false,
    published: true,
    rating: 4.7,
    reviewCount: 892,
    soldCount: 2100,
  },
  {
    name: "Samsung 65\" QLED 4K Smart TV",
    slug: "samsung-65-qled-4k",
    description: "Quantum Dot technology delivers a billion shades of color. Neo Quantum Processor 4K uses AI to optimize all your content to 4K. Object Tracking Sound+ fills the room with 3D audio.",
    price: 1299.99,
    comparePrice: 1799.99,
    sku: "SAMSUNG-65Q80C",
    stock: 18,
    lowStockAt: 5,
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80"],
    tags: ["samsung", "tv", "4k", "qled", "smart-tv"],
    featured: true,
    published: true,
    rating: 4.5,
    reviewCount: 654,
    soldCount: 1834,
  },
  {
    name: "Levi's 501 Original Jeans",
    slug: "levis-501-original",
    description: "The original jean since 1873. Straight fit with button fly. 100% cotton denim that gets better with every wear. The Levi's 501 is a timeless wardrobe staple.",
    price: 59.99,
    comparePrice: 79.99,
    sku: "LEVIS-501-32-32",
    stock: 523,
    category: "fashion",
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80"],
    tags: ["levis", "jeans", "denim", "fashion"],
    featured: false,
    published: true,
    rating: 4.4,
    reviewCount: 3211,
    soldCount: 15600,
  },
  {
    name: "Instant Pot Duo 7-in-1",
    slug: "instant-pot-duo-7-in-1",
    description: "7-in-1 multi-use: pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer. 14 one-touch programs. Safe, convenient, and dependable.",
    price: 79.99,
    comparePrice: 99.99,
    sku: "IPOT-DUO-7IN1-6QT",
    stock: 201,
    category: "home-living",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80"],
    tags: ["instant-pot", "cooking", "kitchen", "pressure-cooker"],
    featured: false,
    published: true,
    rating: 4.7,
    reviewCount: 8903,
    soldCount: 22400,
  },
  {
    name: "Patagonia Down Sweater Jacket",
    slug: "patagonia-down-sweater",
    description: "Our most popular insulated jacket, made with 800-fill-power, Responsible Down Standard-certified goose down. Slim fit for layering. Stuffs into its own chest pocket.",
    price: 229.00,
    sku: "PATA-DOWN-SW-M",
    stock: 78,
    category: "sports",
    images: ["https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&q=80"],
    tags: ["patagonia", "jacket", "outdoor", "down"],
    featured: true,
    published: true,
    rating: 4.8,
    reviewCount: 1456,
    soldCount: 4320,
  },
  {
    name: "Kindle Paperwhite (11th Gen)",
    slug: "kindle-paperwhite-11",
    description: "6.8\" display and adjustable warm light. Waterproof (IPX8 rated). 3-month Kindle Unlimited free trial. 10 weeks battery life. 8GB, holds thousands of books.",
    price: 119.99,
    comparePrice: 139.99,
    sku: "KINDLE-PW11-8GB",
    stock: 156,
    category: "books",
    images: ["https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&q=80"],
    tags: ["kindle", "amazon", "ebook", "reading"],
    featured: false,
    published: true,
    rating: 4.6,
    reviewCount: 7823,
    soldCount: 18900,
  },
  {
    name: "Vitamix A3500 Ascent Blender",
    slug: "vitamix-a3500",
    description: "Five program settings for Smoothies, Hot Soups, Dips & Spreads, Frozen Desserts, and Self-Cleaning. Variable speed control. Built-in wireless connectivity. 10-year warranty.",
    price: 549.95,
    comparePrice: 649.95,
    sku: "VITA-A3500-SLV",
    stock: 45,
    category: "home-living",
    images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80"],
    tags: ["vitamix", "blender", "kitchen", "health"],
    featured: false,
    published: true,
    rating: 4.9,
    reviewCount: 2134,
    soldCount: 5670,
  },
  {
    name: "Adidas Ultraboost 22 Running Shoes",
    slug: "adidas-ultraboost-22",
    description: "BOOST midsole delivers incredible energy return. Primeknit+ upper adapts to your foot during the run. Continental™ rubber outsole for extraordinary grip. Perfect for long-distance running.",
    price: 139.99,
    comparePrice: 180.00,
    sku: "ADIDAS-UB22-BLK-10",
    stock: 267,
    category: "sports",
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80"],
    tags: ["adidas", "running", "shoes", "ultraboost"],
    featured: true,
    published: true,
    rating: 4.5,
    reviewCount: 2901,
    soldCount: 9800,
  },
  {
    name: "Oura Ring Gen 3",
    slug: "oura-ring-gen3",
    description: "Advanced health tracking in a sleek ring. Monitors sleep, activity, heart rate, SpO2, body temperature, and more. 7-day battery life. Available in multiple metals.",
    price: 299.00,
    sku: "OURA-RING-G3-BLK",
    stock: 62,
    category: "beauty",
    images: ["https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=600&q=80"],
    tags: ["oura", "health", "fitness", "wearable", "ring"],
    featured: false,
    published: true,
    rating: 4.3,
    reviewCount: 1234,
    soldCount: 3400,
  },
];

const COUPONS = [
  { code: "WELCOME10", type: "PERCENTAGE", value: 10, description: "10% off your first order", usageLimit: 1000, userLimit: 1 },
  { code: "NEXMART10", type: "PERCENTAGE", value: 10, description: "10% off sitewide", usageLimit: 500, userLimit: 3 },
  { code: "SAVE20", type: "FIXED", value: 20, description: "$20 off orders over $100", minOrder: 100 },
  { code: "FREESHIP", type: "FIXED", value: 9.99, description: "Free shipping on any order" },
];

async function main() {
  console.log("🌱 Seeding database...");
  console.log("DATABASE_URL (seed) =", seedDatabaseUrl);

  // Admin user
  const adminPw = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexmart.com" },
    update: {},
    create: {
      email: "admin@nexmart.com",
      name: "Admin User",
      password: adminPw,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Demo user
  const userPw = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@nexmart.com" },
    update: {},
    create: {
      email: "user@nexmart.com",
      name: "Demo User",
      password: userPw,
      role: "USER",
      emailVerified: true,
    },
  });
  console.log("✅ Demo user:", demoUser.email);

  const organization = await prisma.organization.upsert({
    where: { slug: "nexmart" },
    update: {},
    create: {
      name: "NexMart",
      slug: "nexmart",
      ownerId: admin.id,
    },
  });

  await prisma.$executeRaw`
    INSERT INTO "Membership" ("id", "userId", "organizationId", "role", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      ${admin.id}::uuid,
      ${organization.id}::uuid,
      CAST(${"OWNER"} AS "OrgRole"),
      now(),
      now()
    )
    ON CONFLICT ("userId", "organizationId")
    DO UPDATE SET
      "role" = EXCLUDED."role",
      "updatedAt" = EXCLUDED."updatedAt";
  `;

  await prisma.$executeRaw`
    INSERT INTO "Membership" ("id", "userId", "organizationId", "role", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      ${demoUser.id}::uuid,
      ${organization.id}::uuid,
      CAST(${"MEMBER"} AS "OrgRole"),
      now(),
      now()
    )
    ON CONFLICT ("userId", "organizationId")
    DO UPDATE SET
      "role" = EXCLUDED."role",
      "updatedAt" = EXCLUDED."updatedAt";
  `;

  console.log("Organization:", organization.slug);

  // Categories (raw SQL to avoid Prisma UUID/cuid mismatch)
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    await prisma.$executeRaw`
      INSERT INTO "Category" ("id", "organizationId", "name", "slug", "image", "createdAt")
      VALUES (gen_random_uuid(), ${organization.id}::uuid, ${cat.name}, ${cat.slug}, ${cat.image}, now())
      ON CONFLICT ("organizationId", "slug") DO NOTHING;
    `;

    const row = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Category"
      WHERE "organizationId" = ${organization.id}::uuid AND "slug" = ${cat.slug}
      LIMIT 1;
    `;
    categoryMap[cat.slug] = row?.[0]?.id ?? "";
  }
  console.log(`✅ ${CATEGORIES.length} categories seeded`);

  // Products
  for (const p of PRODUCTS) {
    const { category: catSlug, ...productData } = p;
    const categoryId = categoryMap[catSlug];
    if (!categoryId) continue;

    await prisma.$executeRaw`
      INSERT INTO "Product" (
        "id", "organizationId", "name", "slug", "description", "price",
        "comparePrice", "cost", "categoryId", "images", "tags", "sku",
        "stock", "lowStockAt", "weight", "published", "featured",
        "rating", "reviewCount", "soldCount", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${productData.name}, ${productData.slug},
        ${productData.description}, ${productData.price}, ${productData.comparePrice ?? null},
        ${(productData as any).cost ?? null}, ${categoryId}::uuid, ${productData.images}::text[],
        ${productData.tags}::text[], ${productData.sku}, ${productData.stock},
        ${(productData as any).lowStockAt ?? 5}, null, ${productData.published},
        ${productData.featured}, ${productData.rating}, ${productData.reviewCount},
        ${productData.soldCount}, now(), now()
      )
      ON CONFLICT ("organizationId", "slug") DO NOTHING;
    `;
  }
  console.log(`✅ ${PRODUCTS.length} products seeded`);

  // Coupons
  for (const coupon of COUPONS) {
    await prisma.$executeRaw`
      INSERT INTO "Coupon" (
        "id", "organizationId", "code", "description", "type", "value",
        "minOrder", "maxDiscount", "usageLimit", "userLimit", "active", "createdAt"
      )
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${coupon.code}, ${coupon.description},
        ${coupon.type}, ${coupon.value}, ${(coupon as any).minOrder ?? null}, null,
        ${coupon.usageLimit ?? null}, ${coupon.userLimit ?? 1}, true, now()
      )
      ON CONFLICT ("organizationId", "code") DO NOTHING;
    `;
  }
  console.log(`✅ ${COUPONS.length} coupons seeded`);

  // ─── CMS: Site Settings + Navigation + Footer defaults ─────────────
  await prisma.siteSettings.upsert({
    where: { organizationId: organization.id },
    create: {
      organizationId: organization.id,
      storeName: "NexMart",
      storeTagline: "Maroc · Premium",
      email: "contact@nexmart.ma",
      phone: "+212 5XX-XXXXXX",
      address: "Casablanca, Maroc",
      supportEmail: "support@nexmart.ma",
      seoTitle: "NexMart Maroc — Marketplace Premium",
      seoDescription: "La marketplace premium du Maroc — shopping intelligent, artisanat authentique.",
      seoKeywords: ["marketplace maroc", "ecommerce maroc", "nexmart"],
      siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma",
      twitterHandle: "@nexmart_ma",
      freeShippingThreshold: 500,
      freeShippingMessage: "Livraison gratuite au Maroc dès 500 MAD",
      searchPlaceholder: "Rechercher un produit...",
      primaryColor: "#0F766E",
      secondaryColor: "#D4AF37",
    },
    update: {},
  });
  console.log("✅ Site settings seeded");

  const existingNav = await prisma.navigationMenu.findFirst({
    where: { organizationId: organization.id, location: "HEADER" },
  });
  if (!existingNav) {
    await prisma.navigationMenu.create({
      data: {
        organizationId: organization.id,
        name: "Main Navigation",
        location: "HEADER",
        items: {
          create: [
            { label: "Boutique", url: "/products", displayOrder: 0 },
            { label: "Promotions", url: "/deals", displayOrder: 1 },
            { label: "Marques", url: "/brands", displayOrder: 2 },
            { label: "Catégories", url: "/categories", displayOrder: 3 },
          ],
        },
      },
    });
    console.log("✅ Navigation menu seeded");
  }

  await prisma.footerConfig.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      organizationId: organization.id,
      description: "La marketplace premium du Maroc.",
      contactInfo: { email: "contact@nexmart.ma", phone: "+212 5XX-XXXXXX", address: "Casablanca, Maroc" },
      quickLinks: [
        { title: "Produits", url: "/products" },
        { title: "Catégories", url: "/categories" },
      ],
      legalLinks: [
        { title: "Confidentialité", url: "/privacy" },
        { title: "Conditions", url: "/terms" },
      ],
      socialLinks: [],
      columns: [],
      isActive: true,
    },
    update: {},
  }).catch(async () => {
    const existing = await prisma.footerConfig.findFirst({ where: { organizationId: organization.id } });
    if (!existing) {
      await prisma.footerConfig.create({
        data: {
          organizationId: organization.id,
          description: "La marketplace premium du Maroc.",
          contactInfo: { email: "contact@nexmart.ma", phone: "+212 5XX-XXXXXX", address: "Casablanca, Maroc" },
          quickLinks: [{ title: "Produits", url: "/products" }],
          legalLinks: [{ title: "Confidentialité", url: "/privacy" }],
          socialLinks: [],
          columns: [],
          isActive: true,
        },
      });
    }
  });
  console.log("✅ Footer config seeded");

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("📧 Admin login: admin@nexmart.com / Admin@123456");
  console.log("📧 User login:  user@nexmart.com  / User@123456");
  console.log("🎟️  Coupons:", COUPONS.map((c) => c.code).join(", "));
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
