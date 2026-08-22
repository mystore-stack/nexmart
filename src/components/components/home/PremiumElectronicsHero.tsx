"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, ArrowRight, Play } from "lucide-react";

const TRUST_BADGES = [
  { icon: Truck, label: "Livraison express", sub: "Partout au Maroc" },
  { icon: ShieldCheck, label: "Paiement sécurisé", sub: "SSL • CMI • Stripe" },
];

interface HeroBanner {
  id: string;
  badgeText?: string;
  title: string;
  highlightedText?: string;
  subtitle?: string;
  description?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  backgroundOverlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  heroHeight?: string;
  heroPosition?: string;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
  isActive: boolean;
  publishDate?: string;
  expireDate?: string;
}

const FALLBACK_BANNER: HeroBanner = {
  id: "fallback",
  badgeText: "ÉLECTRONIQUE • CURATED",
  title: "Équipez-vous avec",
  highlightedText: "le meilleur.",
  description: "Découvrez une sélection premium des meilleurs équipements électroniques. Qualité garantie, livraison rapide partout au Maroc.",
  desktopImageUrl: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1400&q=90",
  mobileImageUrl: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=90",
  primaryButtonText: "Découvrir la tech",
  primaryButtonLink: "/products?category=electronics",
  secondaryButtonText: "Meilleures ventes",
  secondaryButtonLink: "/products?sort=bestselling",
  backgroundOverlayColor: "#0a192f",
  overlayOpacity: 0.5,
  heroHeight: "90vh",
  heroPosition: "center",
  isActive: true,
};

