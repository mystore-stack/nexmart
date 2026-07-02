"use client";

import React from "react";

interface FooterBannerSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function FooterBannerSection({ section }: FooterBannerSectionProps) {
  const config = section.config || {};
  return (
    <div className="w-full py-16 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Footer Banner</h2>
        <p className="text-muted-foreground">Configure your footer banner</p>
      </div>
    </div>
  );
}
