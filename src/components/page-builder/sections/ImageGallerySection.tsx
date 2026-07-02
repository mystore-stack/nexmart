import React from "react";
import type { SectionConfig, PageSection, GalleryImage } from "../types";

interface ImageGallerySectionProps {
  section: PageSection;
}

export function ImageGallerySection({ section }: ImageGallerySectionProps) {
  const config = section.config as SectionConfig & {
    images?: GalleryImage[];
    columns?: 2 | 3 | 4;
  };
  const images = config.images || [];

  if (images.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          No images configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
            {config.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>
        )}

        <div
          className={`grid gap-4 ${
            config.columns === 2
              ? "grid-cols-2"
              : config.columns === 3
              ? "grid-cols-3"
              : config.columns === 4
              ? "grid-cols-4"
              : "grid-cols-3"
          }`}
        >
          {images.map((image: GalleryImage, index: number) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg cursor-pointer"
            >
              <div className="aspect-square bg-gray-100">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || "Gallery image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
