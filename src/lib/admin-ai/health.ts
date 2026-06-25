import { prisma } from "@/lib/prisma";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { isRedisEnabled } from "@/lib/redis";
import type { HealthCheck, HealthSnapshot, HealthStatus } from "./types";

function now() {
  return new Date().toISOString();
}

function overallStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === "down")) return "down";
  if (checks.some((check) => check.status === "degraded" || check.status === "unknown")) return "degraded";
  return "operational";
}

async function timed<T>(fn: () => Promise<T>) {
  const startedAt = Date.now();
  const result = await fn();
  return { result, latencyMs: Date.now() - startedAt };
}

export async function getHealthSnapshot(organizationId: string): Promise<HealthSnapshot> {
  const checkedAt = now();
  const checks: HealthCheck[] = [];

  try {
    const { latencyMs } = await timed(() => prisma.$queryRaw`SELECT 1`);
    checks.push({
      key: "database",
      label: "Database Status",
      status: latencyMs > 800 ? "degraded" : "operational",
      detail: `PostgreSQL responded in ${latencyMs}ms.`,
      latencyMs,
      checkedAt,
    });
  } catch (error) {
    checks.push({
      key: "database",
      label: "Database Status",
      status: "down",
      detail: error instanceof Error ? error.message : "Database probe failed.",
      checkedAt,
    });
  }

  try {
    const adminCount = await prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } });
    checks.push({
      key: "auth",
      label: "Authentication Status",
      status: adminCount > 0 ? "operational" : "degraded",
      detail: adminCount > 0 ? `${adminCount} administrator account(s) available.` : "No administrator accounts found.",
      checkedAt,
    });
  } catch (error) {
    checks.push({
      key: "auth",
      label: "Authentication Status",
      status: "down",
      detail: error instanceof Error ? error.message : "Auth probe failed.",
      checkedAt,
    });
  }

  try {
    const recentAuditCount = await prisma.auditLog.count({
      where: { organizationId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    checks.push({
      key: "api",
      label: "API Status",
      status: "operational",
      detail: `${recentAuditCount} admin audit event(s) in the last 24 hours.`,
      checkedAt,
    });
  } catch {
    checks.push({
      key: "api",
      label: "API Status",
      status: "degraded",
      detail: "API is reachable, but audit telemetry could not be queried.",
      checkedAt,
    });
  }

  try {
    const assetCount = await prisma.mediaAsset.count({ where: { organizationId } });
    checks.push({
      key: "uploads",
      label: "Upload System Status",
      status: "operational",
      detail: `${assetCount} media asset(s) indexed.`,
      checkedAt,
    });
  } catch {
    checks.push({
      key: "uploads",
      label: "Upload System Status",
      status: "unknown",
      detail: "Media table could not be queried.",
      checkedAt,
    });
  }

  try {
    const failedEmails = await prisma.emailLog.count({
      where: { organizationId, status: "FAILED", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });
    checks.push({
      key: "email",
      label: "Email Status",
      status: failedEmails > 0 ? "degraded" : "operational",
      detail: failedEmails > 0 ? `${failedEmails} failed email(s) in the last 7 days.` : "No recent failed emails.",
      checkedAt,
    });
  } catch {
    checks.push({
      key: "email",
      label: "Email Status",
      status: process.env.RESEND_API_KEY || process.env.SMTP_HOST ? "unknown" : "degraded",
      detail: "Email telemetry unavailable.",
      checkedAt,
    });
  }

  try {
    const failedJobs = await prisma.automationLog.count({
      where: { organizationId, status: "FAILED", executedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    checks.push({
      key: "cron",
      label: "Cron Jobs Status",
      status: failedJobs > 0 ? "degraded" : "operational",
      detail: failedJobs > 0 ? `${failedJobs} failed automation job(s) in 24 hours.` : "No failed automation jobs in 24 hours.",
      checkedAt,
    });
  } catch {
    checks.push({
      key: "cron",
      label: "Cron Jobs Status",
      status: "unknown",
      detail: "Automation logs unavailable.",
      checkedAt,
    });
  }

  checks.push({
    key: "cache",
    label: "Cache Status",
    status: isRedisEnabled ? "operational" : "degraded",
    detail: isRedisEnabled ? "Redis cache is enabled." : "Redis is disabled; cache helpers are running in no-op mode.",
    checkedAt,
  });

  checks.push({
    key: "gemini",
    label: "Gemini Status",
    status: isGeminiConfigured() ? "operational" : "degraded",
    detail: isGeminiConfigured() ? "GEMINI_API_KEY is configured." : "GEMINI_API_KEY is missing; AI responses use fallbacks.",
    checkedAt,
  });

  return {
    generatedAt: checkedAt,
    overall: overallStatus(checks),
    checks,
  };
}
