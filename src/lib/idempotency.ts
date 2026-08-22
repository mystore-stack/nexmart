// src/lib/idempotency.ts
// Production-safe idempotency key generation utility

/**
 * Generate a unique idempotency key with fallbacks for all environments
 * 
 * Priority:
 * 1. globalThis.crypto.randomUUID() (modern browsers, Node.js 15.6+)
 * 2. Fallback: timestamp + random string (universal compatibility)
 * 
 * @returns A unique idempotency key string
 */
export function generateIdempotencyKey(): string {
  // Try modern crypto API first
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
    try {
      return globalThis.crypto.randomUUID();
    } catch (error) {
      console.warn("[IDEMPOTENCY] crypto.randomUUID failed, using fallback:", error);
    }
  }

  // Fallback: timestamp + random string
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const fallbackKey = `${timestamp}-${randomPart}`;

  if (process.env.NODE_ENV === 'development') {
    console.log("[IDEMPOTENCY] Using fallback idempotency key:", fallbackKey);
  }

  return fallbackKey;
}

/**
 * Generate a unique request ID for tracing
 * Same logic as idempotency key but can be used for any unique identifier
 */
export function generateRequestId(): string {
  return generateIdempotencyKey();
}

/**
 * Validate an idempotency key format
 * Accepts both UUID format and fallback format
 */
export function isValidIdempotencyKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;

  // UUID format (v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(key)) return true;

  // Fallback format: timestamp-random
  const fallbackRegex = /^[a-z0-9]+-[a-z0-9]+$/i;
  return fallbackRegex.test(key);
}
