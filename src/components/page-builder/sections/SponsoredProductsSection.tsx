"use client";

import React from "react";

interface SponsoredProductsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function SponsoredProductsSection({ section, products = [], isLoading = false }: SponsoredProductsSectionProps) {
  const config = section.config || {};
  const content = config.content || {};
  const design = config.design || {};
  const { title = "Sponsored Products", subtitle = "Featured picks for you" } = content as any;
  const { background = "#f8f8f8", radius = "16px", shadow = "md" } = design as any;

  const shadowClass: string = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  }[shadow as string] || "shadow-md";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="container mx-auto px-4 py-12"
      style={{ backgroundColor: background }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product.id} 
              className={`bg-white rounded-lg p-4 ${shadowClass}`}
              style={{ borderRadius: typeof radius === 'number' ? `${radius}px` : radius }}
            >
              <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-brand-500 text-white text-xs px-2 py-1 rounded">
                  Sponsored
                </span>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-lg font-bold text-brand-600">
                {product.price ? `${product.price} MAD` : 'Price not available'}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No sponsored products available
          </div>
        )}
      </div>
    </section>
  );
}
