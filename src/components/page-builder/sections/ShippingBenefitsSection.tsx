"use client";

import React from "react";

interface ShippingBenefitsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function ShippingBenefitsSection({ section }: ShippingBenefitsSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Shipping Benefits</h2>
        <p className="text-muted-foreground">Fast and reliable shipping</p>
      </div>
    </div>
  );
}
