import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Try to get the database metadata
  const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log("Tables in database:", result);
  
  // Now try to query User table
  await prisma.user.findFirst({
    select: { id: true },
  });

  console.log("✅ Connected.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
