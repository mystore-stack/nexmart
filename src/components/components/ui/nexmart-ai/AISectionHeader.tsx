"use client";

import Link from "next/link";
import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type AISectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  align?: "left" | "center";
  aiPowered?: boolean;
};

export function AISectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  align = "left",
  aiPowered = false,
}: AISectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={`mb-10 flex flex-col gap-6 ${centered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between"}`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-3xl"}>
        <div className="ai-eyebrow mb-4">
          {aiPowered ? <Sparkles className="h-3.5 w-3.5" aria-hidden /> : null}
          <span>{eyebrow}</span>
        </div>
        <h2 className="ai-display text-3xl text-[hsl(222_47%_10%)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--ai-muted))] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link href={actionHref} className="ai-btn-ghost shrink-0">
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
