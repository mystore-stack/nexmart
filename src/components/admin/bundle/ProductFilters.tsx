"use client";

import React from "react";
import { Filter, X, ChevronDown, Check } from "lucide-react";
import type { ProductFilters as ProductFiltersType } from "./types";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: string[];
  onReset: () => void;
}

export function ProductFilters({ 
  filters, 
  onChange, 
  categories, 
  brands,
  onReset 
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleCategoryChange = (categorySlug: string) => {
    onChange({
      ...filters,
      category: filters.category === categorySlug ? undefined : categorySlug,
    });
  };

  const handleBrandChange = (brand: string) => {
    onChange({
      ...filters,
      brand: filters.brand === brand ? undefined : brand,
    });
  };

  const handleInStockToggle = () => {
    onChange({
      ...filters,
      inStock: filters.inStock ? undefined : true,
    });
  };

  const handlePriceRangeChange = (field: "minPrice" | "maxPrice", value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onChange({
      ...filters,
      [field]: numValue,
    });
  };

  const hasActiveFilters = 
    filters.category || 
    filters.brand || 
    filters.inStock || 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-primary" />
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="p-4 rounded-lg border border-border bg-background space-y-4">
          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Reset all filters
            </button>
          )}

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm border transition-all
                    ${filters.category === category.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleBrandChange(brand)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm border transition-all
                      ${filters.brand === brand
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Price Range</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice ?? ""}
                  onChange={(e) => handlePriceRangeChange("minPrice", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice ?? ""}
                  onChange={(e) => handlePriceRangeChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* In Stock Filter */}
          <div>
            <button
              type="button"
              onClick={handleInStockToggle}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                ${filters.inStock
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <Check className="w-4 h-4" />
              <span className="font-medium">In Stock Only</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
