"use client";

import React from "react";

interface BestSellersSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function BestSellersSection({ section }: BestSellersSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Best Sellers</h2>
        <p className="text-muted-foreground">Top-selling products</p>
      </div>
    </div>
  );
}
