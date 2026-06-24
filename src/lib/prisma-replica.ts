// src/lib/prisma-replica.ts
import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './database-url';

// Use custom database URL resolution to ensure .env.local is respected
const databaseUrl = getDatabaseUrl();

// Write client for mutations
export const prismaWrite = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Read client for queries (read replica)
export const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL || databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Default client (backward compatibility)
import { prisma as defaultPrisma } from '@/lib/prisma';
export const prisma = defaultPrisma;

// Connection pool configuration
const connectionPoolSize = process.env.DATABASE_POOL_SIZE 
  ? parseInt(process.env.DATABASE_POOL_SIZE)
  : 20;

// Health check for database
export async function checkDatabaseHealth() {
  try {
    await prismaWrite.$queryRaw`SELECT 1`;
    return { status: 'healthy', latency: 0 };
  } catch (error) {
    console.error('[Database Health Check] Failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
}

// Get connection pool stats
export async function getConnectionPoolStats() {
  try {
    const stats = await prismaWrite.$queryRaw`
      SELECT 
        count(*) as active_connections,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;
    return stats[0];
  } catch (error) {
    console.error('[Connection Pool Stats] Failed:', error);
    return null;
  }
}
