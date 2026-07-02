"use client";

import React from "react";

interface BlogPostsSectionProps {
  section: any;
  products?: any[];
  isLoading?: boolean;
}

export function BlogPostsSection({ section }: BlogPostsSectionProps) {
  const config = section.config || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Blog Posts</h2>
        <p className="text-muted-foreground">Latest articles</p>
      </div>
    </div>
  );
}
