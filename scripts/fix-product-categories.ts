import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productCategoryMap: Record<string, string> = {
  "iphone-15-pro-max-256gb": "smartphones",
  "samsung-galaxy-s24-ultra-512gb": "smartphones",
  "google-pixel-8-pro-256gb": "smartphones",
  "xiaomi-14-ultra-512gb": "smartphones",
  "macbook-pro-16-m3-max-36gb-1tb": "laptops",
  "dell-xps-15-9530-i9-32gb-1tb": "laptops",
  "lenovo-thinkpad-x1-carbon-gen-12-i7-32gb-512gb": "laptops",
  "asus-rog-zephyrus-g16-ryzen-9-32gb-1tb-rtx-4080": "laptops",
  "ipad-pro-12-9-m4-256gb-wifi": "tablets",
  "samsung-galaxy-tab-s9-ultra-256gb": "tablets",
  "microsoft-surface-pro-11-snapdragon-x-elite-16gb-512gb": "tablets",
  "apple-watch-ultra-2-49mm-gps-cellular": "smart-watches",
  "samsung-galaxy-watch-6-classic-47mm-lte": "smart-watches",
  "garmin-fenix-7-pro-solar-47mm": "smart-watches",
  "sony-wh-1000xm5-wireless-noise-cancelling": "headphones",
  "bose-quietcomfort-ultra-noise-cancelling": "headphones",
  "apple-airpods-max-wireless-over-ear": "headphones",
  "playstation-5-slim-1tb-digital-edition": "gaming",
  "xbox-series-x-1tb": "gaming",
  "nintendo-switch-oled-model-64gb": "gaming",
  "keychron-q1-pro-qmk-via-wireless-custom-keyboard": "keyboards",
  "logitech-mx-mechanical-wireless-keyboard": "keyboards",
  "razer-blackwidow-v4-pro-mechanical-keyboard": "keyboards",
  "logitech-mx-master-3s-wireless-mouse": "mice",
  "razer-deathadder-v3-pro-wireless-gaming-mouse": "mice",
  "apple-magic-mouse-2-wireless": "mice",
  "lg-ultragear-27gp850-27-165hz-ips-gaming-monitor": "monitors",
  "dell-ultrasharp-u2723qe-27-4k-usb-c-hub-monitor": "monitors",
  "samsung-odyssey-oled-g9-49-240hz-curved-gaming-monitor": "monitors",
  "sony-alpha-7-iv-mirrorless-camera-body": "cameras",
  "canon-eos-r6-mark-ii-mirrorless-camera-body": "cameras",
  "fujifilm-x-t5-mirrorless-camera-body": "cameras",
  "dyson-v15-detect-absolute-cordless-vacuum": "home-appliances",
  "philips-airfryer-xxl-premium-digital": "kitchen",
  "roborock-s8-pro-ultra-robot-vacuum-mop": "home-appliances",
  "nespresso-vertuo-next-coffee-machine": "kitchen",
  "kitchenaid-stand-mixer-4-7l-artisan": "kitchen",
  "bosch-serie-8-dishwasher-60cm": "kitchen",
  "herman-miller-aeron-ergonomic-chair": "office",
  "ikea-bekant-standing-desk-160x80cm": "office",
  "philips-hue-white-color-ambiance-starter-kit": "lighting",
  "levis-501-original-fit-jeans": "fashion",
  "nike-air-max-270-react": "shoes",
  "ralph-lauren-polo-classic-fit-cotton-t-shirt": "fashion",
  "samsonite-xenon-3-0-spinner-55cm-carry-on": "bags",
  "herschel-heritage-backpack-25l": "bags",
  "dyson-airwrap-complete-long-hair-styler": "beauty",
  "foreo-luna-3-facial-cleansing-brush": "beauty",
  "withings-body-cardio-smart-scale": "health",
  "omron-m7-intelli-it-blood-pressure-monitor": "health",
  "nordictrack-commercial-1750-treadmill": "fitness",
  "bowflex-selecttech-552-adjustable-dumbbells": "fitness",
  "babyzen-yoyo2-stroller-6-color-pack": "baby",
  "philips-avent-natural-baby-bottle-260ml": "baby",
  "lego-technic-bugatti-chiron-42083": "toys",
  "barbie-dreamhouse-dollhouse": "toys",
  "west-elm-mid-century-modern-sofa": "furniture",
  "ikea-malm-bed-frame-high-queen-size": "furniture",
  "artemide-tolomeo-mega-floor-lamp": "lighting",
  "flos-ic-lights-s-pendant-lamp": "lighting",
  "garmin-drivesmart-65-gps-navigator": "automotive",
  "anker-roav-smartcharge-f0-car-charger": "automotive",
  "petsafe-automatic-pet-feeder": "pet-supplies",
  "kong-classic-dog-toy": "pet-supplies",
};

async function main() {
  console.log("🔧 Fixing product categories...");

  try {
    const organization = await prisma.organization.findFirst({
      where: { name: { contains: "NexMart" } },
    });

    if (!organization) {
      console.error("❌ No organization found.");
      return;
    }

    const categories = await prisma.category.findMany({
      where: { organizationId: organization.id },
    });

    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [productSlug, categorySlug] of Object.entries(productCategoryMap)) {
      const categoryId = categoryMap.get(categorySlug);
      
      if (!categoryId) {
        console.warn(`⚠️  Category not found: ${categorySlug}`);
        notFoundCount++;
        continue;
      }

      const updated = await prisma.product.updateMany({
        where: {
          organizationId: organization.id,
          slug: productSlug,
        },
        data: {
          categoryId: categoryId,
        },
      });

      if (updated.count > 0) {
        console.log(`✅ Updated: ${productSlug} → ${categorySlug}`);
        updatedCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 CATEGORY FIX REPORT");
    console.log("=".repeat(50));
    console.log(`✅ Products updated: ${updatedCount}`);
    console.log(`⚠️  Categories not found: ${notFoundCount}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
