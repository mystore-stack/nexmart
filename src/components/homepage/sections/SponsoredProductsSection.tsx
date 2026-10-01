"use client";

import React from "react";
import { SponsoredProductsSection as NewSponsoredProductsSection } from "@/components/home/SponsoredProductsSection";

interface SponsoredProductsSectionProps {
  config: any;
  products?: any[];
}

export function SponsoredProductsSection({ config = {}, products = [] }: SponsoredProductsSectionProps) {
  return <NewSponsoredProductsSection config={config} products={products} />;
}

