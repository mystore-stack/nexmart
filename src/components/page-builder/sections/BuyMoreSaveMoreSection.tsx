"use client";

import React from "react";
import { ShoppingBag, TrendingUp } from "lucide-react";

interface BuyMoreSaveMoreSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function BuyMoreSaveMoreSection({ section, products = [], isLoading = false }: BuyMoreSaveMoreSectionProps) {
  const config = section.config || {};
  const content = config.content || {};
  const design = config.design || {};
  const { title = "Buy More Save More", subtitle = "Volume discounts", tiers = [] } = content as any;
  const { background = "#f0fdf4", radius = "16px", shadow = "md", color = "#16a34a" } = design as any;

  const shadowClass: string = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  }[shadow as string] || "shadow-md";

  const defaultTiers = tiers.length > 0 ? tiers : [
    { min: 2, discount: 10 },
    { min: 3, discount: 15 },
    { min: 5, discount: 20 },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6" style={{ color }} />
          <h2 className="text-3xl font-bold" style={{ color }}>{title}</h2>
        </div>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {defaultTiers.map((tier, index) => (
          <div 
            key={index}
            className={`bg-white rounded-lg p-6 text-center ${shadowClass}`}
            style={{ 
              borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
              border: index === defaultTiers.length - 1 ? `3px solid ${color}` : '2px solid #e5e7eb'
            }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color }}>
              {tier.discount}%
            </div>
            <div className="text-lg font-semibold mb-2">OFF</div>
            <div className="text-muted-foreground">
              Buy {tier.min}+ items
            </div>
            {index === defaultTiers.length - 1 && (
              <div className="mt-2 text-sm font-semibold" style={{ color }}>
                Best Value
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Add more items to your cart to unlock higher discounts
        </p>
        <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
          <ShoppingBag className="w-5 h-5" style={{ color }} />
          <span className="font-semibold">Current Cart: 0 items</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold" style={{ color }}>0% discount</span>
        </div>
      </div>
    </section>
  );
}