export function PremiumElectronicsHero() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await fetch("/api/hero");
        const data = await response.json();
        if (data.success && data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        } else {
          setBanners([FALLBACK_BANNER]);
        }
      } catch (error) {
        console.error("Failed to fetch hero banners:", error);
        setBanners([FALLBACK_BANNER]);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, banners.length]);

  // Track impression when banner is shown
  useEffect(() => {
    if (banners.length > 0 && banners[currentIndex]?.id && banners[currentIndex].id !== "fallback") {
      const sessionId = sessionStorage.getItem("sessionId") || crypto.randomUUID();
      sessionStorage.setItem("sessionId", sessionId);
      
      fetch(`/api/hero/${banners[currentIndex].id}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "impression",
          deviceType: isMobile ? "mobile" : "desktop",
          sessionId,
          landingPage: window.location.pathname,
          referrer: document.referrer,
        }),
      }).catch(console.error);
    }
  }, [currentIndex, banners, isMobile]);

  const trackClick = (type: "primaryClick" | "secondaryClick") => {
    if (banners[currentIndex]?.id && banners[currentIndex].id !== "fallback") {
      const sessionId = sessionStorage.getItem("sessionId") || crypto.randomUUID();
      
      fetch(`/api/hero/${banners[currentIndex].id}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type,
          deviceType: isMobile ? "mobile" : "desktop",
          sessionId,
          landingPage: window.location.pathname,
          referrer: document.referrer,
        }),
      }).catch(console.error);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative h-[90vh] md:h-[85vh] overflow-hidden rounded-[2rem] bg-slate-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#020c1b] to-[#000000]" />
      </div>
    );
  }

  const currentBanner = banners[currentIndex] || FALLBACK_BANNER;
  const imageUrl = isMobile && currentBanner.mobileImageUrl 
    ? currentBanner.mobileImageUrl 
    : currentBanner.desktopImageUrl;
  const heroHeight = currentBanner.heroHeight || "90vh";

  return (
    <div 
      className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_120px_rgba(0,0,0,0.5)]"
      style={{ height: heroHeight }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background image */}
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={currentBanner.title}
              fill
              className="object-cover"
              priority
            />
          )}
          {/* Background color */}
          {currentBanner.backgroundColor && (
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: currentBanner.backgroundColor }}
            />
          )}
          {/* Dark navy to black gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#020c1b] to-[#000000]" />
          {/* Background overlay color */}
          {currentBanner.backgroundOverlayColor && (
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: currentBanner.backgroundOverlayColor,
                opacity: currentBanner.overlayOpacity || 0.5
              }}
            />
          )}

          {/* Cinematic lighting effects - refined for Apple-level polish */}
          <div className="absolute top-0 left-0 w-[1000px] h-[1000px] rounded-full opacity-50"
            style={{ 
              background: "radial-gradient(circle at 30% 30%, rgba(20,184,166,0.4) 0%, rgba(20,184,166,0.1) 40%, transparent 70%)",
              filter: "blur(100px)",
              transform: "translate(-50%, -50%)"
            }} 
          />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full opacity-40"
            style={{ 
              background: "radial-gradient(circle at 70% 70%, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0.1) 40%, transparent 70%)",
              filter: "blur(80px)",
              transform: "translate(30%, 30%)"
            }} 
          />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-30"
            style={{ 
              background: "radial-gradient(circle at 50% 50%, rgba(45,212,191,0.25) 0%, transparent 60%)",
              filter: "blur(60px)",
              transform: "translate(-50%, -50%)"
            }} 
          />

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(rgba(20,184,166,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(20,184,166,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }} />

          {/* Content */}
          <div 
            className="relative z-10 grid h-full items-center gap-8 px-5 py-8 sm:px-8 md:px-10 lg:grid-cols-[1fr_1fr] lg:px-16 lg:py-16"
            style={{ 
              textAlign: currentBanner.heroPosition === 'left' ? 'left' : currentBanner.heroPosition === 'right' ? 'right' : 'center',
              justifyContent: currentBanner.heroPosition === 'top' ? 'flex-start' : currentBanner.heroPosition === 'bottom' ? 'flex-end' : 'center'
            }}
          >
            {/* Left: Content - centered on mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
              style={{ color: currentBanner.textColor || 'white' }}
            >
              {/* Luxury badge */}
              {currentBanner.badgeText && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 backdrop-blur-md"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                    {currentBanner.badgeText}
                  </span>
                </motion.div>
              )}

              {/* Hero title with elegant serif typography */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1]"
              >
                <span className="block">{currentBanner.title}</span>
                {currentBanner.highlightedText && (
                  <span className="block" style={{ 
                    background: "linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>
                    {currentBanner.highlightedText}
                  </span>
                )}
                {currentBanner.subtitle && (
                  <span className="block text-lg sm:text-xl md:text-2xl mt-2 opacity-80">
                    {currentBanner.subtitle}
                  </span>
                )}
              </motion.h1>

              {/* Gold accent line */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "60px" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="my-6 h-px bg-gradient-to-r from-amber-400 to-transparent mx-auto lg:mx-0"
              />

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl leading-relaxed opacity-80 px-4 lg:px-0"
              >
                {currentBanner.description || "Découvrez une sélection premium des meilleurs équipements électroniques. Qualité garantie, livraison rapide partout au Maroc."}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center justify-center lg:justify-start"
              >
                {currentBanner.primaryButtonText && currentBanner.primaryButtonLink && (
                  <Link 
                    href={currentBanner.primaryButtonLink}
                    onClick={() => trackClick("primaryClick")}
                    className="group relative inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl px-6 sm:px-8 font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50 hover:scale-105"
                    style={{ 
                      background: currentBanner.primaryButtonColor || 'linear-gradient(to right, #14b8a6, #0d9488)'
                    }}
                  >
                    <span className="relative z-10 text-sm sm:text-base">{currentBanner.primaryButtonText}</span>
                    <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-500 opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
                  </Link>
                )}
                {currentBanner.secondaryButtonText && currentBanner.secondaryButtonLink && (
                  <Link 
                    href={currentBanner.secondaryButtonLink}
                    onClick={() => trackClick("secondaryClick")}
                    className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/5 px-6 sm:px-8 font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30 text-sm sm:text-base"
                    style={{ 
                      borderColor: currentBanner.secondaryButtonColor || 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {currentBanner.secondaryButtonText}
                  </Link>
                )}
              </motion.div>

              {/* Trust badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start"
              >
                {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <div className="text-xs">
                      <div className="font-medium text-white/90">{label}</div>
                      <div className="text-white/60">{sub}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation */}
      {banners.length > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="absolute bottom-6 right-6 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all z-20"
            title={autoPlay ? "Pause" : "Play"}
          >
            {autoPlay ? <Play className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </>
      )}
    </div>
  );
}
