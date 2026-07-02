"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface CTABannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor?: string;
  gradient?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  showSparkle?: boolean;
  variant?: "primary" | "secondary" | "accent" | "gold";
}

export function CTABanner({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink,
  backgroundColor = "#0F766E",
  gradient,
  backgroundImage,
  overlayColor = "#000000",
  overlayOpacity = 0.3,
  showSparkle = true,
  variant = "primary",
}: CTABannerProps) {
  const gradients = {
    primary: "from-brand-700 to-brand-600",
    secondary: "from-slate-800 to-slate-700",
    accent: "from-moroccan-cobalt to-blue-700",
    gold: "from-gold-600 to-gold-500",
  };

  const bgStyle = gradient
    ? { background: gradient }
    : backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : { backgroundColor };

  return (
    <section className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={bgStyle}
      />
      
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />

      {/* Moroccan Pattern */}
      <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Sparkle Icon */}
          {showSparkle && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-base font-medium text-white/80 uppercase tracking-wider mb-3"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-display"
          >
            {title}
          </motion.h2>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
            >
              {description}
            </motion.p>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href={buttonLink}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-xl ${
                gradient
                  ? "bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  : `bg-gradient-to-r ${gradients[variant]}`
              }`}
            >
              {buttonText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
