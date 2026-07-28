import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugOrganizationIds() {
  try {
    console.log("🔍 Debugging organization IDs...");

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@nexstore.com" },
    });

    if (!adminUser) {
      console.error("❌ Admin user not found");
      return;
    }

    console.log(`\n👤 Admin User: ${adminUser.email} (${adminUser.id})`);

    // Get all memberships for admin user
    const memberships = await prisma.membership.findMany({
      where: { userId: adminUser.id },
      include: {
        Organization: { select: { id: true, name: true, slug: true } },
      },
    });

    console.log(`\n📋 Memberships (${memberships.length}):`);
    memberships.forEach((m) => {
      console.log(`   - ${m.Organization.name} (${m.Organization.slug}): ${m.Organization.id}`);
      console.log(`     Role: ${m.role}`);
    });

    // Get organizations owned by admin user
    const ownedOrgs = await prisma.organization.findMany({
      where: { ownerId: adminUser.id },
    });

    console.log(`\n🏢 Owned Organizations (${ownedOrgs.length}):`);
    ownedOrgs.forEach((org) => {
      console.log(`   - ${org.name} (${org.slug}): ${org.id}`);
    });

    // Get all organizations
    const allOrgs = await prisma.organization.findMany();
    console.log(`\n🌍 All Organizations (${allOrgs.length}):`);
    allOrgs.forEach((org) => {
      console.log(`   - ${org.name} (${org.slug}): ${org.id}`);
      console.log(`     Owner: ${org.ownerId}`);
    });

    // Count products per organization
    console.log(`\n📦 Products per organization:`);
    for (const org of allOrgs) {
      const productCount = await prisma.product.count({
        where: { organizationId: org.id },
      });
      console.log(`   - ${org.name}: ${productCount} products`);
    }

    // Count orders per organization
    console.log(`\n📋 Orders per organization:`);
    for (const org of allOrgs) {
      const orderCount = await prisma.order.count({
        where: { organizationId: org.id },
      });
      console.log(`   - ${org.name}: ${orderCount} orders`);
    }

  } catch (error) {
    console.error("❌ Error debugging:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrganizationIds();
