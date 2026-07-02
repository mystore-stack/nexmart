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
  // Resolve to project root regardless of build output structure
  const envPath = path.resolve(process.cwd(), ".env.local");
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

