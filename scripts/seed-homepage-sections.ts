import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

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

// All homepage sections that should be visible
const HOMEPAGE_SECTIONS = [
  { key: "HERO", displayOrder: 0 },
  { key: "CATEGORIES", displayOrder: 1 },
  { key: "FLASH_DEALS", displayOrder: 2 },
  { key: "BUNDLE_DEALS", displayOrder: 3 },
  { key: "SUPER_DEALS", displayOrder: 4 },
  { key: "MYSTERY_BOXES", displayOrder: 5 },
  { key: "FEATURED_PRODUCTS", displayOrder: 6 },
  { key: "AI_RECOMMENDATIONS", displayOrder: 7 },
  { key: "BEST_SELLERS", displayOrder: 8 },
  { key: "BRANDS", displayOrder: 9 },
  { key: "WHY_NEXMART", displayOrder: 10 },
  { key: "TESTIMONIALS", displayOrder: 11 },
  { key: "MOBILE_APP", displayOrder: 12 },
  { key: "NEWSLETTER", displayOrder: 13 },
  { key: "FOOTER", displayOrder: 14 },
];

async function main() {
  console.log("🌱 Seeding homepage section visibility...");

  for (const section of HOMEPAGE_SECTIONS) {
    await prisma.homepageSectionVisibility.upsert({
      where: { sectionKey: section.key },
      update: { displayOrder: section.displayOrder },
      create: {
        sectionKey: section.key,
        visible: true,
        displayOrder: section.displayOrder,
      },
    });
    console.log(`✅ Section ${section.key} seeded`);
  }

  console.log("\n🎉 Homepage sections visibility seeded successfully!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
