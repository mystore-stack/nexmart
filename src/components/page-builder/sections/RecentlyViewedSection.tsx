"use client";

import React from "react";

interface RecentlyViewedSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function RecentlyViewedSection({ section }: RecentlyViewedSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Recently Viewed</h2>
        <p className="text-muted-foreground">Your browsing history</p>
      </div>
    </div>
  );
}
