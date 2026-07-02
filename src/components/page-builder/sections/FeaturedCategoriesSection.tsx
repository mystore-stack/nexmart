import React from "react";
import { ArrowRight } from "lucide-react";
import type { SectionConfig, PageSection, Category } from "../types";

interface FeaturedCategoriesSectionProps {
  section: PageSection;
  categories?: any[];
}

export function FeaturedCategoriesSection({ section, categories = [] }: FeaturedCategoriesSectionProps) {
  const config = section.config as SectionConfig & {
    columns?: 2 | 3 | 4;
  };

  // Map database categories to the expected Category type
  const mappedCategories = categories.map((cat: any) => ({
    name: cat.name,
    image: cat.image,
    link: `/categories/${cat.slug}`,
  }));

  if (mappedCategories.length === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          No categories configured
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
          className={`grid gap-6 ${
            config.columns === 2
              ? "grid-cols-2"
              : config.columns === 3
              ? "grid-cols-3"
              : config.columns === 4
              ? "grid-cols-4"
              : "grid-cols-3"
          }`}
        >
          {mappedCategories.map((category: Category, index: number) => (
            <div
              key={category.link || index}
              className="group relative overflow-hidden rounded-lg cursor-pointer"
            >
              <div className="aspect-square bg-gray-100">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                <div className="flex items-center text-white/80 text-sm mt-1">
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
