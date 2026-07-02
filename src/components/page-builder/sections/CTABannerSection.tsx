import React from "react";
import { ArrowRight } from "lucide-react";
import type { SectionConfig, PageSection } from "../types";

interface CTABannerSectionProps {
  section: PageSection;
}

export function CTABannerSection({ section }: CTABannerSectionProps) {
  const config = section.config as SectionConfig & {
    buttonText?: string;
    buttonLink?: string;
  };

  if (!config.title && !config.subtitle) {
    return (
      <div className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center text-gray-500">
          CTA banner content not configured
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-16 px-4"
      style={{
        backgroundColor: section.backgroundColor || config.backgroundColor || "#0F766E",
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

      <div className="relative max-w-4xl mx-auto text-center">
        <h2
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: config.textColor || "#ffffff" }}
        >
          {config.title || "Call to Action"}
        </h2>

        {config.subtitle && (
          <p
            className="text-xl mb-8"
            style={{ color: config.textColor || "#ffffff" }}
          >
            {config.subtitle}
          </p>
        )}

        {config.buttonText && config.buttonLink && (
          <a
            href={config.buttonLink}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: config.buttonBgColor || "#ffffff",
              color: config.buttonTextColor || "#0F766E",
            }}
          >
            {config.buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        )}
      </div>
    </div>
  );
}
