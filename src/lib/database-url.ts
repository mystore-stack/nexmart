import { getEnvLocalValue } from "./env-local";

// Ensures we use the project's .env.local DATABASE_URL at runtime.
// This prevents Windows/system env variables from overriding the intended DB.

let cached: string | undefined;

export function getDatabaseUrl(): string {
  if (cached) return cached;

  const urlFromEnvLocal = getEnvLocalValue("DATABASE_URL");
  if (urlFromEnvLocal) {
    // Temporary debug to verify runtime env source
    console.log(
      "[database-url] using .env.local DATABASE_URL =",
      urlFromEnvLocal.slice(0, 80)
    );
    cached = urlFromEnvLocal;
    return urlFromEnvLocal;
  }

  // Fallback: allow process.env if env-local isn't available (e.g. CI).
  const url = process.env.DATABASE_URL;
  console.log(
    "[database-url] .env.local DATABASE_URL not found, falling back to process.env (first 80 chars) =",
    url ? url.slice(0, 80) : "<missing>"
  );

  if (!url) {
    throw new Error(
      "Missing DATABASE_URL. Ensure it's set in project .env.local (repo root)."
    );
  }

  cached = url;
  return url;
}




