"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, MessageCircle } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  instagramMoments,
  LuxurySectionHeader,
} from "@/components/homepage/luxury-homepage-shared";

const InstagramGalleryPremium: React.FC = () => {
  const heroMoment = instagramMoments[0];
  const galleryMoments = instagramMoments.slice(1);

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(200,155,60,0.1),transparent_70%)] blur-3xl" />

      <div className="container-main relative">
        <LuxurySectionHeader
          eyebrow="Instagram"
          title="La communauté NexMart, en images."
          description="Un feed social curatorisé — vraie photographie premium, légendes utiles, zéro zone vide."
          actionHref="https://instagram.com"
          actionLabel="Suivre @nexmart.ma"
        />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Voir ${heroMoment.caption} sur Instagram`}
            className="group relative overflow-hidden rounded-[34px] border border-stone-200 bg-stone-100 shadow-luxury transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg"
          >
            <div className="aspect-[5/4]">
              <ImageWithFallback
                src={heroMoment.image}
                fallbackSrc="/assets/hero-fallback.svg"
                alt={heroMoment.caption}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/88 via-stone-950/18 to-transparent p-7 text-white">
              <div className="mb-4 inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0d69d]">
                Featured moment
              </div>
              <p className="max-w-lg font-display text-3xl font-semibold tracking-[-0.04em]">
                {heroMoment.caption}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/76">
                <span>{heroMoment.handle}</span>
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  {heroMoment.likes}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {heroMoment.comments}
                </span>
              </div>
            </div>
          </a>

          <div className="grid gap-6 sm:grid-cols-2">
            {galleryMoments.map((item) => (
              <a
                key={item.id}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Voir ${item.caption} sur Instagram`}
                className="group overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <ImageWithFallback
                    src={item.image}
                    fallbackSrc="/assets/hero-fallback.svg"
                    alt={item.caption}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/35 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-900 backdrop-blur">
                    Social edit
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6722]">{item.handle}</p>
                      <p className="mt-2 text-lg font-semibold leading-snug text-stone-950">{item.caption}</p>
                    </div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-900 transition group-hover:border-[#0d7a5e]/25 group-hover:text-[#0d7a5e]">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="inline-flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#c89b3c]" />
                      {item.likes}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-[#0d7a5e]" />
                      {item.comments}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-stone-200 bg-[linear-gradient(90deg,#fbf8f2_0%,#ffffff_100%)] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6722]">Community signal</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
                Chaque visuel garde la meme exigence que le reste du homepage: vraie photographie premium, captions utiles et zero zones vides.
              </p>
            </div>
            <Link
              href="https://instagram.com"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:border-[#0d7a5e]/30 hover:text-[#0d7a5e]"
            >
              <span>See more moments</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

InstagramGalleryPremium.displayName = "InstagramGalleryPremium";

export default React.memo(InstagramGalleryPremium);
