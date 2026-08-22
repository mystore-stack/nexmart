/**
 * Centralized environment validation (fail-fast in production).
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (process.env.NODE_ENV === "production" && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value || `fallback-dev-${name}-min-32-chars-x`;
}

export function getJwtSecret(): string {
  return requireEnv("JWT_SECRET", process.env.JWT_SECRET);
}

export function getJwtRefreshSecret(): string {
  return requireEnv("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);
}

export function getNextAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? getJwtSecret();
}

export function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

export function isGoogleOAuthEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}
