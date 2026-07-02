import React from "react";
import { ArrowRight } from "lucide-react";
import type { SectionConfig, PageSection, ButtonConfig } from "../types";

interface PromotionalBannerSectionProps {
  section: PageSection;
}

export function PromotionalBannerSection({ section }: PromotionalBannerSectionProps) {
  const config = section.config as SectionConfig & {
    badge?: string;
    badgeBgColor?: string;
    badgeTextColor?: string;
    buttons?: ButtonConfig[];
  };

  if (!config.title && !config.subtitle) {
    return (
      <div className="py-16 px-4 bg-gray-100">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          Promotional banner content not configured
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative py-16 px-4"
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

      <div className="relative max-w-7xl mx-auto text-center">
        {config.badge && (
          <span
            className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
            style={{
              backgroundColor: config.badgeBgColor || "#ffffff",
              color: config.badgeTextColor || "#0F766E",
            }}
          >
            {config.badge}
          </span>
        )}

        <h2
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: config.textColor || "#ffffff" }}
        >
          {config.title || "Promotional Banner"}
        </h2>

        {config.subtitle && (
          <p
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: config.textColor || "#ffffff" }}
          >
            {config.subtitle}
          </p>
        )}

        {config.buttons && config.buttons.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {config.buttons.map((button: ButtonConfig, index: number) => (
              <a
                key={index}
                href={button.link || "#"}
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: button.bgColor || "#ffffff",
                  color: button.textColor || "#0F766E",
                }}
              >
                {button.text}
                {button.showArrow && <ArrowRight className="w-4 h-4 ml-2" />}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
