"use client";

import Link from "next/link";
import React from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  formatMad,
  LuxurySectionHeader,
  mysteryBoxes,
} from "@/components/homepage/luxury-homepage-shared";

const MysteryBoxesPremium: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Coffrets mystère"
          title="Des surprises à collectionner."
          description="Capsules cadeaux premium — imagerie riche, valeur claire, promesse d'unboxing mémorable."
          actionHref="/mystery"
          actionLabel="Tous les coffrets"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mysteryBoxes.map((box) => (
            <Link
              key={box.id}
              href={box.href}
              className="group overflow-hidden rounded-[34px] border border-[#c89b3c]/20 bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_100%)] shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <ImageWithFallback
                  src={box.image}
                  fallbackSrc="/assets/hero-fallback.svg"
                  alt={box.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute left-5 top-5 rounded-full bg-stone-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                  {box.reveal}
                </div>
              </div>
              <div className="space-y-4 p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6722]">Surprise curation</p>
                <h3 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">{box.title}</h3>
                <p className="text-sm leading-7 text-stone-600">{box.audience}</p>
                <div className="rounded-[22px] border border-stone-200 bg-white px-4 py-4 text-sm font-medium text-stone-700">
                  {box.value}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">{formatMad(box.price)}</div>
                  <div className="rounded-full bg-[#c89b3c] px-5 py-3 text-sm font-semibold text-white">Open the box</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

MysteryBoxesPremium.displayName = "MysteryBoxesPremium";

export default React.memo(MysteryBoxesPremium);
