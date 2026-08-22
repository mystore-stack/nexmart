"use client";

import Link from "next/link";
import React from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  bundleDeals,
  formatMad,
  LuxurySectionHeader,
} from "@/components/homepage/luxury-homepage-shared";

export function BundleDealsPremium() {
  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f5fbf8_100%)] py-20">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Bundles"
          title="Des ensembles pensés comme des cadeaux."
          description="Chaque bundle est une composition curatoriale — économies visibles, angle luxe clair, prêt à offrir ou à s'offrir."
          actionHref="/bundles"
          actionLabel="Tous les bundles"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {bundleDeals.map((bundle, index) => (
            <Link
              key={bundle.id}
              href={bundle.href}
              className={`group grid overflow-hidden rounded-[34px] border border-stone-200 bg-white shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg md:grid-cols-[0.95fr_1.05fr] ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="relative min-h-[280px] bg-stone-100">
                <ImageWithFallback
                  src={bundle.image}
                  fallbackSrc="/assets/hero-fallback.svg"
                  alt={bundle.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute left-5 top-5 rounded-full bg-[#c89b3c] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                  {bundle.saving}
                </div>
              </div>

              <div className="space-y-5 p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0d7a5e]">Bundle curation</p>
                <h3 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">{bundle.title}</h3>
                <p className="text-sm leading-7 text-stone-600">{bundle.note}</p>
                <div className="grid gap-2">
                  {bundle.pieces.map((piece) => (
                    <div key={piece} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                      {piece}
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">{formatMad(bundle.price)}</div>
                    <div className="text-sm text-stone-400 line-through">{formatMad(bundle.oldPrice)}</div>
                  </div>
                  <div className="rounded-full bg-[#0d7a5e] px-5 py-3 text-sm font-semibold text-white">Discover bundle</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BundleDealsPremium;
