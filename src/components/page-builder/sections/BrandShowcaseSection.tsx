"use client";

import React from "react";

interface BrandShowcaseSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function BrandShowcaseSection({ section }: BrandShowcaseSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Brand Showcase</h2>
        <p className="text-muted-foreground">Featured brands</p>
      </div>
    </div>
  );
}
