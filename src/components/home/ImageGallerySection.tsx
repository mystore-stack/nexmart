"use client";

import React, { useState, useEffect } from "react";
import type { ImageGalleryConfig } from "@/lib/cms/schemas/image-gallery";

interface ImageGallerySectionProps {
  config?: ImageGalleryConfig;
}

export function ImageGallerySection({ config }: ImageGallerySectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll for carousel
  useEffect(() => {
    if (
      config?.layout === "carousel" &&
      config.settings.autoScroll &&
      config.images.length > 1
    ) {
      const interval = setInterval(() => {
        const visibleCount = config.settings.visibleCount || 4;
        const maxIndex = Math.max(0, config.images.length - visibleCount);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, config.settings.autoScrollInterval || 3000);
      return () => clearInterval(interval);
    }
  }, [config]);

  if (!config || !config.enabled || config.images.length === 0) {
    return null;
  }

  const enabledImages = config.images.filter((img) => img.enabled);
  if (enabledImages.length === 0) {
    return null;
  }

  const sectionStyle = {
    backgroundColor: config.settings.sectionBackground || "#FFFFFF",
    padding: config.settings.spacing || 12,
  };

  const imageStyle = {
    borderRadius: `${config.settings.borderRadius || 12}px`,
    objectFit: config.settings.imageFit || "cover" as "cover" | "contain" | "auto",
  };

  const containerStyle = {
    gap: `${config.settings.spacing || 12}px`,
  };

  if (config.layout === "grid") {
    return (
      <div style={sectionStyle} className="rounded-xl">
        <div
          className="grid"
          style={{
            ...containerStyle,
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          }}
        >
          {enabledImages.map((image) => (
            <div key={image.id} className="aspect-square overflow-hidden">
              <img
                src={image.imageUrl}
                alt={image.altText || ""}
                className="w-full h-full"
                style={imageStyle}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Carousel layout
  const visibleCount = config.settings.visibleCount || 4;
  const visibleImages = enabledImages.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  // If we have fewer images than visibleCount, wrap around
  if (visibleImages.length < visibleCount && enabledImages.length > 0) {
    const remaining = visibleCount - visibleImages.length;
    for (let i = 0; i < remaining; i++) {
      visibleImages.push(enabledImages[i % enabledImages.length]);
    }
  }

  return (
    <div style={sectionStyle} className="rounded-xl">
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
        {visibleImages.map((image, idx) => (
          <div
            key={`${image.id}-${idx}`}
            className="flex-shrink-0 aspect-[4/3] overflow-hidden snap-start"
            style={{
              ...imageStyle,
              width: `calc(${100 / visibleCount}% - ${config.settings.spacing || 12}px)`,
            }}
          >
            <img
              src={image.imageUrl}
              alt={image.altText || ""}
              className="w-full h-full"
              style={imageStyle}
            />
          </div>
        ))}
      </div>

      {/* Carousel indicators */}
      {enabledImages.length > visibleCount && (
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({
            length: Math.ceil(enabledImages.length / visibleCount),
          }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * visibleCount)}
              className={`h-1 rounded-full transition-all ${
                Math.floor(currentIndex / visibleCount) === idx
                  ? "w-3 bg-primary"
                  : "w-1 bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
