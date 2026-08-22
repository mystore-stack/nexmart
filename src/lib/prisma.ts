import { PrismaClient } from "@prisma/client";

// Production-grade Prisma singleton for Next.js App Router
// Prevents connection leaks in serverless environments (Vercel cold starts)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use the correct database URL for Vercel production
const databaseUrl = process.env.DATABASE_URL || process.env.NEXMART_STORAGE_DATABASE_URL;

// Only initialize Prisma if DATABASE_URL is available (skip during build)
if (!databaseUrl) {
  console.warn('DATABASE_URL not available - skipping Prisma initialization');
}

export const prisma = databaseUrl
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      errorFormat: "minimal",
    }))
  : null;

// In development, attach to global to prevent hot-reload creating multiple instances
if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

