"use client";

import React, { useState } from "react";
import { Bot, CheckCircle2, RefreshCw, Settings2, ShieldCheck, XCircle } from "lucide-react";
import { testGeminiAction } from "@/app/admin/settings/ai/actions";

interface AISettings {
  provider: string;
  configured: boolean;
  model: string;
  visionModel: string;
  embeddingModel: string;
  timeoutMs: number;
  maxOutputTokens: number;
  chatRpm: number;
  searchRpm: number;
  semanticSearch: boolean;
  searchIntent: boolean;
}

export default function AISettingsPanel({ settings }: { settings: AISettings }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status: string; message: string } | null>(null);

  const runTest = async () => {
    setTesting(true);
    try {
      setResult(await testGeminiAction());
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
            <Bot className="h-4 w-4" />
            AI Settings
          </div>
          <h1 className="mt-2 text-3xl font-black">Gemini Configuration</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage NexMart AI provider status, model options, and rate-limit settings.
          </p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm" onClick={runTest} disabled={testing}>
          {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Test Gemini Connection
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatusCard
          title="API Status"
          value={settings.configured ? "Configured" : "Missing key"}
          ok={settings.configured}
          detail={settings.configured ? "GEMINI_API_KEY is present." : "Add GEMINI_API_KEY to your environment."}
        />
        <StatusCard title="Text Model" value={settings.model} ok detail="Used for chat, SEO, copy, and JSON generation." />
        <StatusCard title="Vision Model" value={settings.visionModel} ok detail="Used for product image understanding." />
      </div>

      {result && (
        <div className={`rounded-lg border p-4 ${result.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-start gap-3">
            {result.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : <XCircle className="h-5 w-5 text-amber-700" />}
            <div>
              <p className="font-bold">{result.status}</p>
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">AI Options</h2>
            <p className="text-sm text-muted-foreground">These values are read from deployment environment variables.</p>
          </div>
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ReadOnlyField label="Provider" value={settings.provider} />
          <ReadOnlyField label="Embedding model" value={settings.embeddingModel} />
          <ReadOnlyField label="Timeout" value={`${settings.timeoutMs} ms`} />
          <ReadOnlyField label="Max output tokens" value={String(settings.maxOutputTokens)} />
          <ReadOnlyField label="Chat requests/minute" value={String(settings.chatRpm)} />
          <ReadOnlyField label="Search requests/minute" value={String(settings.searchRpm)} />
          <ReadOnlyField label="Semantic search" value={settings.semanticSearch ? "Enabled" : "Disabled"} />
          <ReadOnlyField label="AI search intent" value={settings.searchIntent ? "Enabled" : "Disabled"} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-bold">Environment Variables</h2>
        <div className="mt-4 grid gap-2 font-mono text-sm">
          <code className="rounded-md bg-muted px-3 py-2">GEMINI_API_KEY=</code>
          <code className="rounded-md bg-muted px-3 py-2">GEMINI_MODEL={settings.model}</code>
          <code className="rounded-md bg-muted px-3 py-2">GEMINI_VISION_MODEL={settings.visionModel}</code>
          <code className="rounded-md bg-muted px-3 py-2">GEMINI_EMBEDDING_MODEL={settings.embeddingModel}</code>
        </div>
      </section>
    </div>
  );
}

function StatusCard({ title, value, detail, ok }: { title: string; value: string; detail: string; ok: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
          <p className="mt-2 text-xl font-black">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
        {ok ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-600" />}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      <input className="input bg-muted/40" value={value} readOnly />
    </label>
  );
}
