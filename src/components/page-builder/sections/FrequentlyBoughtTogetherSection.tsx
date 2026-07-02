"use client";

import React from "react";
import { Package, Plus } from "lucide-react";

interface FrequentlyBoughtTogetherSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function FrequentlyBoughtTogetherSection({ section, products = [], isLoading = false }: FrequentlyBoughtTogetherSectionProps) {
  const config = section.config || {};
  const content = config.content || {};
  const design = config.design || {};
  const { title = "Frequently Bought Together", subtitle = "Complete your purchase", ctaText = "Add All to Cart" } = content as any;
  const { background = "#f0f9ff", radius = "16px", shadow = "md", color = "#0ea5e9" } = design as any;

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
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48 flex-1"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const bundleProducts = products.slice(0, 4);
  const totalPrice = bundleProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  const bundlePrice = totalPrice * 0.9; // 10% discount

  return (
    <section 
      className="container mx-auto px-4 py-12"
      style={{ backgroundColor: background }}
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="w-6 h-6" style={{ color }} />
          <h2 className="text-3xl font-bold" style={{ color }}>{title}</h2>
        </div>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {bundleProducts.length > 0 ? (
          bundleProducts.map((product, index) => (
            <React.Fragment key={product.id}>
              <div 
                className={`bg-white rounded-lg p-4 flex-shrink-0 w-64 ${shadowClass}`}
                style={{ borderRadius: typeof radius === 'number' ? `${radius}px` : radius }}
              >
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
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
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold" style={{ color }}>
                  {product.price ? `${product.price} MAD` : 'Price not available'}
                </p>
              </div>
              {index < bundleProducts.length - 1 && (
                <Plus className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="w-full text-center py-12 text-muted-foreground">
            No bundle products available
          </div>
        )}
      </div>

      {bundleProducts.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-400 line-through text-lg">{totalPrice.toFixed(2)} MAD</span>
              <span className="text-3xl font-bold" style={{ color }}>{bundlePrice.toFixed(2)} MAD</span>
              <span className="bg-green-500 text-white text-sm px-2 py-1 rounded">Save 10%</span>
            </div>
            <button 
              className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors"
              style={{ backgroundColor: color }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
