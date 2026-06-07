"use client";
// src/components/home/HeroSection.tsx - Premium Moroccan Luxury Hero
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Star, Truck, Sparkles } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    eyebrow: "Collection Exclusive",
    title: "L'art du shopping",
    titleAccent: "marocain.",
    subtitle: "Découvrez une sélection premium de produits authentiques, recommandés par notre intelligence artificielle adaptée à votre style.",
    cta: "Explorer la boutique",
    ctaSecondary: "Voir les offres",
    href: "/products?sort=recommended",
    hrefSecondary: "/deals",
    badge: "IA · Boutique Live",
    stat: "2.4M+",
    statLabel: "clients satisfaits",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=90",
    accent: "#0F766E",
  },
  {
    id: 2,
    eyebrow: "Technologie Premium",
    title: "Équipez-vous avec",
    titleAccent: "le meilleur.",
    subtitle: "Comparez les specs, lisez les avis et trouvez les meilleures offres tech du marché marocain en un seul endroit élégant.",
    cta: "Découvrir la tech",
    ctaSecondary: "Meilleures ventes",
    href: "/products?category=electronics",
    hrefSecondary: "/products?sort=bestselling",
    badge: "Électronique · Curated",
    stat: "18%",
    statLabel: "d'économies moyennes",
    image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1400&q=90",
    accent: "#1255A0",
  },
  {
    id: 3,
    eyebrow: "Mode & Lifestyle",
    title: "La nouvelle saison,",
    titleAccent: "sublimée.",
    subtitle: "Mode, maison, beauté — découvrez des collections triées par nos experts pour refléter l'élégance marocaine contemporaine.",
    cta: "Voir la collection",
    ctaSecondary: "Nouveautés",
    href: "/products?category=fashion",
    hrefSecondary: "/new-arrivals",
    badge: "Tendances · Now",
    stat: "4.9★",
    statLabel: "note acheteurs",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=90",
    accent: "#C25B33",
  },
];

const TRUST = [
  { icon: Truck, label: "Livraison express", sub: "Partout au Maroc" },
  { icon: ShieldCheck, label: "Paiement sécurisé", sub: "SSL · CMI · Stripe" },
  { icon: Star, label: "Marques certifiées", sub: "Qualité garantie" },
];

// Floating Moroccan geometric shapes
function MoroccanFloating({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 8 L112 60 L60 112 L8 60 Z" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" fill="none" />
      <path d="M60 20 L100 60 L60 100 L20 60 Z" stroke="rgba(212,175,55,0.35)" strokeWidth="1" fill="none" />
      <path d="M60 36 L84 60 L60 84 L36 60 Z" stroke="rgba(212,175,55,0.25)" strokeWidth="1" fill="none" />
      <circle cx="60" cy="60" r="8" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="60" r="3" fill="rgba(212,175,55,0.7)" />
      <path d="M60 8 L60 20 M112 60 L100 60 M60 112 L60 100 M8 60 L20 60" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
    </svg>
  );
}

