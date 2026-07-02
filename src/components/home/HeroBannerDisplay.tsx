"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HeroBannerFormData } from "@/app/admin/hero/page";

interface HeroBannerProps extends Partial<HeroBannerFormData> {
  title: string;
  isPreview?: boolean;
  deviceType?: "desktop" | "tablet" | "mobile";
}

export function HeroBannerDisplay({
  badgeText,
  title,
  highlightedText,
  subtitle,
  description,
  desktopImageUrl,
  mobileImageUrl,
  videoUrl,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundColor,
  backgroundOverlayColor,
  overlayOpacity = 0.5,
  textColor = "white",
  primaryButtonColor = "#D4AF37",
  secondaryButtonColor = "#ffffff",
  heroHeight = "90vh",
  heroPosition = "center",
  isPreview = false,
  deviceType = "desktop",
}: HeroBannerProps) {
  const isMobile = deviceType === "mobile" || (typeof window !== "undefined" && window.innerWidth < 768);
  const imageUrl = isMobile && mobileImageUrl ? mobileImageUrl : desktopImageUrl;

  const height = isPreview 
    ? deviceType === "mobile" ? "400px" : deviceType === "tablet" ? "500px" : "600px"
    : heroHeight;

  return (
    <div 
      className="relative overflow-hidden rounded-[2rem] shadow-[0_50px_120px_rgba(0,0,0,0.5)]"
      style={{ height }}
    >
      {/* Background image */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      )}
      {/* Background color */}
      {backgroundColor && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor }}
        />
      )}
      {/* Dark navy to black gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#020c1b] to-[#000000]" />
      {/* Background overlay color */}
      {backgroundOverlayColor && (
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: backgroundOverlayColor || undefined,
            opacity: overlayOpacity
          }}
        />
      )}

      {/* Cinematic lighting effects */}
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
          textAlign: heroPosition === 'left' ? 'left' : heroPosition === 'right' ? 'right' : 'center',
          justifyContent: heroPosition === 'top' ? 'flex-start' : heroPosition === 'bottom' ? 'flex-end' : 'center'
        }}
      >
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          style={{ color: textColor || undefined }}
        >
          {/* Badge */}
          {badgeText && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 backdrop-blur-md"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                {badgeText}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1]"
          >
            <span className="block">{title}</span>
            {highlightedText && (
              <span className="block text-amber-400">{highlightedText}</span>
            )}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-lg sm:text-xl text-white/80"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* Buttons */}
          {(primaryButtonText || secondaryButtonText) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {primaryButtonText && (
                isPreview ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: primaryButtonColor || undefined,
                      color: (textColor || "white") === "white" ? "#0a192f" : "white"
                    }}
                  >
                    {primaryButtonText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={primaryButtonLink || "#"}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: primaryButtonColor || undefined,
                      color: (textColor || "white") === "white" ? "#0a192f" : "white"
                    }}
                  >
                    {primaryButtonText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )
              )}
              {secondaryButtonText && (
                isPreview ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold backdrop-blur transition-all hover:bg-white/10"
                    style={{ color: textColor || undefined }}
                  >
                    {secondaryButtonText}
                  </button>
                ) : (
                  <Link
                    href={secondaryButtonLink || "#"}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold backdrop-blur transition-all hover:bg-white/10"
                    style={{ color: textColor || undefined }}
                  >
                    {secondaryButtonText}
                  </Link>
                )
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
