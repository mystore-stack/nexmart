// src/components/ui/PageHeader.tsx — Moroccan Luxury
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import React from "react";

type Breadcrumb = { label: string; href?: string };
type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, description, breadcrumbs, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-gold-200/40 dark:border-gold-800/20 bg-surface/80">
      {/* Subtle moroccan pattern */}
      <div className="absolute inset-0 moroccan-pattern-bg opacity-10" />
      {/* Gold bottom accent */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

      <div className="relative container-main py-7 md:py-9">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <span className="section-label mb-2 block text-[11px]">
                <span className="inline-block w-6 h-px bg-gold-500 mr-2 align-middle" />
                {eyebrow}
              </span>
            )}
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base leading-relaxed">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
