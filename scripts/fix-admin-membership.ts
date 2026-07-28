import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAdminMembership() {
  try {
    console.log("🔧 Fixing admin user membership...");

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@nexstore.com" },
    });

    if (!adminUser) {
      console.error("❌ Admin user not found");
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);

    // Get nexmart organization
    const organization = await prisma.organization.findFirst({
      where: { slug: "nexmart" },
    });

    if (!organization) {
      console.error("❌ Organization not found");
      return;
    }

    console.log(`✅ Found organization: ${organization.name} (${organization.id})`);

    // Check if membership already exists
    const existingMembership = await prisma.membership.findFirst({
      where: {
        userId: adminUser.id,
        organizationId: organization.id,
      },
    });

    if (existingMembership) {
      console.log("✅ Membership already exists, skipping creation");
      return;
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        id: crypto.randomUUID(),
        userId: adminUser.id,
        organizationId: organization.id,
        role: "ADMIN",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });

    console.log(`✅ Created membership: ${membership.id}`);
    console.log(`✅ Admin user ${adminUser.email} is now linked to organization ${organization.name}`);

    // Verify the fix
    const verifyMembership = await prisma.membership.findFirst({
      where: {
        userId: adminUser.id,
        organizationId: organization.id,
      },
      include: {
        user: { select: { email: true } },
        organization: { select: { name: true } },
      },
    });

    console.log("\n✅ Verification successful:");
    console.log(`   User: ${verifyMembership?.user.email}`);
    console.log(`   Organization: ${verifyMembership?.organization.name}`);
    console.log(`   Role: ${verifyMembership?.role}`);
    console.log(`   Status: ${verifyMembership?.status}`);

  } catch (error) {
    console.error("❌ Error fixing membership:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminMembership();
