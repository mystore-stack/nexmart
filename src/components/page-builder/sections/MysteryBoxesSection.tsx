"use client";

import React from "react";
import { Package, Sparkles } from "lucide-react";

interface MysteryBoxesSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function MysteryBoxesSection({ section, products = [], isLoading = false }: MysteryBoxesSectionProps) {
  const config = section.config || {};
  const content = config.content || {};
  const design = config.design || {};
  const { title = "Mystery Boxes", subtitle = "Surprise bundles with exclusive items", ctaText = "Reveal Now" } = content as any;
  const { background = "#faf5ff", radius = "16px", shadow = "md", color = "#9333ea" } = design as any;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mysteryBoxes = products.slice(0, 3);

  return (
    <section 
      className="container mx-auto px-4 py-12"
      style={{ backgroundColor: background }}
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6" style={{ color }} />
          <h2 className="text-3xl font-bold" style={{ color }}>{title}</h2>
        </div>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mysteryBoxes.length > 0 ? (
          mysteryBoxes.map((box, index) => (
            <div 
              key={box.id}
              className={`bg-white rounded-lg p-6 text-center ${shadowClass} relative overflow-hidden`}
              style={{ borderRadius: typeof radius === 'number' ? `${radius}px` : radius }}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-500/20 to-transparent w-32 h-32 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Package className="w-12 h-12" style={{ color }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{box.name || `Mystery Box ${index + 1}`}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {box.description || 'Contains 3-5 surprise items'}
                </p>
                <div className="text-2xl font-bold mb-4" style={{ color }}>
                  {box.price ? `${box.price} MAD` : 'Price not available'}
                </div>
                <button 
                  className="w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors"
                  style={{ backgroundColor: color }}
                >
                  {ctaText}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No mystery boxes available
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ✨ Each box contains guaranteed value above the purchase price
        </p>
      </div>
    </section>
  );
}
