"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  GitBranch,
  HeartPulse,
  Loader2,
  Play,
  RefreshCw,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  AuditFinding,
  BugAnalysis,
  CmsAuditItem,
  CodeGenerationResult,
  DatabaseTableSnapshot,
  DeploymentRecord,
  EngineerConversation,
  EngineerMessage,
  ErrorIssue,
  HealthSnapshot,
} from "@/lib/admin-ai/types";

type View = "overview" | "chat" | "errors" | "audit" | "health" | "deployments";

type OverviewData = {
  health?: HealthSnapshot;
  issues?: ErrorIssue[];
  project?: { generatedAt: string; score: number; findings: AuditFinding[] };
  cms?: CmsAuditItem[];
  deployments?: DeploymentRecord[];
  database?: { overview: Record<string, number>; snapshot: DatabaseTableSnapshot };
};

const nav = [
  { label: "Overview", href: "/admin/ai", view: "overview" },
  { label: "Chat", href: "/admin/ai/chat", view: "chat" },
  { label: "Errors", href: "/admin/ai/errors", view: "errors" },
  { label: "Audit", href: "/admin/ai/audit", view: "audit" },
  { label: "Health", href: "/admin/ai/health", view: "health" },
  { label: "Deployments", href: "/admin/ai/deployments", view: "deployments" },
] as const;

const statusClass = {
  operational: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  working: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  READY: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  degraded: "bg-amber-50 text-amber-700 ring-amber-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  BUILDING: "bg-amber-50 text-amber-700 ring-amber-200",
  QUEUED: "bg-amber-50 text-amber-700 ring-amber-200",
  down: "bg-red-50 text-red-700 ring-red-200",
  broken: "bg-red-50 text-red-700 ring-red-200",
  ERROR: "bg-red-50 text-red-700 ring-red-200",
  CANCELED: "bg-red-50 text-red-700 ring-red-200",
  unknown: "bg-slate-100 text-slate-700 ring-slate-200",
  UNKNOWN: "bg-slate-100 text-slate-700 ring-slate-200",
};

const severityClass = {
  critical: "bg-red-600 text-white",
  high: "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  low: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(json.error || "Request failed");
  return json;
}

export function AiEngineerDashboard({ view = "overview" }: { view?: View }) {
  return (
    <div className="space-y-6">
      <Header view={view} />
      {view === "overview" && <Overview />}
      {view === "chat" && <EngineerChat />}
      {view === "errors" && <ErrorCenter />}
      {view === "audit" && <AuditCenter />}
      {view === "health" && <HealthCenter />}
      {view === "deployments" && <DeploymentCenter />}
    </div>
  );
}

