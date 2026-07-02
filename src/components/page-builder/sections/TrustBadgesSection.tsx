"use client";

import React from "react";

interface TrustBadgesSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function TrustBadgesSection({ section }: TrustBadgesSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Trust Badges</h2>
        <p className="text-muted-foreground">Why trust us</p>
      </div>
    </div>
  );
}
