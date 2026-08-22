"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Use the generated image for the fallback
const SOFA_IMAGE = "/images/hero_sofa_banner_1786917399260.jpg"; 

const FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    eyebrow: "TENDANCE",
    title: "Le meilleur de la tech & du style",
    titleAccent: "",
    subtitle: "Les nouveautés et indispensables du moment, sélectionnés pour vous.",
    cta: "Découvrir",
    href: "/products",
    image: SOFA_IMAGE,
  }
];

type HeroSectionProps = {
  slides?: Array<{
    id?: string;
    eyebrow?: string;
    badge?: string;
    title?: string;
    titleAccent?: string;
    subtitle?: string;
    cta?: string;
    ctaSecondary?: string;
    href?: string;
    hrefSecondary?: string;
    image?: string;
    stat?: string;
    statLabel?: string;
  }>;
};

export function HeroSection({ slides: propSlides }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For the exact match, we prioritize our hardcoded fallback if it's the exact mockup requirement, 
  // but we still allow CMS slides to override if they are valid.
  const slides = propSlides && propSlides.length > 0 ? propSlides : banners.length > 0 ? banners : FALLBACK_SLIDES;
  const slide = slides[current] ?? FALLBACK_SLIDES[0];
  const isUsingFallback = banners.length === 0 && (!propSlides || propSlides.length === 0);
  
  // Validate slide image
  const slideImage = slide.image && typeof slide.image === "string" && slide.image.trim() 
    ? slide.image 
    : SOFA_IMAGE;

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await fetch("/api/hero");
        const data = await response.json();
        if (data.success && data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error("[HeroSection] Failed to fetch hero banners:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  if (loading && banners.length === 0) return null;

  return (
    <div
      className="relative min-h-[380px] sm:min-h-[460px] overflow-hidden rounded-3xl bg-[#0a1815] shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image src={slideImage} alt={slide.title || "Banner"} fill className="object-cover object-center opacity-70" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f1c]/90 sm:from-[#0d1f1c] via-[#0d1f1c]/80 sm:via-[#0d1f1c]/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex min-h-[380px] sm:min-h-[460px] flex-col justify-center px-4 py-8 sm:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${slide.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            {slide.eyebrow && (
              <div className="mb-4 inline-flex items-center rounded-full bg-[#0a523b] px-2.5 py-1 text-[9px] sm:text-xs font-bold tracking-widest text-[#4ade80] uppercase">
                {slide.eyebrow}
              </div>
            )}

            <h1 className="font-display text-[28px] sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-2 sm:mb-0">
              <span className="block">{slide.title}</span>
              {slide.titleAccent && <span className="block mt-2 font-normal text-white">{slide.titleAccent}</span>}
            </h1>

            <p className="mt-2 sm:mt-6 max-w-md text-[13px] sm:text-base leading-snug sm:leading-relaxed text-slate-300">
              {slide.subtitle}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link 
                href={slide.href || "#"} 
                className="inline-flex w-fit items-center justify-center gap-1.5 rounded-full bg-[#0d7a5e] px-5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#0b6a51]"
              >
                {slide.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {slide.hrefSecondary && (
                <Link 
                  href={slide.hrefSecondary || "#"} 
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {slide.ctaSecondary}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Controls */}
        {slides.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 sm:left-4 top-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={next} className="absolute right-2 sm:right-4 top-1/2 z-20 grid h-8 w-8 sm:h-10 sm:w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60">
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 sm:h-2 rounded-full transition ${i === current ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/40"}`} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
