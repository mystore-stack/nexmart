import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./database-url";

// Production-grade Prisma singleton for Next.js App Router
// Prevents connection leaks in serverless environments (Vercel cold starts)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use custom database URL resolution to ensure .env.local is respected
const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["query", "error"],
    errorFormat: "minimal",
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

