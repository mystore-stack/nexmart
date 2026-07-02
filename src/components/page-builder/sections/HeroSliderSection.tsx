"use client";

import React from "react";

interface HeroSliderSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function HeroSliderSection({ section, products, isLoading }: HeroSliderSectionProps) {
  const config = section.config || {};
  return (
    <div className="relative w-full" style={{ height: config.height || "600px" }}>
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Hero Banner Slider</h2>
          <p className="text-muted-foreground">Configure your hero slides in the page builder</p>
        </div>
      </div>
    </div>
  );
}
