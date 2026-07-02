"use client";

import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        <div className="flex items-center gap-2">
          <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Skeleton */}
      <div className="h-64 bg-muted animate-pulse rounded-xl" />
      
      {/* Filters Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-10 bg-muted animate-pulse rounded" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted animate-pulse rounded ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
