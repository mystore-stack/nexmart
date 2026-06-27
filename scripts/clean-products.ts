import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning products...");

  try {
    const organization = await prisma.organization.findFirst({
      where: { name: { contains: "NexMart" } },
    });

    if (!organization) {
      console.error("❌ No organization found.");
      return;
    }

    const deletedProducts = await prisma.product.deleteMany({
      where: { organizationId: organization.id },
    });

    console.log(`✅ Deleted ${deletedProducts.count} products`);

    const deletedVariants = await prisma.productVariant.deleteMany({
      where: {
        product: {
          organizationId: organization.id,
        },
      },
    });

    console.log(`✅ Deleted ${deletedVariants.count} variants`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
