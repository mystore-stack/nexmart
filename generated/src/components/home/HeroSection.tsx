"use client";
// src/components/home/HeroSection.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "The Future of Shopping",
    subtitle: "Discover millions of products at unbeatable prices",
    cta: "Shop Now",
    href: "/products",
    badge: "New Season",
    bg: "from-slate-900 via-slate-800 to-slate-900",
    accent: "text-brand-400",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    id: 2,
    title: "Premium Electronics",
    subtitle: "Cutting-edge tech at prices you&apos;ll love",
    cta: "Explore Tech",
    href: "/products?category=electronics",
    badge: "Up to 40% Off",
    bg: "from-blue-950 via-blue-900 to-slate-900",
    accent: "text-blue-400",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  },
  {
    id: 3,
    title: "Summer Collection",
    subtitle: "Fresh styles for the season ahead",
    cta: "View Collection",
    href: "/products?category=fashion",
    badge: "New Arrivals",
    bg: "from-rose-950 via-rose-900 to-slate-900",
    accent: "text-rose-400",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);
  const slide = SLIDES[current];

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} transition-all duration-700`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ minHeight: "520px" }}
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
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover opacity-20"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container-main py-16 md:py-24 lg:py-32 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-white"
            >
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-6 bg-white/10 ${slide.accent} border border-white/10`}
              >
                {slide.badge}
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-display">
                {slide.title}
              </h1>
              <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-2 bg-white text-foreground px-7 py-3.5 rounded-xl font-bold hover:bg-white/90 transition-all hover:gap-3 group"
                >
                  {slide.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
Today&apos;s Deals
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/50">
                {["Free Shipping $50+", "Easy Returns", "24/7 Support", "Secure Checkout"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right side image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${slide.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block relative h-80 xl:h-96"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