function Header({ view }: { view: View }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Admin-only AI operations
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">AI Engineer Dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Diagnose errors, audit CMS and code health, inspect production data, and generate implementation-ready engineering plans.
          </p>
        </div>
        <QuickActions compact />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              item.view === view ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Overview() {
  const [data, setData] = useState<OverviewData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getJson<{ health: HealthSnapshot }>("/api/admin/ai/health"),
      getJson<{ issues: ErrorIssue[] }>("/api/admin/ai/errors"),
      getJson<{ project: OverviewData["project"]; cms: CmsAuditItem[] }>("/api/admin/ai/audit"),
      getJson<{ deployments: DeploymentRecord[] }>("/api/admin/ai/deployments"),
      getJson<{ overview: Record<string, number>; snapshot: DatabaseTableSnapshot }>("/api/admin/ai/database?table=users&take=8"),
    ]).then((results) => {
      if (!active) return;
      setData({
        health: results[0].status === "fulfilled" ? results[0].value.health : undefined,
        issues: results[1].status === "fulfilled" ? results[1].value.issues : [],
        project: results[2].status === "fulfilled" ? results[2].value.project : undefined,
        cms: results[2].status === "fulfilled" ? results[2].value.cms : [],
        deployments: results[3].status === "fulfilled" ? results[3].value.deployments : [],
        database: results[4].status === "fulfilled" ? results[4].value : undefined,
      });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const critical = data.issues?.filter((issue) => issue.severity === "critical").length || 0;
  const brokenCms = data.cms?.filter((item) => item.status === "broken").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={HeartPulse} label="System health" value={data.health?.overall || "..."} tone={data.health?.overall === "operational" ? "good" : "warn"} />
        <MetricCard icon={AlertTriangle} label="Critical errors" value={loading ? "..." : critical} tone={critical ? "bad" : "good"} />
        <MetricCard icon={SearchCheck} label="Audit score" value={data.project ? `${data.project.score}%` : "..."} tone={(data.project?.score || 0) >= 80 ? "good" : "warn"} />
        <MetricCard icon={Sparkles} label="CMS broken" value={loading ? "..." : brokenCms} tone={brokenCms ? "bad" : "good"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-border bg-card">
          <SectionHeader icon={Activity} title="Operations Feed" description="Live summary across health, errors, audits, CMS, and deployments." />
          <div className="divide-y divide-border">
            {(data.health?.checks || []).slice(0, 5).map((check) => (
              <StatusRow key={check.key} title={check.label} detail={check.detail} status={check.status} />
            ))}
            {(data.issues || []).slice(0, 4).map((issue) => (
              <StatusRow key={issue.id} title={issue.title} detail={issue.message} status={issue.severity} severity />
            ))}
            {!loading && !data.health?.checks?.length && <EmptyLine label="No telemetry returned yet." />}
          </div>
        </section>

        <aside className="space-y-6">
          <QuickActions />
          <CodeGenerator compact />
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DatabaseInspector initial={data.database} />
        <DeploymentList deployments={data.deployments || []} />
      </div>
    </div>
  );
}

function EngineerChat() {
  const [conversations, setConversations] = useState<EngineerConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<EngineerMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getJson<{ conversations: EngineerConversation[] }>("/api/admin/ai/engineer/chat")
      .then((json) => setConversations(json.conversations))
      .catch(() => setConversations([]));
  }, []);

  const loadConversation = async (id: string) => {
    const json = await getJson<{ conversation: EngineerConversation | null }>(`/api/admin/ai/engineer/chat?conversationId=${id}`);
    setConversationId(id);
    setMessages(json.conversation?.messages || []);
  };

  const send = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    const optimistic: EngineerMessage = { id: `local-${Date.now()}`, role: "user", content: trimmed, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setMessage("");
    setLoading(true);
    try {
      const json = await getJson<{ conversationId: string; message: EngineerMessage }>("/api/admin/ai/engineer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed }),
      });
      setConversationId(json.conversationId);
      setMessages((prev) => [...prev, json.message]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: error instanceof Error ? error.message : "AI request failed.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-border bg-card">
        <SectionHeader icon={Bot} title="Conversations" description="Stored in Prisma." />
        <div className="divide-y divide-border">
          <button
            type="button"
            onClick={() => { setConversationId(undefined); setMessages([]); }}
            className="flex w-full items-center gap-2 p-4 text-left text-sm font-medium hover:bg-muted/50"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            New engineer chat
          </button>
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => loadConversation(conversation.id)}
              className={`block w-full p-4 text-left text-sm hover:bg-muted/50 ${conversation.id === conversationId ? "bg-muted" : ""}`}
            >
              <span className="font-medium">{conversation.title || "Untitled"}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{new Date(conversation.updatedAt).toLocaleString()}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[620px] flex-col rounded-lg border border-border bg-card">
        <SectionHeader icon={TerminalSquare} title="AI Chat Engineer" description="Ask for root-cause analysis, architecture review, Prisma schemas, API routes, and React components." />
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((item) => (
            <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[820px] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm ${
                item.role === "user" ? "bg-foreground text-background" : "border border-border bg-background"
              }`}>
                {item.content}
              </div>
            </div>
          ))}
          {!messages.length && (
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {["Explain the latest build errors", "Generate a product reviews CMS", "Audit the current Prisma relations", "Review admin API route security"].map((prompt) => (
                <button key={prompt} type="button" onClick={() => setMessage(prompt)} className="rounded-lg border border-border p-4 text-left text-sm hover:bg-muted/50">
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) send();
              }}
              className="input min-h-[56px] flex-1 resize-none"
              placeholder="Ask the AI engineer to diagnose, explain, generate, or review..."
            />
            <button type="button" onClick={send} disabled={loading || !message.trim()} className="btn-primary self-end">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ErrorCenter() {
  const [issues, setIssues] = useState<ErrorIssue[]>([]);
  const [analysis, setAnalysis] = useState<BugAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    getJson<{ issues: ErrorIssue[] }>("/api/admin/ai/errors")
      .then((json) => setIssues(json.issues))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const analyze = async (issue: ErrorIssue) => {
    setAnalyzing(issue.id);
    try {
      const json = await getJson<{ analysis: BugAnalysis }>("/api/admin/ai/errors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issue),
      });
      setAnalysis(json.analysis);
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-lg border border-border bg-card">
        <SectionHeader icon={AlertTriangle} title="Error Center" description="Application logs, deployment failures, API failures, stack traces, and severity grouping." action={<button className="btn-outline btn-sm" onClick={refresh}><RefreshCw className="h-4 w-4" /> Refresh</button>} />
        <div className="divide-y divide-border">
          {issues.map((issue) => (
            <div key={issue.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityClass[issue.severity]}`}>{issue.severity}</span>
                    <span className="text-xs text-muted-foreground">{issue.source} x{issue.count}</span>
                  </div>
                  <h3 className="mt-2 font-semibold">{issue.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.message}</p>
                </div>
                <button type="button" onClick={() => analyze(issue)} className="btn-primary btn-sm" disabled={analyzing === issue.id}>
                  {analyzing === issue.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analyze With AI
                </button>
              </div>
              {issue.stack && <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">{issue.stack}</pre>}
            </div>
          ))}
          {!loading && !issues.length && <EmptyLine label="No grouped errors found." />}
          {loading && <EmptyLine label="Reading logs and failure telemetry..." />}
        </div>
      </section>

      <aside className="rounded-lg border border-border bg-card">
        <SectionHeader icon={Sparkles} title="AI Bug Analyzer" description="Root cause, affected files, exact fix, risk, and confidence." />
        {analysis ? (
          <div className="space-y-4 p-4 text-sm">
            <AnalysisBlock label="Problem" value={analysis.problem} />
            <AnalysisBlock label="Cause" value={analysis.cause} />
            <AnalysisBlock label="Files Affected" value={analysis.filesAffected.join("\n") || "No files identified"} />
            <AnalysisBlock label="Suggested Fix" value={analysis.suggestedFix} />
            <div className="grid grid-cols-2 gap-3">
              <AnalysisBlock label="Risk" value={analysis.riskLevel} />
              <AnalysisBlock label="Confidence" value={`${analysis.confidence}%`} />
            </div>
          </div>
        ) : (
          <EmptyLine label="Select an error and run Analyze With AI." />
        )}
      </aside>
    </div>
  );
}

