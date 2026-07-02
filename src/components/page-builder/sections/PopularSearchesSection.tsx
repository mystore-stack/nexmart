"use client";

import React from "react";

interface PopularSearchesSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function PopularSearchesSection({ section }: PopularSearchesSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Popular Searches</h2>
        <p className="text-muted-foreground">Trending search terms</p>
      </div>
    </div>
  );
}
