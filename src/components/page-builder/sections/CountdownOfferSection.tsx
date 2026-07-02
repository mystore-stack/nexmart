"use client";

import React from "react";

interface CountdownOfferSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function CountdownOfferSection({ section }: CountdownOfferSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Countdown Offer</h2>
        <p className="text-muted-foreground">Limited time offer</p>
      </div>
    </div>
  );
}
