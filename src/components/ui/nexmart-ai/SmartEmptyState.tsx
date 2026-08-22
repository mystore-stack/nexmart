"use client";

import React from "react";
import { Sparkles } from "lucide-react";

type SmartEmptyStateProps = {
  message?: string;
  submessage?: string;
  variant?: "default" | "compact" | "card";
  showPulse?: boolean;
  className?: string;
};

export function SmartEmptyState({
  message = "Waiting for data",
  submessage = "Content will adapt here when available",
  variant = "default",
  showPulse = true,
  className = "",
}: SmartEmptyStateProps) {
  const base = "ai-empty-state";

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--ai-border))] bg-[hsl(var(--ai-surface))] px-5 py-4 ${className}`}>
        {showPulse && <span className="ai-pulse-dot" aria-hidden="true" />}
        <div className="text-left">
          <p className="text-sm font-medium text-[hsl(222_47%_10%)]">{message}</p>
          <p className="text-xs text-[hsl(var(--ai-muted))]">{submessage}</p>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`ai-card flex min-h-[280px] flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--ai-purple)/0.08)]">
          <Sparkles className="h-5 w-5 text-[hsl(var(--ai-purple))]" />
        </div>
        {showPulse && (
          <div className="mb-3 flex items-center gap-2">
            <span className="ai-pulse-dot" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--ai-purple))]">AI Adaptive</span>
          </div>
        )}
        <p className="text-base font-semibold text-[hsl(222_47%_10%)]">{message}</p>
        <p className="mt-2 max-w-xs text-sm text-[hsl(var(--ai-muted))]">{submessage}</p>
      </div>
    );
  }

  return (
    <div className={`${base} ${className}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--ai-purple)/0.08)]">
        <Sparkles className="h-6 w-6 text-[hsl(var(--ai-purple))]" />
      </div>
      {showPulse && (
        <div className="mb-3 flex items-center gap-2">
          <span className="ai-pulse-dot" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--ai-purple))]">Intelligent placeholder</span>
        </div>
      )}
      <p className="text-lg font-semibold text-[hsl(222_47%_10%)]">{message}</p>
      <p className="mt-2 max-w-sm text-sm text-[hsl(var(--ai-muted))]">{submessage}</p>
    </div>
  );
}
