import React from "react";
import type { SectionConfig, PageSection, Brand } from "../types";

interface BrandLogosSectionProps {
  section: PageSection;
}

export function BrandLogosSection({ section }: BrandLogosSectionProps) {
  const config = section.config as SectionConfig & {
    brands?: Brand[];
    grayscale?: boolean;
    logoHeight?: string;
  };
  const brands = config.brands || [];

  if (brands.length === 0) {
    return (
      <div className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          No brands configured
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
          </div>
        )}

        <div
          className={`flex flex-wrap justify-center gap-8 ${
            config.grayscale ? "grayscale" : ""
          }`}
        >
          {brands.map((brand: Brand, index: number) => (
            <div key={index} className="flex items-center justify-center">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 w-auto object-contain"
                  style={{ maxHeight: config.logoHeight || "48px" }}
                  loading="lazy"
                />
              ) : (
                <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  {brand.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
