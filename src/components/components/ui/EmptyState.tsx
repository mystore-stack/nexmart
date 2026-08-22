// src/components/ui/EmptyState.tsx — Moroccan Luxury
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import React from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gold-200/50 dark:border-gold-800/30 bg-white dark:bg-card px-8 py-16 text-center"
      role="status"
      style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}
    >
      {/* Subtle moroccan bg */}
      <div className="absolute inset-0 moroccan-pattern-bg opacity-5" />

      {/* Decorative SVG ornament */}
      <div className="absolute top-4 right-4 opacity-10">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 3L45 24L24 45L3 24Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
          <path d="M24 12L36 24L24 36L12 24Z" stroke="#D4AF37" strokeWidth="0.75" fill="none" />
          <circle cx="24" cy="24" r="4" fill="#D4AF37" />
        </svg>
      </div>

      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-200/40 dark:border-gold-800/20 bg-surface">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>

      <h2 className="font-display text-xl font-semibold mb-2 text-foreground">{title}</h2>
      <p className="mb-7 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>

      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary h-11 px-6 text-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className="btn btn-primary h-11 px-6 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
