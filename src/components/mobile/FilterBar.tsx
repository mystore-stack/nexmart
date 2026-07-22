"use client";
// src/components/mobile/FilterBar.tsx
import { cn } from "@/utils/cn";
import type { ProductSortOption } from "@/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Discount" },
];

interface FilterBarProps {
  sort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  inStock: boolean;
  onInStockChange: (val: boolean) => void;
  className?: string;
}

/**
 * Horizontal scroll filter/sort bar for product listing.
 */
export function FilterBar({
  sort,
  onSortChange,
  inStock,
  onInStockChange,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3",
        "border-b border-border bg-background sticky top-0 z-20",
        className
      )}
    >
      {/* In stock toggle */}
      <button
        onClick={() => onInStockChange(!inStock)}
        className={cn(
          "flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-colors",
          inStock
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:border-primary/50"
        )}
      >
        In Stock
      </button>

      {/* Sort chips */}
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSortChange(opt.value)}
          className={cn(
            "flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-colors",
            sort === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
