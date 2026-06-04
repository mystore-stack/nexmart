import fs from "fs";
import path from "path";

function stripQuotes(v: string): string {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

export function getEnvLocalValue(key: string): string | undefined {
  // src/lib/env-local.ts -> src/lib -> repo root is ../../
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) return undefined;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const k = trimmed.slice(0, idx).trim();
    if (k !== key) continue;

    const raw = trimmed.slice(idx + 1);
    return stripQuotes(raw);
  }

  return undefined;
}

