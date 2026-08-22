"use client";

import Link from "next/link";
import React from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  luxuryCollections,
  LuxurySectionHeader,
} from "@/components/homepage/luxury-homepage-shared";

const LuxuryCollections: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Collections"
          title="Des chapitres de lookbook à explorer."
          description="Chaque collection devient une destination avec sa propre ambiance — le scroll reste éditorial, jamais répétitif."
          actionHref="/collections"
          actionLabel="Explorer les collections"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {luxuryCollections.map((collection, index) => (
            <Link
              key={collection.id}
              href={collection.href}
              className={`group overflow-hidden rounded-[36px] border border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)] shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div className={`relative overflow-hidden bg-stone-100 ${index === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                <div className="relative inset-0">
                  <ImageWithFallback
                    src={collection.image}
                    fallbackSrc="/assets/hero-fallback.svg"
                    alt={collection.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/78 via-stone-950/10 to-transparent p-6 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f0d69d]">{collection.kicker}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collection.metrics.map((metric) => (
                      <span key={metric} className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-medium text-white/88 backdrop-blur">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-7">
                <h3 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">{collection.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{collection.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0d7a5e]">
                  <span>Découvrir la collection</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

LuxuryCollections.displayName = "LuxuryCollections";

export default React.memo(LuxuryCollections);
