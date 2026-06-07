import { PrismaClient } from "@prisma/client";

// Production-grade Prisma singleton for Next.js App Router
// Prevents connection leaks in serverless environments (Vercel cold starts)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "minimal",
    // Connection timeout settings for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// In development, attach to global to prevent hot-reload creating multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown for serverless
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;

