import { getCache, setCache } from "@/lib/redis";

export const AI_CACHE_TTL = {
  MODERATION: 60 * 60 * 24,
  EMBEDDING: 60 * 60 * 24 * 14,
  JSON: 60 * 60 * 6,
  SEARCH: 60 * 5,
  RECOMMENDATIONS: 60 * 10,
  CHAT_FAQ: 60 * 30,
} as const;

export async function stableHash(value: unknown) {
  const input = typeof value === "string" ? value : stableStringify(value);
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAiCache<T>(namespace: string, value: unknown) {
  return getCache<T>(`ai:${namespace}:${await stableHash(value)}`);
}

export async function setAiCache<T>(namespace: string, value: unknown, payload: T, ttl: number) {
  await setCache(`ai:${namespace}:${await stableHash(value)}`, payload, ttl);
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
    .join(",")}}`;
}
