import { PrismaClient } from "@prisma/client";

// Production-grade Prisma singleton for Next.js App Router
// Prevents connection leaks in serverless environments (Vercel cold starts)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use the correct database URL for Vercel production
const databaseUrl = process.env.DATABASE_URL || process.env.NEXMART_STORAGE_DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "minimal",
  });

// In development, attach to global to prevent hot-reload creating multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

