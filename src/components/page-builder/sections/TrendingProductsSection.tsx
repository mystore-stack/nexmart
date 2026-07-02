"use client";

import React from "react";

interface TrendingProductsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function TrendingProductsSection({ section }: TrendingProductsSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Trending Products</h2>
        <p className="text-muted-foreground">Currently trending</p>
      </div>
    </div>
  );
}
