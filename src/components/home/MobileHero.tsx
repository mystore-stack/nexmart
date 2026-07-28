"use client";
// src/components/home/MobileHero.tsx - Mobile-first hero component
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface MobileHeroProps {
  badge?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCTALabel?: string;
  secondaryCTAHref?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
}

export function MobileHero({
  badge = "🎯 Limited Time",
  title = "Premium Collection",
  description = "Curated products handpicked for you",
  ctaLabel = "Shop Now",
  ctaHref = "/m/products",
  secondaryCTALabel,
  secondaryCTAHref,
  backgroundImage = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80",
  overlayOpacity = 0.55,
}: MobileHeroProps) {
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Subtle background pan effect
  const backgroundVariants = {
    initial: { scale: 1 },
    animate: {
      scale: 1.02,
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-neutral-900 min-h-[70vh]">
      {/* Background image with overlay */}
      <motion.div
        className="absolute inset-0"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      >
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 430px) 100vw"
        />
        <div
          className="absolute inset-0 bg-black/40"
          style={{ opacity: overlayOpacity }}
        />
      </motion.div>

      {/* Content container */}
      <motion.div
        className="relative z-10 flex flex-col justify-end h-full px-4 py-6 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        {badge && (
          <motion.div variants={itemVariants} className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                {badge}
              </span>
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-3xl font-bold leading-tight text-white"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-sm text-neutral-200 leading-relaxed max-w-xs"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 pt-2">
          {/* Primary CTA */}
          <Link
            href={ctaHref}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary CTA */}
          {secondaryCTALabel && secondaryCTAHref && (
            <Link
              href={secondaryCTAHref}
              className="w-full py-3 px-4 border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/15 text-white/90 font-semibold rounded-xl transition-all backdrop-blur"
            >
              {secondaryCTALabel}
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-neutral-900/80 to-transparent pointer-events-none" />
    </section>
  );
}
