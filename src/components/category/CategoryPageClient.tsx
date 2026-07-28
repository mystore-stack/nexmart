"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { CategoryHeader } from "./CategoryHeader";
import { FilterSidebar } from "@/components/deals/FilterSidebar";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowUpDown, Grid, List } from "lucide-react";
import type { Product } from "@/types";

interface CategoryPageClientProps {
  categoryName: string;
  categoryDescription?: string;
  categoryImage?: string;
  initialProducts: Product[];
  maxPrice: number;
}

const SORT_OPTIONS = [
  { value: "popular", label: "Populaire" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "newest", label: "Nouveautés" },
  { value: "rating", label: "Mieux noté" },
  { value: "discount", label: "Plus de remise" },
];

const FILTER_GROUPS = [
  {
    id: "price",
    title: "Prix",
    type: "range" as const,
    min: 0,
    max: 10000,
  },
  {
    id: "rating",
    title: "Note",
    type: "checkbox" as const,
    options: [
      { id: "4.5+", label: "4.5+ étoiles", count: 234 },
      { id: "4+", label: "4+ étoiles", count: 567 },
      { id: "3.5+", label: "3.5+ étoiles", count: 892 },
    ],
  },
  {
    id: "availability",
    title: "Disponibilité",
    type: "checkbox" as const,
    options: [
      { id: "in-stock", label: "En stock", count: 1234 },
      { id: "pre-order", label: "Pré-commande", count: 89 },
    ],
  },
];

export function CategoryPageClient({
  categoryName,
  categoryDescription,
  categoryImage,
  initialProducts,
  maxPrice,
}: CategoryPageClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  const handleFilterChange = useCallback(
    (groupId: string, value: string, checked: boolean) => {
      setSelectedFilters((prev) => {
        const group = prev[groupId] || [];
        return {
          ...prev,
          [groupId]: checked
            ? [...group, value]
            : group.filter((v) => v !== value),
        };
      });
    },
    []
  );

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Apply price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply rating filter
    if (selectedFilters.rating?.length) {
      result = result.filter((p) => {
        if (selectedFilters.rating?.includes("4.5+")) return p.rating >= 4.5;
        if (selectedFilters.rating?.includes("4+")) return p.rating >= 4;
        if (selectedFilters.rating?.includes("3.5+")) return p.rating >= 3.5;
        return true;
      });
    }

    // Apply availability filter
    if (selectedFilters.availability?.length) {
      result = result.filter((p) => {
        if (selectedFilters.availability?.includes("in-stock")) return p.stock > 0;
        if (selectedFilters.availability?.includes("pre-order")) return p.stock === 0;
        return true;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "discount":
        result.sort((a, b) => {
          const discountA = a.comparePrice
            ? ((a.comparePrice - a.price) / a.comparePrice) * 100
            : 0;
          const discountB = b.comparePrice
            ? ((b.comparePrice - b.price) / b.comparePrice) * 100
            : 0;
          return discountB - discountA;
        });
        break;
      default: // popular
        result.sort((a, b) => b.soldCount - a.soldCount);
    }

    return result;
  }, [initialProducts, sortBy, priceRange, selectedFilters]);

  const columnsClass =
    viewMode === "grid"
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <CategoryHeader
        name={categoryName}
        description={categoryDescription}
        image={categoryImage}
        productCount={initialProducts.length}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
      />

      <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-24 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <h3 className="text-lg font-bold text-slate-900">Filtres</h3>
              <div className="space-y-4 divide-y divide-slate-200">
                {FILTER_GROUPS.map((group) => (
                  <div key={group.id} className="pt-4 first:pt-0">
                    <h4 className="mb-3 font-semibold text-slate-900">
                      {group.title}
                    </h4>
                    {group.type === "checkbox" && (
                      <div className="space-y-2">
                        {group.options?.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedFilters[group.id]?.includes(option.id) ||
                                false
                              }
                              onChange={(e) =>
                                handleFilterChange(
                                  group.id,
                                  option.id,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700">
                              {option.label}
                            </span>
                            {option.count !== undefined && (
                              <span className="ml-auto text-xs text-slate-500">
                                ({option.count})
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={FILTER_GROUPS}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onPriceChange={setPriceRange}
          />

          {/* Products Grid */}
          <div className="lg:col-span-4">
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between gap-4 flex-wrap"
            >
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Results count */}
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">
                  {filteredAndSortedProducts.length}
                </strong>{" "}
                produits
              </p>

              {/* View mode toggle */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Products grid/list */}
            {filteredAndSortedProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className={`grid ${columnsClass} gap-3 sm:gap-4`}
              >
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center"
              >
                <p className="mb-2 text-lg font-semibold text-slate-900">
                  Aucun produit trouvé
                </p>
                <p className="text-sm text-slate-600">
                  Essayez d'ajuster vos filtres
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
