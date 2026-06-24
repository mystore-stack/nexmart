import { getEnvLocalValue } from "./env-local";

// Ensures we use the project's .env.local DATABASE_URL at runtime.
// This prevents Windows/system env variables from overriding the intended DB.

let cached: string | undefined;

export function getDatabaseUrl(): string {
  if (cached) return cached;

  const urlFromEnvLocal = getEnvLocalValue("DATABASE_URL");
  if (urlFromEnvLocal) {
    console.log("[database-url] ✓ Using .env.local DATABASE_URL");
    console.log("[database-url] Host =", urlFromEnvLocal.match(/@([^:]+)/)?.[1] || "unknown");
    console.log("[database-url] Database =", urlFromEnvLocal.match(/\/([^?]+)/)?.[1] || "unknown");
    cached = urlFromEnvLocal;
    return urlFromEnvLocal;
  }

  // Fallback: allow process.env if env-local isn't available (e.g. CI).
  const url = process.env.DATABASE_URL;
  console.log("[database-url] ✗ .env.local DATABASE_URL not found");
  console.log("[database-url] Falling back to process.env.DATABASE_URL");
  console.log("[database-url] process.env.DATABASE_URL =", url ? url.replace(/:[^:@]+@/, ":***@") : "<missing>");
  
  if (url) {
    const host = url.match(/@([^:]+)/)?.[1] || "unknown";
    const db = url.match(/\/([^?]+)/)?.[1] || "unknown";
    console.log("[database-url] Host =", host);
    console.log("[database-url] Database =", db);
    
    // CRITICAL: Detect and reject localhost connections
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      console.error("[database-url] ❌ CRITICAL: DATABASE_URL points to localhost!");
      console.error("[database-url] This is likely a Windows system environment variable.");
      console.error("[database-url] Solution: Add DATABASE_URL to your .env.local file in the project root.");
      throw new Error(
        "DATABASE_URL points to localhost. This is likely a Windows system environment variable overriding your project configuration. " +
        "Add DATABASE_URL to your .env.local file in the project root to use Neon PostgreSQL."
      );
    }
  }

  if (!url) {
    throw new Error(
      "Missing DATABASE_URL. Ensure it's set in project .env.local (repo root)."
    );
  }

  cached = url;
  return url;
}




