"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Removed fallback slides - CMS must be the single source of truth

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

type HeroConfig = {
  desktopWidth?: string;
  desktopHeight?: number;
  desktopMaxWidth?: number;
  desktopAspectRatio?: string;
  tabletWidth?: string;
  tabletHeight?: number;
  tabletMaxWidth?: number;
  tabletAspectRatio?: string;
  mobileWidth?: string;
  mobileHeight?: number;
  mobileMaxWidth?: number;
  mobileAspectRatio?: string;
  widthMode?: string;
  imageFit?: string;
  imagePosition?: string;
  imagePositionX?: string;
  imagePositionY?: string;
  borderRadius?: string;
};

export function HeroSection({ slides: propSlides }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({});

  // CMS must be the single source of truth - no fallback
  const slides = propSlides && propSlides.length > 0 ? propSlides : banners;

  if (!slides || slides.length === 0) return null;

  const slide = slides[current];

  // Validate slide image
  const slideImage = slide.image && typeof slide.image === "string" && slide.image.trim()
    ? slide.image
    : null;

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
    async function fetchHeroConfig() {
      try {
        const response = await fetch("/api/hero/config");
        const data = await response.json();
        if (data.success && data.data) {
          setHeroConfig(data.data);
        }
      } catch (error) {
        console.error("[HeroSection] Failed to fetch hero config:", error);
      }
    }
    fetchHeroConfig();
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  if (loading && banners.length === 0) return null;

  const imageFit = heroConfig.imageFit || 'cover';
  const imagePosition = heroConfig.imagePosition === 'custom' 
    ? `${heroConfig.imagePositionX || '50%'} ${heroConfig.imagePositionY || '50%'}`
    : heroConfig.imagePosition || 'center';

  return (
    <div
      className="hero-responsive relative w-full overflow-hidden bg-[#0a1815] shadow-lg"
      style={{
        borderRadius: heroConfig.borderRadius || '0.5rem',
        aspectRatio: heroConfig.mobileAspectRatio || '2.5/1',
        minHeight: `${heroConfig.mobileHeight || 280}px`,
        maxHeight: `${heroConfig.mobileMaxWidth || 640}px`,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style jsx global>{`
        @media (min-width: 640px) {
          .hero-responsive {
            aspect-ratio: ${heroConfig.tabletAspectRatio || '2.5/1'} !important;
            min-height: ${heroConfig.tabletHeight || 320}px !important;
            max-height: ${heroConfig.tabletMaxWidth || 1024}px !important;
          }
        }
        @media (min-width: 1024px) {
          .hero-responsive {
            aspect-ratio: ${heroConfig.desktopAspectRatio || '2.5/1'} !important;
            min-height: ${heroConfig.desktopHeight || 420}px !important;
            max-height: ${heroConfig.desktopMaxWidth || 1440}px !important;
          }
        }
      `}</style>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image 
            src={slideImage} 
            alt={slide.title || "Banner"} 
            fill 
            className="opacity-70" 
            style={{ 
              objectFit: imageFit,
              objectPosition: imagePosition
            }}
            priority 
            sizes="100vw" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f1c]/90 sm:from-[#0d1f1c] via-[#0d1f1c]/80 sm:via-[#0d1f1c]/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-center px-4 py-6 sm:px-12 lg:px-16">
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