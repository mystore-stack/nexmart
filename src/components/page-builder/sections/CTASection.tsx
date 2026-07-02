import React from "react";
import type { SectionConfig, PageSection } from "../types";

interface CTASectionProps {
  section: PageSection;
}

export function CTASection({ section }: CTASectionProps) {
  const config = section.config as SectionConfig & {
    buttonText?: string;
    link?: string;
  };

  if (!config.title && !config.description) {
    return (
      <section className="py-16 md:py-24 relative overflow-hidden bg-gray-100">
        <div className="container-main relative">
          <div className="text-center text-gray-500">
            CTA content not configured
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 md:py-24 relative overflow-hidden ${
        section.spacing === "large" ? "py-32" : section.spacing === "small" ? "py-12" : ""
      }`}
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

      <div className="container-main relative">
        <div
          className={`max-w-4xl mx-auto text-center ${
            config.textAlign === "left"
              ? "text-left"
              : config.textAlign === "right"
              ? "text-right"
              : ""
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {config.title || "Call to Action"}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {config.description || "Description goes here"}
          </p>
          <a
            href={config.link || "#"}
            className="inline-block px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
          >
            {config.buttonText || "Get Started"}
          </a>
        </div>
      </div>
    </section>
  );
}