function AuditCenter() {
  const [project, setProject] = useState<OverviewData["project"]>();
  const [cms, setCms] = useState<CmsAuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    getJson<{ project: OverviewData["project"]; cms: CmsAuditItem[] }>("/api/admin/ai/audit")
      .then((json) => { setProject(json.project); setCms(json.cms); })
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={SearchCheck} label="Project score" value={project ? `${project.score}%` : "..."} tone={(project?.score || 0) >= 80 ? "good" : "warn"} />
        <MetricCard icon={XCircle} label="Broken findings" value={project?.findings.filter((item) => item.status === "broken").length ?? "..."} tone="bad" />
        <MetricCard icon={CheckCircle2} label="CMS working" value={cms.filter((item) => item.status === "working").length || "..."} tone="good" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-border bg-card">
          <SectionHeader icon={SearchCheck} title="Project Auditor" description="Missing routes, broken imports, images, URLs, SEO, dead code, metadata, and accessibility." action={<button className="btn-primary btn-sm" onClick={refresh}><Play className="h-4 w-4" /> Run Audit</button>} />
          <div className="divide-y divide-border">
            {(project?.findings || []).map((item) => (
              <StatusRow key={item.id} title={item.title} detail={`${item.description} ${item.file ? `(${item.file})` : ""}`} status={item.status} />
            ))}
            {!loading && !project?.findings.length && <EmptyLine label="No audit findings." />}
            {loading && <EmptyLine label="Scanning project..." />}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-card">
          <SectionHeader icon={Sparkles} title="CMS Auditor" description="Homepage, hero, footer, navigation, and site settings." />
          <div className="divide-y divide-border">
            {cms.map((item) => (
              <StatusRow key={item.area} title={item.area} detail={`${item.detail} ${item.action || ""}`} status={item.status} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HealthCenter() {
  const [health, setHealth] = useState<HealthSnapshot>();
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    getJson<{ health: HealthSnapshot }>("/api/admin/ai/health")
      .then((json) => setHealth(json.health))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-border bg-card">
        <SectionHeader icon={HeartPulse} title="System Health Monitor" description="Database, auth, API, uploads, email, cron, cache, and Gemini." action={<button className="btn-primary btn-sm" onClick={refresh}><RefreshCw className="h-4 w-4" /> Run Health Check</button>} />
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {(health?.checks || []).map((check) => (
            <div key={check.key} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{check.label}</h3>
                <StatusBadge status={check.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{check.detail}</p>
              {check.latencyMs !== undefined && <p className="mt-3 text-xs text-muted-foreground">{check.latencyMs}ms latency</p>}
            </div>
          ))}
          {loading && <EmptyLine label="Checking systems..." />}
        </div>
      </section>
      <QuickActions />
    </div>
  );
}

function DeploymentCenter() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [database, setDatabase] = useState<OverviewData["database"]>();

  useEffect(() => {
    getJson<{ deployments: DeploymentRecord[] }>("/api/admin/ai/deployments").then((json) => setDeployments(json.deployments)).catch(() => setDeployments([]));
    getJson<{ overview: Record<string, number>; snapshot: DatabaseTableSnapshot }>("/api/admin/ai/database?table=orders&take=12").then(setDatabase).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <DeploymentList deployments={deployments} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DatabaseInspector initial={database} />
        <CodeGenerator />
      </div>
    </div>
  );
}

function DatabaseInspector({ initial }: { initial?: OverviewData["database"] }) {
  const [table, setTable] = useState<DatabaseTableSnapshot["table"]>("users");
  const [data, setData] = useState(initial);

  useEffect(() => {
    if (initial) setData(initial);
  }, [initial]);

  const load = (nextTable: DatabaseTableSnapshot["table"]) => {
    setTable(nextTable);
    getJson<{ overview: Record<string, number>; snapshot: DatabaseTableSnapshot }>(`/api/admin/ai/database?table=${nextTable}&take=12`)
      .then(setData)
      .catch(() => undefined);
  };

  const rows = data?.snapshot.rows || [];
  const columns = rows[0] ? Object.keys(rows[0]).slice(0, 6) : [];

  return (
    <section className="rounded-lg border border-border bg-card">
      <SectionHeader icon={Database} title="Database Inspector" description="Read-only visibility into users, products, orders, categories, and settings." />
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap gap-1">
          {(["users", "products", "orders", "categories", "settings"] as const).map((item) => (
            <button key={item} onClick={() => load(item)} className={`rounded-md px-3 py-1.5 text-sm ${table === item ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>{columns.map((column) => <th key={column} className="border-b border-border px-3 py-2">{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-border/70">
                {columns.map((column) => <td key={column} className="max-w-[220px] truncate px-3 py-2">{formatCell(row[column])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <EmptyLine label="No rows to display." />}
      </div>
    </section>
  );
}

function CodeGenerator({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState("Create Product Reviews CMS");
  const [result, setResult] = useState<CodeGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const json = await getJson<{ result: CodeGenerationResult }>("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      setResult(json.result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-card">
      <SectionHeader icon={Code2} title="AI Code Generator" description="Generate Prisma, routes, actions, forms, validation, and admin pages." />
      <div className="space-y-3 p-4">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="input min-h-[90px] w-full resize-none" />
        <button type="button" onClick={generate} className="btn-primary w-full" disabled={loading || !prompt.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </button>
        {result && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{result.summary}</p>
            {!compact && <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">{result.prismaSchema}</pre>}
            <ol className="space-y-1 text-sm text-muted-foreground">
              {result.implementationPlan.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

function DeploymentList({ deployments }: { deployments: DeploymentRecord[] }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <SectionHeader icon={GitBranch} title="Deployment Center" description="Current deployment, previous deployments, build status, and build errors." />
      <div className="divide-y divide-border">
        {deployments.map((deployment) => (
          <div key={deployment.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={deployment.state} />
                <p className="font-medium">{deployment.url}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {deployment.target || "unknown target"} · {deployment.creator || "unknown creator"} · {new Date(deployment.createdAt).toLocaleString()}
              </p>
              {deployment.buildError && <p className="mt-2 text-sm text-red-600">{deployment.buildError}</p>}
            </div>
            <span className="text-xs text-muted-foreground">{deployment.source}</span>
          </div>
        ))}
        {!deployments.length && <EmptyLine label="No deployment records available." />}
      </div>
    </section>
  );
}

function QuickActions({ compact = false }: { compact?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const actions = [
    ["revalidate", "Revalidate Website"],
    ["clear-cache", "Clear Cache"],
    ["run-audit", "Run Audit"],
    ["run-health", "Run Health Check"],
    ["validate-cms", "Validate CMS"],
  ] as const;

  const run = async (action: string) => {
    setBusy(action);
    try {
      await getJson("/api/admin/ai/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={compact ? "" : "rounded-lg border border-border bg-card"}>
      {!compact && <SectionHeader icon={Play} title="One Click Actions" description="Fast operational actions for production support." />}
      <div className={`flex ${compact ? "flex-wrap justify-end gap-2" : "flex-col gap-2 p-4"}`}>
        {actions.map(([action, label]) => (
          <button key={action} type="button" onClick={() => run(action)} className={compact ? "btn-outline btn-sm" : "btn-outline justify-start"} disabled={busy !== null}>
            {busy === action ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string | number; tone: "good" | "warn" | "bad" }) {
  const toneClass = tone === "good" ? "text-emerald-600 bg-emerald-50" : tone === "bad" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`rounded-md p-2 ${toneClass}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-4 text-2xl font-bold capitalize">{value}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
      <div className="flex gap-3">
        <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4 text-foreground" /></div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${statusClass[status as keyof typeof statusClass] || statusClass.unknown}`}>{status}</span>;
}

function StatusRow({ title, detail, status, severity = false }: { title: string; detail: string; status: string; severity?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{detail}</p>
      </div>
      {severity ? <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityClass[status as keyof typeof severityClass] || severityClass.low}`}>{status}</span> : <StatusBadge status={status} />}
    </div>
  );
}

function AnalysisBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3">{value}</p>
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="p-8 text-center text-sm text-muted-foreground">{label}</div>;
}

function formatCell(value: unknown) {
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "-";
  return JSON.stringify(value);
}
