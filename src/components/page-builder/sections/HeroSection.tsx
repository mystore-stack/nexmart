import React from "react";
import { Loader2 } from "lucide-react";
import type { HeroSectionConfig, PageSection } from "../types";

interface HeroSectionProps {
  section: PageSection;
  isLoading?: boolean;
}

export function HeroSection({ section, isLoading = false }: HeroSectionProps) {
  const config = section.config as HeroSectionConfig;

  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-gray-100 min-h-[500px]">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (!config.title && !config.subtitle) {
    return (
      <section className="relative overflow-hidden bg-gray-100 min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Hero section content not configured</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: section.backgroundColor || config.backgroundColor,
        backgroundImage: section.backgroundImage || config.backgroundImage
          ? `url(${section.backgroundImage || config.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {(section.overlayColor || config.overlayColor) &&
        ((section.overlayOpacity || config.overlayOpacity) || 0) > 0 && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: section.overlayColor || config.overlayColor,
              opacity: section.overlayOpacity || config.overlayOpacity,
            }}
          />
        )}

      <div
        className={`container-main py-20 md:py-28 relative ${
          section.spacing === "large" || config.spacing === "large"
            ? "py-32"
            : section.spacing === "small" || config.spacing === "small"
            ? "py-12"
            : ""
        }`}
      >
        <div
          className={`max-w-4xl mx-auto text-center ${
            config.textAlign === "left"
              ? "text-left"
              : config.textAlign === "right"
              ? "text-right"
              : ""
          }`}
        >
          {config.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              {config.badge}
            </div>
          )}

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            {config.title || "Hero Title"}
          </h1>

          <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
            {config.subtitle || "Hero subtitle goes here"}
          </p>

          <div className="flex gap-4 justify-center">
            {config.primaryCta && (
              <a
                href={config.primaryCtaLink || "#"}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
              >
                {config.primaryCta}
              </a>
            )}
            {config.secondaryCta && (
              <a
                href={config.secondaryCtaLink || "#"}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                {config.secondaryCta}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
