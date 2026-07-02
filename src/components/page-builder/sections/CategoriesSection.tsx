"use client";

import React from "react";

interface CategoriesSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function CategoriesSection({ section }: CategoriesSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Categories Grid</h2>
        <p className="text-muted-foreground">Configure categories in the page builder</p>
      </div>
    </div>
  );
}
