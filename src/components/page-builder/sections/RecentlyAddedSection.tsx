"use client";

import React from "react";

interface RecentlyAddedSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function RecentlyAddedSection({ section }: RecentlyAddedSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Recently Added</h2>
        <p className="text-muted-foreground">New to the store</p>
      </div>
    </div>
  );
}
