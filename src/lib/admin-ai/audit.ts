import { existsSync } from "fs";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import type { AiSeverity, AuditFinding, CmsAuditItem, ProjectAuditReport } from "./types";

const SRC_EXT = /\.(ts|tsx)$/;
const IMAGE_EXT = /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i;

async function walkFiles(dir: string, matcher: (file: string) => boolean, depth = 0): Promise<string[]> {
  if (depth > 8 || !existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", "generated"].includes(entry.name)) {
        results.push(...await walkFiles(fullPath, matcher, depth + 1));
      }
      continue;
    }
    if (matcher(fullPath)) results.push(fullPath);
  }
  return results;
}

function severityForStatus(status: AuditFinding["status"]): AiSeverity {
  if (status === "broken") return "high";
  if (status === "warning") return "medium";
  return "low";
}

function finding(input: Omit<AuditFinding, "id" | "severity"> & { severity?: AiSeverity }): AuditFinding {
  return {
    id: `${input.category}:${input.title}:${input.file || ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 90),
    severity: input.severity || severityForStatus(input.status),
    ...input,
  };
}

function importTargetExists(root: string, sourceFile: string, importPath: string) {
  if (!importPath.startsWith(".") && !importPath.startsWith("@/")) return true;
  const base = importPath.startsWith("@/")
    ? path.join(root, "src", importPath.slice(2))
    : path.resolve(path.dirname(sourceFile), importPath);
  return ["", ".ts", ".tsx", ".js", ".jsx", ".json"].some((ext) => existsSync(`${base}${ext}`))
    || ["index.ts", "index.tsx", "page.tsx", "route.ts"].some((name) => existsSync(path.join(base, name)));
}

export async function runProjectAudit(): Promise<ProjectAuditReport> {
  const root = process.cwd();
  const files = await walkFiles(path.join(root, "src"), (file) => SRC_EXT.test(file));
  const publicImages = await walkFiles(path.join(root, "public"), (file) => IMAGE_EXT.test(file));
  const findings: AuditFinding[] = [];
  const referencedComponents = new Set<string>();

  for (const file of files) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const text = await readFile(file, "utf8").catch(() => "");

    for (const match of text.matchAll(/from\s+["']([^"']+)["']/g)) {
      const target = match[1];
      if (!importTargetExists(root, file, target)) {
        findings.push(finding({
          category: "Broken imports",
          title: `Missing import target: ${target}`,
          description: `The import in ${rel} does not resolve to a local file.`,
          status: "broken",
          file: rel,
          recommendation: "Create the missing module or update the import path.",
        }));
      }
    }

    for (const match of text.matchAll(/["'](\/[^"']+\.(?:png|jpg|jpeg|webp|gif|svg|ico))["']/gi)) {
      const asset = match[1];
      if (!existsSync(path.join(root, "public", asset))) {
        findings.push(finding({
          category: "Missing images",
          title: `Missing public asset: ${asset}`,
          description: `${rel} references ${asset}, but it was not found in public/.`,
          status: "broken",
          file: rel,
          recommendation: "Add the asset to public/ or replace the reference with a valid URL.",
        }));
      }
    }

    for (const match of text.matchAll(/["'](https?:\/\/[^"']+)["']/g)) {
      try {
        new URL(match[1]);
      } catch {
        findings.push(finding({
          category: "Invalid URLs",
          title: `Invalid URL literal: ${match[1].slice(0, 80)}`,
          description: `${rel} contains a malformed absolute URL.`,
          status: "broken",
          file: rel,
          recommendation: "Replace it with a valid absolute URL or a root-relative path.",
        }));
      }
    }

    if (/src\/app\/.+\/page\.tsx$/.test(rel) && !/metadata|generateMetadata|<title/i.test(text)) {
      findings.push(finding({
        category: "SEO problems",
        title: "Route page has no metadata export",
        description: `${rel} does not declare metadata or generateMetadata.`,
        status: "warning",
        file: rel,
        recommendation: "Add a metadata export with title and description.",
      }));
    }

    if (/<img\b/i.test(text) && !/alt=/.test(text)) {
      findings.push(finding({
        category: "Accessibility issues",
        title: "Image without alt text",
        description: `${rel} contains an img tag without an alt attribute.`,
        status: "warning",
        file: rel,
        recommendation: "Add meaningful alt text or alt=\"\" for decorative images.",
      }));
    }

    for (const match of text.matchAll(/<([A-Z][A-Za-z0-9_]*)/g)) referencedComponents.add(match[1]);
  }

  for (const file of files.filter((candidate) => candidate.includes(`${path.sep}components${path.sep}`))) {
    const basename = path.basename(file).replace(/\.(tsx|ts)$/, "");
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const info = await stat(file).catch(() => null);
    if (basename !== "index" && !referencedComponents.has(basename) && info && info.size > 300) {
      findings.push(finding({
        category: "Unused components",
        title: `${basename} may be unused`,
        description: `No JSX usage of <${basename}> was found in scanned source files.`,
        status: "warning",
        file: rel,
        recommendation: "Confirm usage through dynamic imports before deleting.",
        severity: "low",
      }));
    }
  }

  const routeDirs = await walkFiles(path.join(root, "src", "app"), (file) => /page\.tsx$|route\.ts$/.test(file));
  if (!routeDirs.some((file) => file.includes(`${path.sep}admin${path.sep}ai${path.sep}chat${path.sep}page.tsx`))) {
    findings.push(finding({
      category: "Missing routes",
      title: "AI chat route missing",
      description: "/admin/ai/chat was not found during route scan.",
      status: "broken",
      recommendation: "Create src/app/admin/ai/chat/page.tsx.",
    }));
  }

  if (publicImages.length === 0) {
    findings.push(finding({
      category: "Missing images",
      title: "No public image assets found",
      description: "The public directory does not appear to contain image assets.",
      status: "warning",
      recommendation: "Add brand, OG, favicon, and product placeholder assets.",
    }));
  }

  const brokenWeight = findings.filter((item) => item.status === "broken").length * 12;
  const warningWeight = findings.filter((item) => item.status === "warning").length * 4;

  return {
    generatedAt: new Date().toISOString(),
    score: Math.max(0, 100 - brokenWeight - warningWeight),
    findings: findings.slice(0, 120),
  };
}

export async function runCmsAudit(organizationId: string): Promise<CmsAuditItem[]> {
  const [settings, heroes, homepage, footer, navigation] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { organizationId } }).catch(() => null),
    prisma.heroBanner.findMany({ where: { OR: [{ organizationId }, { organizationId: null }] }, take: 20 }).catch(() => []),
    prisma.homepageConfig.findFirst({ where: { organizationId }, include: { sections: true } }).catch(() => null),
    prisma.footerConfig.findFirst({ where: { organizationId } }).catch(() => null),
    prisma.navigationMenu.findMany({ where: { organizationId }, include: { items: true } }).catch(() => []),
  ]);

  return [
    {
      area: "Site Settings",
      status: settings?.storeName && settings.siteUrl ? "working" : "warning",
      detail: settings ? `${settings.storeName} configured with ${settings.siteUrl || "no site URL"}.` : "No site settings row found.",
      action: settings?.siteUrl ? "Review SEO title and OG image." : "Add siteUrl in CMS settings.",
    },
    {
      area: "Hero Banner CMS",
      status: heroes.some((hero) => hero.isActive) ? "working" : heroes.length ? "warning" : "broken",
      detail: `${heroes.length} hero banner(s), ${heroes.filter((hero) => hero.isActive).length} active.`,
      count: heroes.length,
      action: "Keep at least one active published hero.",
    },
    {
      area: "Homepage CMS",
      status: homepage?.isActive ? "working" : homepage ? "warning" : "broken",
      detail: homepage ? `${homepage.sections.length} section(s), status ${homepage.status}.` : "No homepage configuration found.",
      count: homepage?.sections.length || 0,
      action: "Publish homepage sections that should appear on storefront.",
    },
    {
      area: "Footer CMS",
      status: footer?.isActive ? "working" : footer ? "warning" : "broken",
      detail: footer ? "Footer configuration is present." : "No footer configuration found.",
      action: "Add legal, support, and contact links.",
    },
    {
      area: "Navigation CMS",
      status: navigation.some((menu) => menu.isActive && menu.items.length > 0) ? "working" : navigation.length ? "warning" : "broken",
      detail: `${navigation.length} menu(s), ${navigation.reduce((sum, menu) => sum + menu.items.length, 0)} item(s).`,
      count: navigation.length,
      action: "Keep active header and mobile navigation menus populated.",
    },
  ];
}
