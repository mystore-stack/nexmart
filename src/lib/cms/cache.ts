// src/lib/cms/cache.ts - CMS Cache Management

import { getCache, setCache, deleteCache } from '@/lib/redis';

export const CMS_CACHE_KEYS = {
  settings: (orgId: string) => `cms:settings:${orgId}`,
  homepage: (orgId: string) => `cms:homepage:${orgId}`,
  footer: (orgId: string) => `cms:footer:${orgId}`,
  announcement: (orgId: string) => `cms:announcement:${orgId}`,
  media: (orgId: string) => `cms:media:${orgId}`,
  hero: (orgId: string) => `cms:hero:${orgId}`,
  navigation: (orgId: string) => `cms:navigation:${orgId}`,
} as const;

export type CMSDomain = keyof typeof CMS_CACHE_KEYS;

// CMS Cache TTL (short for instant updates)
export const CMS_CACHE_TTL = 30; // 30 seconds

/**
 * Get cached CMS data for a domain
 */
export async function getCMSCache<T>(domain: CMSDomain, organizationId: string): Promise<T | null> {
  const cacheKey = CMS_CACHE_KEYS[domain](organizationId);
  return getCache<T>(cacheKey);
}

/**
 * Set cached CMS data for a domain
 */
export async function setCMSCache<T>(domain: CMSDomain, organizationId: string, data: T): Promise<void> {
  const cacheKey = CMS_CACHE_KEYS[domain](organizationId);
  await setCache(cacheKey, data, CMS_CACHE_TTL);
}

/**
 * Invalidate CMS cache for a specific domain
 */
export async function invalidateCMSCache(domain: CMSDomain, organizationId: string): Promise<void> {
  const cacheKey = CMS_CACHE_KEYS[domain](organizationId);
  await deleteCache(cacheKey);
  await deleteCache(`cms:${domain}:*`);
}

/**
 * Invalidate all CMS cache for an organization
 */
export async function invalidateAllCMSCache(organizationId: string): Promise<void> {
  const domains: CMSDomain[] = ['settings', 'homepage', 'footer', 'announcement', 'media', 'hero', 'navigation'];
  await Promise.all(domains.map((domain) => invalidateCMSCache(domain, organizationId)));
}
