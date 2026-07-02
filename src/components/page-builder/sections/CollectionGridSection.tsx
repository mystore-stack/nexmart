"use client";

import React from "react";

interface CollectionGridSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function CollectionGridSection({ section }: CollectionGridSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Collection Grid</h2>
        <p className="text-muted-foreground">Product collections</p>
      </div>
    </div>
  );
}
