"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  buildLuxuryImage,
  heroMetrics,
  LuxuryFeatureStrip,
  homeLuxuryBenefits,
} from "@/components/homepage/luxury-homepage-shared";

const heroImage = buildLuxuryImage(
  "luxury Moroccan riad terrace at golden hour, elegant lifestyle shopping scene, premium ecommerce hero photography, warm sand and emerald tones",
  "landscape_16_9"
);

const PremiumHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-28 sm:pt-32 lg:pt-36">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(13,122,94,0.08),transparent_58%)]" />
      <div className="absolute right-0 top-24 hidden h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(200,155,60,0.12),transparent_68%)] blur-3xl lg:block" />

      <div className="container-main relative pb-16 pt-4 sm:pb-20 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/20 bg-[#c89b3c]/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6722]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Maroc · Luxe contemporain</span>
            </div>

            <h1 className="font-display text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.04em] text-stone-950 sm:text-6xl lg:text-[4.25rem]">
              L&apos;art de vivre
              <span className="mt-2 block text-[#0d7a5e]">marocain, réinventé.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-stone-600 sm:text-lg">
              Découvrez une sélection curatoriale de mode, maison et artisanat — une expérience
              ecommerce aussi raffinée qu&apos;un concept store, livrée partout au Maroc.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/collections"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-[#0d7a5e] px-7 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(13,122,94,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0b6a51]"
              >
                <span>Explorer la collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/collections/new"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-7 text-sm font-semibold text-stone-900 shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#0d7a5e]/30 hover:text-[#0d7a5e]"
              >
                <Play className="h-4 w-4" />
                <span>Nouveautés</span>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-stone-200/90 bg-white/88 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur-sm"
                >
                  <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-3xl">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -left-6 top-8 hidden h-28 w-28 rounded-full border border-[#c89b3c]/25 bg-[#c89b3c]/10 lg:block" />
            <div className="overflow-hidden rounded-[40px] border border-stone-200/90 bg-stone-100 shadow-luxury-lg">
              <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
                <div className="relative inset-0">
                  <ImageWithFallback
                    src={heroImage}
                    fallbackSrc="/assets/hero-photo.jpg"
                    alt="Collection premium NexMart Morocco"
                    className="h-full w-full object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d69d] backdrop-blur">
                    Edit printemps 2026
                  </div>
                  <p className="mt-4 max-w-sm font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
                    Des pièces choisies comme dans un riad privé.
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="absolute -bottom-6 -left-2 hidden max-w-[240px] rounded-[28px] border border-stone-200 bg-white p-5 shadow-luxury-lg sm:block lg:-left-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d7a5e]">
                Concierge
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Livraison premium, retours simplifiés et sélection responsable.
              </p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 lg:mt-16"
        >
          <LuxuryFeatureStrip items={homeLuxuryBenefits} />
        </motion.div>
      </div>
    </section>
  );
};

PremiumHero.displayName = "PremiumHero";

export default React.memo(PremiumHero);
