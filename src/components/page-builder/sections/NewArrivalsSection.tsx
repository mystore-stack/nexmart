"use client";

import React from "react";

interface NewArrivalsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function NewArrivalsSection({ section }: NewArrivalsSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">New Arrivals</h2>
        <p className="text-muted-foreground">Latest products</p>
      </div>
    </div>
  );
}
