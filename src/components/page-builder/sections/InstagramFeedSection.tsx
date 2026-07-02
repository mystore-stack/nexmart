"use client";

import React from "react";

interface InstagramFeedSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function InstagramFeedSection({ section }: InstagramFeedSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Instagram Feed</h2>
        <p className="text-muted-foreground">Follow us on Instagram</p>
      </div>
    </div>
  );
}
