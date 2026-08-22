export type HealthStatus = "operational" | "degraded" | "down" | "unknown";
export type AiSeverity = "critical" | "high" | "medium" | "low";
export type AuditStatus = "working" | "warning" | "broken";

export interface HealthCheck {
  key: string;
  label: string;
  status: HealthStatus;
  detail: string;
  latencyMs?: number;
  checkedAt: string;
}

export interface HealthSnapshot {
  generatedAt: string;
  overall: HealthStatus;
  checks: HealthCheck[];
}

export interface ErrorIssue {
  id: string;
  title: string;
  message: string;
  severity: AiSeverity;
  source: "logs" | "vercel" | "api" | "database" | "build";
  stack?: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedFiles: string[];
}

export interface BugAnalysis {
  problem: string;
  cause: string;
  filesAffected: string[];
  suggestedFix: string;
  riskLevel: AiSeverity;
  confidence: number;
}

export interface AuditFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  status: AuditStatus;
  severity: AiSeverity;
  file?: string;
  recommendation: string;
}

export interface ProjectAuditReport {
  generatedAt: string;
  score: number;
  findings: AuditFinding[];
}

export interface CmsAuditItem {
  area: string;
  status: AuditStatus;
  detail: string;
  count?: number;
  action?: string;
}

export interface DatabaseTableSnapshot {
  table: "users" | "products" | "orders" | "categories" | "settings";
  count: number;
  rows: Record<string, unknown>[];
}

export interface DeploymentRecord {
  id: string;
  url: string;
  state: "READY" | "ERROR" | "BUILDING" | "QUEUED" | "CANCELED" | "UNKNOWN";
  createdAt: string;
  target?: string;
  creator?: string;
  source: "vercel" | "environment";
  buildError?: string;
}

export interface CodeGenerationResult {
  summary: string;
  prismaSchema: string;
  apiRoutes: string;
  serverActions: string;
  forms: string;
  validation: string;
  adminPages: string;
  implementationPlan: string[];
}

export interface EngineerMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface EngineerConversation {
  id: string;
  title: string | null;
  status: string;
  updatedAt: string;
  messages?: EngineerMessage[];
}
