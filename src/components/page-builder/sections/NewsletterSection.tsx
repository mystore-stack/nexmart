"use client";

import React, { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import type { SectionConfig, PageSection } from "../types";

interface NewsletterSectionProps {
  section: PageSection;
  isLoading?: boolean;
}

export function NewsletterSection({ section, isLoading = false }: NewsletterSectionProps) {
  const config = section.config as SectionConfig & {
    buttonText?: string;
    placeholder?: string;
  };
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 relative overflow-hidden bg-gray-100">
        <div className="container-main relative">
          <div className="max-w-3xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setEmail("");
  };

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
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full">
            <Mail className="w-8 h-8 text-white" />
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
            {config.title || "Subscribe to Our Newsletter"}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            {config.description || "Be the first to know about new deals and exclusive offers."}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={config.placeholder || "Enter your email"}
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                config.buttonText || "Subscribe"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
