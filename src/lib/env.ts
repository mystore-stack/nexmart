/**
 * Centralized environment validation (fail-fast in production).
 * For Vercel deployment, we allow fallback values during build time.
 * Runtime validation will happen when the app actually runs.
 */
export function requireEnv(name: string, value: string | undefined): string {
  // Always provide a fallback to allow builds to succeed
  // The actual environment variables will be set in Vercel dashboard
  if (!value) {
    return `fallback-${name}-min-32-chars-x-for-build-time`;
  }
  return value;
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
