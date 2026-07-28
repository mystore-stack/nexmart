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
  { name: "Gaming", slug: "gaming", image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=200&q=80" },
  { name: "Food", slug: "food", image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&q=80" },
  { name: "Moroccan Products", slug: "moroccan-products", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=200&q=80" },
  { name: "Luxury Collection", slug: "luxury-collection", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&q=80" },
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
    description: "7-in-1 multi-use: pressure cooker, slow cooker, rice cooker, steamer, sautÃ©, yogurt maker, warmer. 14 one-touch programs. Safe, convenient, and dependable.",
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
    description: "BOOST midsole delivers incredible energy return. Primeknit+ upper adapts to your foot during the run. Continentalâ„¢ rubber outsole for extraordinary grip. Perfect for long-distance running.",
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
  { code: "NEXSTORE10", type: "PERCENTAGE", value: 10, description: "10% off sitewide", usageLimit: 500, userLimit: 3 },
  { code: "SAVE20", type: "FIXED", value: 20, description: "$20 off orders over $100", minOrder: 100 },
  { code: "FREESHIP", type: "FIXED", value: 9.99, description: "Free shipping on any order" },
];

const MARKETPLACE_BLUEPRINTS = [
  ["Atlas Pro ANC Headphones", "electronics", "Atlas Audio", "Casablanca Tech Hub", 1599, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"],
  ["Marrakech Leather Weekend Bag", "fashion", "Dar El Cuir", "Medina Atelier", 1890, "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&q=80"],
  ["Argan Glow Ritual Set", "beauty", "Tafraout Botanics", "Essaouira Beauty Co", 420, "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"],
  ["Zellige Table Lamp", "home-living", "Riad Studio", "Fes Home Market", 760, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"],
  ["Carbon RGB Gaming Bundle", "gaming", "NexPlay", "Rabat Gaming Supply", 2490, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80"],
  ["Safi Ceramic Dinner Set", "moroccan-products", "Safi Maison", "Cooperative Safi", 640, "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80"],
  ["Casablanca Linen Overshirt", "fashion", "Casa Cotton", "NexStore Fashion", 520, "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80"],
  ["Smart Fitness Watch S9", "electronics", "NovaWear", "Tangier Digital", 1190, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
  ["Royal Oud Eau de Parfum", "luxury-collection", "Maison Oud", "Marrakech Fragrance", 980, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80"],
  ["Organic Amlou Pantry Box", "food", "Sous Pantry", "Agadir Gourmet", 310, "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80"],
  ["Performance Training Kit", "sports", "AtlasFit", "NexStore Sports", 690, "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=600&q=80"],
  ["Minimal Brass Wall Mirror", "home-living", "Riad Studio", "Marrakech Decor", 880, "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80"],
] as const;

const GENERATED_PRODUCTS = Array.from({ length: 10080 }, (_, index) => {
  const [name, category, brand, seller, basePrice, image] = MARKETPLACE_BLUEPRINTS[index % MARKETPLACE_BLUEPRINTS.length];
  const variant = Math.floor(index / MARKETPLACE_BLUEPRINTS.length) + 1;
  const discount = [12, 18, 22, 28, 34, 40][index % 6];
  const price = basePrice + variant * 11 + (index % 7) * 19;
  return {
    name: variant === 1 ? name : `${name} ${variant}`,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${variant}`,
    description: `${name} curated for NexStore Maroc with premium marketplace photography, MAD pricing, reliable stock, variants, reviews, and seller-ready merchandising.`,
    price,
    comparePrice: Math.round(price / (1 - discount / 100)),
    sku: `NX-${String(index + 1).padStart(5, "0")}`,
    stock: 18 + ((index * 17) % 240),
    lowStockAt: 8,
    category,
    brand,
    seller,
    images: [image, image.replace("w=600", "w=900")],
    tags: [category, brand.toLowerCase(), seller.toLowerCase(), "mad", "marketplace"],
    featured: index % 7 === 0,
    published: true,
    rating: Number((4.35 + (index % 55) / 100).toFixed(1)),
    reviewCount: 120 + index * 9,
    soldCount: 260 + index * 23,
  };
});

async function main() {
  console.log("ðŸŒ± Seeding database...");
  console.log("DATABASE_URL (seed) =", seedDatabaseUrl);

  // Admin user
  const adminPw = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexstore.com" },
    update: {},
    create: {
      email: "admin@nexstore.com",
      name: "Admin User",
      password: adminPw,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("âœ… Admin user:", admin.email);

  // Demo user
  const userPw = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@nexstore.com" },
    update: {},
    create: {
      email: "user@nexstore.com",
      name: "Demo User",
      password: userPw,
      role: "USER",
      emailVerified: true,
    },
  });
  console.log("âœ… Demo user:", demoUser.email);

  const organization = await prisma.organization.upsert({
    where: { slug: "nexmart" },
    update: {},
    create: {
      name: "NexStore",
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
  console.log(`âœ… ${CATEGORIES.length} categories seeded`);

  const brandMap: Record<string, string> = {};
  const sellerMap: Record<string, string> = {};
  const generatedBrands = Array.from(new Set(GENERATED_PRODUCTS.map((p) => p.brand)));
  const generatedSellers = Array.from(new Set(GENERATED_PRODUCTS.map((p) => p.seller)));

  for (const brand of generatedBrands) {
    const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await prisma.$executeRaw`
      INSERT INTO "Brand" ("id", "organizationId", "name", "slug", "country", "verified", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${organization.id}::uuid, ${brand}, ${slug}, ${"Morocco"}, true, now(), now())
      ON CONFLICT ("organizationId", "slug") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = now();
    `;
    const row = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Brand" WHERE "organizationId" = ${organization.id}::uuid AND "slug" = ${slug} LIMIT 1;
    `;
    brandMap[brand] = row?.[0]?.id ?? "";
  }
  console.log(`Seeded ${generatedBrands.length} brands`);

  for (const seller of generatedSellers) {
    const slug = seller.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await prisma.$executeRaw`
      INSERT INTO "Seller" ("id", "organizationId", "name", "slug", "city", "country", "commissionRate", "rating", "reviewCount", "verified", "active", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${organization.id}::uuid, ${seller}, ${slug}, ${"Casablanca"}, ${"Morocco"}, 0.12, 4.7, 320, true, true, now(), now())
      ON CONFLICT ("organizationId", "slug") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = now();
    `;
    const row = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Seller" WHERE "organizationId" = ${organization.id}::uuid AND "slug" = ${slug} LIMIT 1;
    `;
    sellerMap[seller] = row?.[0]?.id ?? "";
  }
  console.log(`Seeded ${generatedSellers.length} sellers`);

  // Products
  const productsToSeed = [...PRODUCTS, ...GENERATED_PRODUCTS];
  const seededProductIds: string[] = [];
  for (const p of productsToSeed) {
    const { category: catSlug, ...productData } = p;
    const categoryId = categoryMap[catSlug];
    if (!categoryId) continue;
    const brandId = brandMap[(productData as any).brand] || null;
    const sellerId = sellerMap[(productData as any).seller] || null;

    await prisma.$executeRaw`
      INSERT INTO "Product" (
        "id", "organizationId", "brandId", "sellerId", "name", "slug", "description", "price",
        "comparePrice", "cost", "categoryId", "images", "tags", "sku",
        "stock", "lowStockAt", "weight", "published", "featured",
        "rating", "reviewCount", "soldCount", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${brandId}::uuid, ${sellerId}::uuid, ${productData.name}, ${productData.slug},
        ${productData.description}, ${productData.price}, ${productData.comparePrice ?? null},
        ${(productData as any).cost ?? null}, ${categoryId}::uuid, ${productData.images}::text[],
        ${productData.tags}::text[], ${productData.sku}, ${productData.stock},
        ${(productData as any).lowStockAt ?? 5}, null, ${productData.published},
        ${productData.featured}, ${productData.rating}, ${productData.reviewCount},
        ${productData.soldCount}, now(), now()
      )
      ON CONFLICT ("organizationId", "slug") DO UPDATE SET
        "brandId" = EXCLUDED."brandId",
        "sellerId" = EXCLUDED."sellerId",
        "price" = EXCLUDED."price",
        "comparePrice" = EXCLUDED."comparePrice",
        "stock" = EXCLUDED."stock",
        "updatedAt" = now();
    `;

    const row = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Product" WHERE "organizationId" = ${organization.id}::uuid AND "slug" = ${productData.slug} LIMIT 1;
    `;
    if (row?.[0]?.id) {
      seededProductIds.push(row[0].id);
      await prisma.$executeRaw`
        INSERT INTO "Inventory" ("id", "productId", "warehouseCode", "quantity", "reserved", "safetyStock", "updatedAt")
        VALUES (gen_random_uuid(), ${row[0].id}::uuid, ${"CASA-01"}, ${productData.stock}, 0, ${(productData as any).lowStockAt ?? 5}, now())
        ON CONFLICT ("productId") DO UPDATE SET "quantity" = EXCLUDED."quantity", "updatedAt" = now();
      `;
    }
  }
  console.log(`Seeded ${productsToSeed.length} products`);

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
  console.log(`âœ… ${COUPONS.length} coupons seeded`);

  await prisma.$executeRaw`
    INSERT INTO "Campaign" (
      "id", "organizationId", "name", "slug", "description", "type", "startsAt", "endsAt",
      "active", "heroTitle", "heroSubtitle", "heroImage", "ctaLabel", "ctaHref", "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid(), ${organization.id}::uuid, ${"Ramadan Sale"}, ${"ramadan-sale"},
      ${"Premium Moroccan campaign with scheduled hero content and curated super deals."},
      CAST(${"RAMADAN"} AS "CampaignType"), now(), now() + interval '45 days',
      true, ${"Ramadan luxury deals"}, ${"Up to 40% off curated Moroccan edits"},
      ${"https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1400&q=85"}, ${"Shop Ramadan Sale"}, ${"/deals"}, now(), now()
    )
    ON CONFLICT ("organizationId", "slug") DO UPDATE SET "active" = true, "updatedAt" = now();
  `;

  const campaign = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Campaign" WHERE "organizationId" = ${organization.id}::uuid AND "slug" = ${"ramadan-sale"} LIMIT 1;
  `;
  const campaignId = campaign?.[0]?.id;

  if (campaignId) {
    await prisma.$executeRaw`
      INSERT INTO "Deal" (
        "id", "organizationId", "campaignId", "name", "slug", "type", "discountType", "discountValue",
        "startsAt", "endsAt", "stockLimit", "soldCount", "active", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${campaignId}::uuid, ${"NexStore Flash Deals"}, ${"nexstore-flash-deals"},
        CAST(${"FLASH"} AS "DealType"), CAST(${"PERCENTAGE"} AS "DiscountType"), 35,
        now(), now() + interval '3 days', 1200, 380, true, now(), now()
      )
      ON CONFLICT ("organizationId", "slug") DO UPDATE SET "active" = true, "updatedAt" = now();
    `;
  }

  const deal = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Deal" WHERE "organizationId" = ${organization.id}::uuid AND "slug" = ${"nexstore-flash-deals"} LIMIT 1;
  `;
  const dealId = deal?.[0]?.id;
  if (dealId) {
    for (const [position, productId] of seededProductIds.slice(0, 16).entries()) {
      await prisma.$executeRaw`
        INSERT INTO "DealProduct" ("id", "dealId", "productId", "position")
        VALUES (gen_random_uuid(), ${dealId}::uuid, ${productId}::uuid, ${position})
        ON CONFLICT ("dealId", "productId") DO UPDATE SET "position" = EXCLUDED."position";
      `;
    }
  }

  const boxSeeds = [
    { name: "Moroccan Beauty Box", slug: "moroccan-beauty-box", cadence: "MONTHLY", price: 299, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=85" },
    { name: "Riad Home Box", slug: "riad-home-box", cadence: "QUARTERLY", price: 549, image: "https://images.unsplash.com/photo-1615874694520-474822394e73?w=900&q=85" },
  ];
  for (const box of boxSeeds) {
    await prisma.$executeRaw`
      INSERT INTO "StoreBox" ("id", "organizationId", "name", "slug", "description", "image", "cadence", "price", "comparePrice", "active", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${box.name}, ${box.slug}, ${"Subscription box curated by NexStore."},
        ${box.image}, CAST(${box.cadence} AS "BoxCadence"), ${box.price}, ${Math.round(box.price * 1.35)}, true, now(), now()
      )
      ON CONFLICT ("organizationId", "slug") DO UPDATE SET "price" = EXCLUDED."price", "updatedAt" = now();
    `;
  }

  const sectionSeeds = [
    ["announcement", "Announcement Bar", "ANNOUNCEMENT", 1],
    ["hero", "Premium Hero", "HERO", 2],
    ["categories", "Marketplace Categories", "CATEGORIES", 3],
    ["flash-deals", "Flash Deals", "FLASH_DEALS", 4],
    ["bundles", "Bundle Deals", "BUNDLES", 5],
    ["store-box", "MyStoreBox", "STORE_BOX", 6],
    ["featured-products", "Featured Products", "PRODUCT_RAIL", 7],
  ] as const;
  for (const [key, title, type, position] of sectionSeeds) {
    await prisma.$executeRaw`
      INSERT INTO "HomepageSection" ("id", "organizationId", "key", "title", "type", "enabled", "position", "settings", "responsive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${key}, ${title}, CAST(${type} AS "SectionType"), true, ${position},
        ${JSON.stringify({ adminEditable: true, animation: "subtle", uploadImages: true })}::jsonb,
        ${JSON.stringify({ mobile: true, desktop: true })}::jsonb, now(), now()
      )
      ON CONFLICT ("organizationId", "key") DO UPDATE SET "enabled" = true, "position" = EXCLUDED."position", "updatedAt" = now();
    `;
  }

  for (const [index, productId] of seededProductIds.slice(0, 6).entries()) {
    await prisma.$executeRaw`
      INSERT INTO "Advertisement" ("id", "organizationId", "productId", "name", "budget", "spend", "bidAmount", "impressions", "clicks", "startsAt", "endsAt", "status", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(), ${organization.id}::uuid, ${productId}::uuid, ${`Sponsored product ${index + 1}`},
        2500, 0, 4.5, 0, 0, now(), now() + interval '30 days', CAST(${"ACTIVE"} AS "AdStatus"), now(), now()
      );
    `;
  }
  console.log("Seeded campaigns, deals, boxes, ads, homepage sections, and inventory");

  console.log("\nðŸŽ‰ Database seeded successfully!\n");
  console.log("ðŸ“§ Admin login: admin@nexstore.com / Admin@123456");
  console.log("ðŸ“§ User login:  user@nexstore.com  / User@123456");
  console.log("ðŸŽŸï¸  Coupons:", COUPONS.map((c) => c.code).join(", "));
}

main()
  .catch((e) => { console.error("âŒ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

