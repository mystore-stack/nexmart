"use client";

import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface SortOption {
  id: string;
  label: string;
  value: string;
}

interface ProductSortProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ProductSort({ options, value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { id: "featured", label: "Featured", value: "featured" },
  { id: "newest", label: "Newest", value: "newest" },
  { id: "price-low", label: "Price: Low to High", value: "price_asc" },
  { id: "price-high", label: "Price: High to Low", value: "price_desc" },
  { id: "rating", label: "Top Rated", value: "rating_desc" },
  { id: "popular", label: "Most Popular", value: "popular_desc" },
];
