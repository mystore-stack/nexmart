"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  gradient?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
}

export function PageHero({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundColor = "#0F766E",
  gradient,
  overlayColor = "#000000",
  overlayOpacity = 0.4,
  showBreadcrumb = true,
  breadcrumbItems,
}: PageHeroProps) {
  const backgroundStyle = gradient
    ? { background: gradient }
    : backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : { backgroundColor };

  return (
    <section className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={backgroundStyle}
      />
      
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />

      {/* Moroccan Pattern Overlay */}
      <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Breadcrumb */}
          {showBreadcrumb && breadcrumbItems && breadcrumbItems.length > 0 && (
            <nav className="flex items-center justify-center gap-2 text-sm text-white/80 mb-6">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-white">{item.label}</span>
                  )}
                  {index < breadcrumbItems.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-display">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
