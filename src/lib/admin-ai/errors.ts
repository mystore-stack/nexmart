import { createHash } from "crypto";
import { existsSync } from "fs";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { createJson } from "@/lib/ai/gemini";
import type { AiSeverity, BugAnalysis, ErrorIssue } from "./types";

const ERROR_PATTERNS = [/error/i, /exception/i, /failed/i, /invalid/i, /timeout/i, /unauthorized/i, /forbidden/i];
const STACK_FILE_PATTERN = /(?:src|app|components|lib|prisma)[\\/][\w.[\]\-/]+\.(?:ts|tsx|js|jsx|prisma)/g;

function hash(input: string) {
  return createHash("sha1").update(input).digest("hex").slice(0, 14);
}

function severityFor(text: string): AiSeverity {
  if (/database|prisma|payment|auth|unauthorized|forbidden|build failed|deploy/i.test(text)) return "critical";
  if (/failed|exception|timeout|invalid|type error/i.test(text)) return "high";
  if (/warn|deprecated|missing/i.test(text)) return "medium";
  return "low";
}

function filesFrom(text: string) {
  return Array.from(new Set(text.match(STACK_FILE_PATTERN) || [])).slice(0, 8);
}

async function collectLogFiles(root: string) {
  const candidates = ["logs", ".next", "tmp", "var", "storage"].map((dir) => path.join(root, dir));
  const files: string[] = [];

  async function walk(dir: string, depth = 0) {
    if (depth > 2 || !existsSync(dir)) return;
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!["cache", "server", "trace"].includes(entry.name) && !entry.name.startsWith(".")) {
          await walk(fullPath, depth + 1);
        }
        continue;
      }
      if (/\.(log|txt|json)$/.test(entry.name) || entry.name === "trace") files.push(fullPath);
    }
  }

  for (const candidate of candidates) await walk(candidate);
  return files.slice(0, 30);
}

function issueFromText(input: {
  source: ErrorIssue["source"];
  title?: string;
  text: string;
  createdAt?: Date;
}): ErrorIssue | null {
  const normalized = input.text.trim();
  if (!normalized || !ERROR_PATTERNS.some((pattern) => pattern.test(normalized))) return null;

  const firstLine = normalized.split(/\r?\n/).find(Boolean) || input.title || "Application error";
  const date = (input.createdAt || new Date()).toISOString();
  const id = hash(`${input.source}:${firstLine}:${filesFrom(normalized).join(",")}`);

  return {
    id,
    source: input.source,
    title: input.title || firstLine.slice(0, 140),
    message: firstLine.slice(0, 500),
    severity: severityFor(normalized),
    stack: normalized.slice(0, 4000),
    count: 1,
    firstSeen: date,
    lastSeen: date,
    affectedFiles: filesFrom(normalized),
  };
}

function mergeIssues(issues: ErrorIssue[]) {
  const grouped = new Map<string, ErrorIssue>();
  for (const issue of issues) {
    const existing = grouped.get(issue.id);
    if (!existing) {
      grouped.set(issue.id, issue);
      continue;
    }
    existing.count += issue.count;
    existing.firstSeen = existing.firstSeen < issue.firstSeen ? existing.firstSeen : issue.firstSeen;
    existing.lastSeen = existing.lastSeen > issue.lastSeen ? existing.lastSeen : issue.lastSeen;
    existing.affectedFiles = Array.from(new Set([...existing.affectedFiles, ...issue.affectedFiles])).slice(0, 10);
  }
  return Array.from(grouped.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

export async function getErrorIssues(organizationId: string): Promise<ErrorIssue[]> {
  const root = process.cwd();
  const issues: ErrorIssue[] = [];

  const [failedEmails, failedJobs, auditFailures] = await Promise.all([
    prisma.emailLog.findMany({
      where: { organizationId, status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, subject: true, error: true, recipient: true, createdAt: true },
    }).catch(() => []),
    prisma.automationLog.findMany({
      where: { organizationId, status: "FAILED" },
      orderBy: { executedAt: "desc" },
      take: 20,
      select: { id: true, action: true, error: true, entityType: true, executedAt: true },
    }).catch(() => []),
    prisma.auditLog.findMany({
      where: { organizationId, action: { contains: "FAIL", mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, action: true, metadata: true, createdAt: true },
    }).catch(() => []),
  ]);

  for (const email of failedEmails) {
    const issue = issueFromText({
      source: "api",
      title: `Email failed: ${email.subject}`,
      text: email.error || `Failed to send email to ${email.recipient}`,
      createdAt: email.createdAt,
    });
    if (issue) issues.push(issue);
  }

  for (const job of failedJobs) {
    const issue = issueFromText({
      source: "api",
      title: `Automation failed: ${job.action}`,
      text: job.error || `${job.entityType} automation failed`,
      createdAt: job.executedAt,
    });
    if (issue) issues.push(issue);
  }

  for (const audit of auditFailures) {
    const issue = issueFromText({
      source: "api",
      title: `Audit failure: ${audit.action}`,
      text: JSON.stringify(audit.metadata || audit.action),
      createdAt: audit.createdAt,
    });
    if (issue) issues.push(issue);
  }

  for (const file of await collectLogFiles(root)) {
    const info = await stat(file).catch(() => null);
    if (info && info.size > 1_500_000) continue;
    const text = await readFile(file, "utf8").catch(() => "");
    const chunks = text.split(/\r?\n/).filter((line) => ERROR_PATTERNS.some((pattern) => pattern.test(line))).slice(-40);
    for (const chunk of chunks) {
      const issue = issueFromText({ source: file.includes(".next") ? "build" : "logs", text: chunk, createdAt: info?.mtime });
      if (issue) issues.push(issue);
    }
  }

  return mergeIssues(issues);
}

const BUG_ANALYSIS_FALLBACK: BugAnalysis = {
  problem: "The system found an error, but AI analysis is not configured.",
  cause: "Set GEMINI_API_KEY to enable root-cause analysis.",
  filesAffected: [],
  suggestedFix: "Review the stack trace and affected files shown in the Error Center.",
  riskLevel: "medium",
  confidence: 45,
};

export async function analyzeErrorIssue(issue: ErrorIssue): Promise<BugAnalysis> {
  return createJson<BugAnalysis>(
    [
      "You are a senior staff software engineer debugging a Next.js 15, Prisma, PostgreSQL ecommerce admin app.",
      "Return strict JSON with: problem, cause, filesAffected, suggestedFix, riskLevel, confidence.",
      "riskLevel must be one of critical, high, medium, low. confidence is 0-100.",
      "Be specific and include exact code-level guidance when possible.",
    ].join("\n"),
    issue,
    {
      ...BUG_ANALYSIS_FALLBACK,
      problem: issue.title,
      filesAffected: issue.affectedFiles,
      riskLevel: issue.severity,
    },
  );
}
