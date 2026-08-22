"use client";

import Link from "next/link";
import React from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { featuredBrands, LuxurySectionHeader } from "@/components/homepage/luxury-homepage-shared";

type Brand = {
  id?: string;
  name: string;
  href?: string;
  story?: string;
  specialty?: string;
  metric?: string;
  image?: string;
};

interface Props {
  brands?: Brand[];
}

const FeaturedBrandsPremium: React.FC<Props> = () => {
  return (
    <section aria-label="Marques en vedette" className="bg-white py-20">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Marques"
          title="Des ateliers, pas des logos."
          description="Découvrez les maisons marocaines et leurs histoires — une galerie d'artisans et de créateurs, pas une simple liste de marques."
          actionHref="/brands"
          actionLabel="Toutes les marques"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredBrands.map((brand, index) => (
            <Link
              key={brand.id ?? brand.name}
              href={brand.href ?? "/brands"}
              className={`group overflow-hidden rounded-[34px] border border-stone-200 bg-white shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg ${
                index === 0 ? "xl:col-span-2" : ""
              }`}
            >
              <div className={`relative overflow-hidden bg-stone-100 ${index === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                <ImageWithFallback
                  src={brand.image}
                  fallbackSrc="/assets/hero-fallback.svg"
                  alt={brand.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-4 p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#0d7a5e]/12 bg-[#0d7a5e]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d7a5e]">
                    {brand.specialty}
                  </span>
                  <span className="rounded-full border border-[#c89b3c]/20 bg-[#c89b3c]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6722]">
                    {brand.metric}
                  </span>
                </div>
                <h3 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">{brand.name}</h3>
                <p className="text-sm leading-7 text-stone-600">{brand.story}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

FeaturedBrandsPremium.displayName = "FeaturedBrandsPremium";

export default React.memo(FeaturedBrandsPremium);
