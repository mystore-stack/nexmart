import type { CMSContentStatus } from "@prisma/client";

export function isWithinSchedule(startDate: Date | null | undefined, endDate: Date | null | undefined, now = new Date()): boolean {
  if (startDate && startDate > now) return false;
  if (endDate && endDate < now) return false;
  return true;
}

export function isAdActive(
  status: CMSContentStatus,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  now = new Date()
): boolean {
  if (status !== "PUBLISHED" && status !== "SCHEDULED") return false;
  return isWithinSchedule(startDate, endDate, now);
}

export function computeCtr(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 100;
}

export function activeDateFilter(now = new Date()) {
  return {
    OR: [{ startDate: null }, { startDate: { lte: now } }],
    AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
  };
}
