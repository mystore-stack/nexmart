"use client";

import React from "react";

interface RecommendedProductsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function RecommendedProductsSection({ section }: RecommendedProductsSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Recommended Products</h2>
        <p className="text-muted-foreground">AI-recommended for you</p>
      </div>
    </div>
  );
}
