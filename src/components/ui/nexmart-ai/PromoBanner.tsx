"use client";

import Link from "next/link";
import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type PromoBannerProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PromoBanner({
  title = "Exclusive Collection",
  subtitle = "Découvrez une sélection curatée par notre IA — pièces rares, éditions limitées.",
  ctaLabel = "Explorer maintenant",
  ctaHref = "/collections/featured",
}: PromoBannerProps) {
  return (
    <section className="ai-section">
      <div className="container-main">
        <div className="ai-promo-banner ai-glass relative overflow-hidden px-8 py-10 sm:px-12 sm:py-14">
          <div className="ai-fluid-blob ai-fluid-blob-3 opacity-60" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="ai-eyebrow mb-4 w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Limited Edition</span>
              </div>
              <h2 className="ai-display text-3xl text-[hsl(222_47%_10%)] sm:text-4xl">{title}</h2>
              <p className="mt-3 text-base leading-7 text-[hsl(var(--ai-muted))]">{subtitle}</p>
            </div>

            <Link href={ctaHref} className="ai-btn-primary shrink-0">
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
