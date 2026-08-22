// scripts/fix-user-access.ts
// Automatic script to fix user access and ensure proper organization membership
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔧 Automatic User Access Fix Script\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    console.log("🔍 Step 1: Checking current user access...\n");

    // Get admin user
    const adminUser = await pool.query(`
      SELECT id, email, role
      FROM "User"
      WHERE email = 'admin@nexmart.com'
    `);

    if (adminUser.rows.length === 0) {
      console.log("❌ Admin user not found!");
      return;
    }

    const adminId = adminUser.rows[0].id;
    console.log(`✅ Admin user found: ${adminUser.rows[0].email} (${adminId})`);

    // Get organization
    const organization = await pool.query(`
      SELECT id, name, slug, "ownerId"
      FROM "Organization"
      WHERE slug = 'nexmart'
    `);

    if (organization.rows.length === 0) {
      console.log("❌ Organization not found!");
      return;
    }

    const orgId = organization.rows[0].id;
    console.log(`✅ Organization found: ${organization.rows[0].name} (${orgId})`);

    // Check if admin has membership
    console.log("\n🔍 Step 2: Checking admin membership...\n");
    const membership = await pool.query(`
      SELECT * FROM "Membership"
      WHERE "userId" = $1 AND "organizationId" = $2
    `, [adminId, orgId]);

    if (membership.rows.length === 0) {
      console.log("⚠️  Admin user does not have membership in organization");
      console.log("🔧 Creating membership for admin user...");
      
      await pool.query(`
        INSERT INTO "Membership" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, 'OWNER', NOW(), NOW())
      `, [adminId, orgId]);
      
      console.log("✅ Membership created for admin user");
    } else {
      console.log("✅ Admin user already has membership");
      console.log(`   Role: ${membership.rows[0].role}`);
      
      // Update role to OWNER if not already
      if (membership.rows[0].role !== 'OWNER') {
        console.log("🔧 Updating role to OWNER...");
        await pool.query(`
          UPDATE "Membership"
          SET role = 'OWNER', "updatedAt" = NOW()
          WHERE "userId" = $1 AND "organizationId" = $2
        `, [adminId, orgId]);
        console.log("✅ Role updated to OWNER");
      }
    }

    // Check if organization owner is set correctly
    console.log("\n🔍 Step 3: Checking organization owner...\n");
    if (organization.rows[0].ownerId !== adminId) {
      console.log("⚠️  Organization owner is not set to admin user");
      console.log("🔧 Updating organization owner...");
      
      await pool.query(`
        UPDATE "Organization"
        SET "ownerId" = $1, "updatedAt" = NOW()
        WHERE id = $2
      `, [adminId, orgId]);
      
      console.log("✅ Organization owner updated");
    } else {
      console.log("✅ Organization owner is already set correctly");
    }

    // Verify orders exist
    console.log("\n🔍 Step 4: Verifying orders...\n");
    const orderCount = await pool.query(`
      SELECT COUNT(*) as count FROM "Order"
    `);
    
    console.log(`📊 Total orders: ${orderCount.rows[0].count}`);

    if (orderCount.rows[0].count === 0) {
      console.log("⚠️  No orders found. Creating test orders...");
      
      // Create test orders
      await pool.query(`
        INSERT INTO "Order" (
          id, "organizationId", "orderNumber", "userId", "addressId",
          status, "paymentStatus", "paymentMethod", subtotal, discount,
          shipping, tax, total, "createdAt", "updatedAt"
        )
        VALUES 
          (
            gen_random_uuid(), 
            $1, 
            'NX-TEST-001', 
            $2, 
            gen_random_uuid(),
            'PENDING', 
            'PENDING', 
            'STRIPE', 
            100.0, 
            0, 
            10.0, 
            20.0, 
            130.0, 
            NOW(), 
            NOW()
          ),
          (
            gen_random_uuid(), 
            $1, 
            'NX-TEST-002', 
            $2, 
            gen_random_uuid(),
            'CONFIRMED', 
            'PAID', 
            'STRIPE', 
            200.0, 
            10.0, 
            15.0, 
            38.0, 
            243.0, 
            NOW(), 
            NOW()
          )
      `, [orgId, adminId]);
      
      console.log("✅ Test orders created");
    } else {
      console.log("✅ Orders already exist");
    }

    // Final verification
    console.log("\n🔍 Step 5: Final verification...\n");
    
    const finalMembership = await pool.query(`
      SELECT * FROM "Membership"
      WHERE "userId" = $1 AND "organizationId" = $2
    `, [adminId, orgId]);
    
    const finalOrders = await pool.query(`
      SELECT COUNT(*) as count FROM "Order"
      WHERE "organizationId" = $1
    `, [orgId]);

    console.log("✅ Final Status:");
    console.log(`   Admin membership: ${finalMembership.rows.length > 0 ? '✅ Active' : '❌ Missing'}`);
    console.log(`   Role: ${finalMembership.rows[0]?.role || 'N/A'}`);
    console.log(`   Orders in organization: ${finalOrders.rows[0].count}`);

    console.log("\n🎉 Fix completed successfully!");
    console.log("📋 Next steps:");
    console.log("   1. Log in to https://nexmart-ashy.vercel.app/login");
    console.log("   2. Go to https://nexmart-ashy.vercel.app/admin/orders");
    console.log("   3. You should now see the orders");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await pool.end();
  }
}

main();