function MoroccanStar({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 5 L47 28 L70 28 L51 42 L58 65 L40 51 L22 65 L29 42 L10 28 L33 28 Z" stroke="rgba(212,175,55,0.4)" strokeWidth="1" fill="rgba(212,175,55,0.06)" />
      <circle cx="40" cy="40" r="15" stroke="rgba(212,175,55,0.3)" strokeWidth="1" fill="none" strokeDasharray="4 3" />
    </svg>
  );
}

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[current];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  return (
    <div
      className="relative min-h-[600px] overflow-hidden rounded-[2rem] shadow-[0_40px_100px_rgba(15,23,42,0.22)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #0a2a26 50%, #0F172A 100%)" }}
    >
      {/* Moroccan pattern overlay */}
      <div className="absolute inset-0 moroccan-pattern-bg opacity-25" />

      {/* Radial glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.5) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />

      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.85 }}
          className="absolute inset-0"
        >
          <Image src={slide.image} alt="" fill className="object-cover opacity-30" priority sizes="100vw" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(90deg, rgba(10,15,28,0.98) 0%, rgba(10,15,28,0.75) 55%, rgba(10,15,28,0.3) 100%)"
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Floating decorative shapes */}
      <motion.div
        className="absolute top-12 right-16 w-24 h-24 opacity-60 hidden lg:block float"
        style={{ animationDelay: "0s" }}
      >
        <MoroccanFloating />
      </motion.div>
      <motion.div
        className="absolute bottom-16 right-48 w-16 h-16 opacity-40 hidden lg:block float-delayed"
        style={{ animationDelay: "1.5s" }}
      >
        <MoroccanStar />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-8 w-10 h-10 opacity-30 hidden xl:block float"
        style={{ animationDelay: "3s" }}
      >
        <MoroccanFloating />
      </motion.div>

      {/* Gold horizontal accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

      {/* Main Content Grid */}
      <div className="relative z-10 grid min-h-[600px] items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-14">

        {/* Left: Copy */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${slide.id}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-2 backdrop-blur"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold-300">
                {slide.badge}
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-5xl font-light leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              <span className="block text-white/95">{slide.title}</span>
              <span className="block" style={{ background: "linear-gradient(135deg, #D4AF37 0%, #f0d060 50%, #D4AF37 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {slide.titleAccent}
              </span>
            </h1>

            {/* Gold divider */}
            <div className="my-6 h-px w-16 bg-gradient-to-r from-gold-400 to-transparent" />

            <p className="max-w-lg text-base leading-7 text-white/65 sm:text-[1.05rem]">
              {slide.subtitle}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={slide.href} className="btn btn-primary btn-lg group font-display text-[1rem] tracking-wide">
                {slide.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </Link>
              <Link href={slide.hrefSecondary} className="btn h-[52px] px-6 border border-white/20 bg-white/8 text-white/90 rounded-2xl backdrop-blur hover:bg-white/15 hover:border-white/30 transition-all font-medium">
                {slide.ctaSecondary}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/7 px-3.5 py-2.5 backdrop-blur">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700/40">
                    <Icon className="h-4 w-4 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/90">{label}</p>
                    <p className="text-[10px] text-white/50">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: Product Preview Card */}
        <div className="hidden lg:flex justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${slide.id}`}
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: 30, rotate: -1 }}
              transition={{ duration: 0.52, ease: "easeOut" }}
              className="w-full max-w-sm"
            >
              {/* Main image card */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-gold-400/20 bg-white/8 shadow-2xl backdrop-blur-xl"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.15)" }}>

                {/* Moroccan arch top decoration */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />

                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={slide.image} alt="" fill className="object-cover" priority sizes="(max-width: 640px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Floating stat badge */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 left-4 rounded-2xl border border-gold-400/30 bg-black/50 px-4 py-3 backdrop-blur-xl"
                >
                  <p className="text-xs font-bold text-gold-300/80 uppercase tracking-wide">Confiance</p>
                  <p className="text-2xl font-display font-semibold text-white">{slide.stat}</p>
                  <p className="text-xs text-white/55">{slide.statLabel}</p>
                </motion.div>

                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-black/40 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-gold-400 fill-gold-400" />
                      ))}
                    </div>
                    <span className="text-xs text-white/70">Recommandé par l&apos;IA</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{slide.eyebrow}</p>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400/20">
                      <Sparkles className="h-3.5 w-3.5 text-gold-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Small floating accent card */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="mt-3 ml-8 rounded-2xl border border-gold-400/20 bg-white/8 px-5 py-3.5 backdrop-blur-xl"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.1)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700/60">
                    <Truck className="h-4 w-4 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/90">Livraison express</p>
                    <p className="text-[10px] text-white/50">Casablanca · 24h</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur transition-all hover:bg-white/16 hover:border-gold-400/30"
        aria-label="Précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur transition-all hover:bg-white/16 hover:border-gold-400/30"
        aria-label="Suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-gold-400" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
    </div>
  );
}
