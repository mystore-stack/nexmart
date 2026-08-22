// src/components/homepage/SectionWrapper.tsx
"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  children: React.ReactNode;
  /** Optional background class for custom section styles */
  bgClass?: string;
  /** Optional additional wrapper classes */
  className?: string;
}

/**
 * Reusable wrapper component used across the homepage to provide
 * a consistent layout for section titles, optional call‑to‑action
 * links, and background styling.
 *
 * - Applies the standard 18px border radius via `rounded-[18px]`.
 * - Uses the premium palette defined in the design system.
 * - Accepts a `bgClass` prop for section‑specific background utilities.
 */
export function SectionWrapper({
  title,
  ctaLabel,
  ctaHref,
  children,
  bgClass = "bg-white dark:bg-card",
  className = "",
}: SectionWrapperProps) {
  return (
    <section className={`relative overflow-hidden rounded-[18px] border border-gray-200 ${bgClass} ${className} p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]`}>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {title}
          </h2>
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-sm font-semibold text-amber-700 transition-all hover:-translate-y-0.5 hover:border-amber-300 dark:border-white/10 dark:bg-slate-900/65 dark:text-amber-400"
            >
              {ctaLabel}
            </Link>
          )}
        </motion.div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
