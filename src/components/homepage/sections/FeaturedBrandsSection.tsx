"use client";

import React from "react";
import { FeaturedBrands } from "@/components/home/CampaignSections";

interface FeaturedBrandsSectionProps {
  config?: any;
  brands?: any[];
}

export function FeaturedBrandsSection({ config = {}, brands = [] }: FeaturedBrandsSectionProps) {
  return <FeaturedBrands config={config} brands={brands} />;
}

