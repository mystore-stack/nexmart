// src/lib/nexplay.ts
// NexPlay utilities: timezone handling, prize selection, idempotency
import { format } from 'date-fns';

/**
 * Get Morocco-local date string (YYYY-MM-DD) in Africa/Casablanca timezone
 * Uses Intl.DateTimeFormat with formatToParts for reliable extraction
 */
export function getMoroccoDate(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Failed to extract date parts for Morocco timezone');
  }

  return `${year}-${month}-${day}`;
}

/**
 * Get Morocco-local midnight for a given date (returns a Date object representing UTC time)
 */
export function getMoroccoMidnight(date: Date = new Date()): Date {
  // Get the date string in Morocco timezone
  const moroccoDateStr = getMoroccoDate(date);
  // Parse it as UTC midnight (safe for comparisons)
  return new Date(`${moroccoDateStr}T00:00:00.000Z`);
}

/**
 * Get next Morocco midnight (start of next day in UTC)
 */
export function getNextMoroccoMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getMoroccoMidnight(tomorrow);
}

/**
 * Select a prize using weighted random selection
 * @param prizes - Array of prizes with weight property
 * @returns Selected prize
 */
export function selectWeightedPrize<T extends { weight: number }>(prizes: T[]): T {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }
  
  return prizes[prizes.length - 1]; // Fallback to last prize
}

/**
 * Generate a unique idempotency key for idempotent operations
 */
export function generateIdempotencyKey(userId: string, operation: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${userId}:${operation}:${timestamp}:${random}`;
}
