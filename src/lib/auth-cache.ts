// Simple in-memory cache for user validation to prevent repeated database queries
// This cache is per-instance and resets on server restart/redeploy
const userCache = new Map<string, { exists: boolean; role: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function cacheUserValidation(userId: string, exists: boolean, role: string) {
  userCache.set(userId, {
    exists,
    role,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

export function getCachedUserValidation(userId: string): { exists: boolean; role: string } | null {
  const cached = userCache.get(userId);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    userCache.delete(userId);
    return null;
  }
  
  return { exists: cached.exists, role: cached.role };
}

export function invalidateUserCache(userId: string) {
  userCache.delete(userId);
}

export function clearUserCache() {
  userCache.clear();
}
