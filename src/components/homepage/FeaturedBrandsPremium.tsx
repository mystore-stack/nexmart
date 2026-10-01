"use client";

import React from "react";
import { FeaturedBrands } from "@/components/home/CampaignSections";

const FeaturedBrandsPremium: React.FC = () => {
  return <FeaturedBrands />;
};

FeaturedBrandsPremium.displayName = "FeaturedBrandsPremium";

export default React.memo(FeaturedBrandsPremium);

