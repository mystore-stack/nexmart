import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("[VERIFY] Checking Address table existence and structure");

  // Check if Address table exists
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Address'
  `;
  console.log("[VERIFY] Address table exists:", tables.length > 0);

  if (tables.length > 0) {
    // Get table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'Address'
      ORDER BY ordinal_position
    `;
    console.log("[VERIFY] Address table columns:", columns);

    // Check for foreign key constraint
    const constraints = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
      AND tc.table_name = 'Address'
      AND tc.constraint_type = 'FOREIGN KEY'
    `;
    console.log("[VERIFY] Address table foreign key constraints:", constraints);
  }

  // Try to query the table
  try {
    const count = await prisma.address.count();
    console.log("[VERIFY] Address table row count:", count);
  } catch (error) {
    console.error("[VERIFY] Error querying Address table:", error);
  }

  console.log("[VERIFY] ✅ Verification complete");
}

main()
  .catch((error) => {
    console.error("[VERIFY ERROR]", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
