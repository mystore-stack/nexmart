"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface VideoBannerSectionProps {
  config: any;
}

export function VideoBannerSection({ config }: VideoBannerSectionProps) {
  // Use placeholder config if not provided
  const displayConfig = config || {
    title: "Experience Luxury Shopping",
    description: "Discover the finest collection of premium brands and exclusive products",
    image: null,
    videoUrl: null,
    ctaButtons: [
      { text: "Shop Now", link: "/products", backgroundColor: "#0D7A5E", textColor: "#ffffff" },
      { text: "Learn More", link: "/about", backgroundColor: "#C89B3C", textColor: "#ffffff" },
    ],
  };

  return (
    <section className="relative w-full overflow-hidden">
      {displayConfig.videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-[500px] object-cover"
        >
          <source src={displayConfig.videoUrl} type="video/mp4" />
        </video>
      ) : displayConfig.image ? (
        <div className="relative w-full h-[500px]">
          <Image
            src={displayConfig.image}
            alt={displayConfig.title || "Video Banner"}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        // Placeholder gradient background
        <div className="relative w-full h-[500px] bg-gradient-to-r from-[#0D7A5E] to-[#C89B3C]" />
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center text-white max-w-3xl px-4">
          {displayConfig.title && (
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{displayConfig.title}</h2>
          )}
          {displayConfig.description && (
            <p className="text-xl mb-8 opacity-90">{displayConfig.description}</p>
          )}
          {displayConfig.ctaButtons && displayConfig.ctaButtons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {displayConfig.ctaButtons.map((button: any, index: number) => (
                <Link
                  key={index}
                  href={button.link}
                  className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: button.backgroundColor || '#0D7A5E',
                    color: button.textColor || '#ffffff',
                  }}
                >
                  {button.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
