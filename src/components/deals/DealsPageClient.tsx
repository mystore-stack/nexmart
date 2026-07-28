"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { DealsHeader } from "./DealsHeader";
import { FilterSidebar } from "./FilterSidebar";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface DealsPageClientProps {
  initialProducts: Product[];
  categories: any[];
  maxPrice: number;
}

const FILTER_GROUPS = [
  {
    id: "category",
    title: "Catégories",
    type: "checkbox" as const,
    options: [
      { id: "electronics", label: "Électronique", count: 245 },
      { id: "fashion", label: "Mode", count: 189 },
      { id: "beauty", label: "Beauté", count: 142 },
      { id: "home", label: "Maison", count: 178 },
      { id: "gaming", label: "Gaming", count: 89 },
    ],
  },
  {
    id: "discount",
    title: "Remise",
    type: "checkbox" as const,
    options: [
      { id: "50+", label: "50% ou plus", count: 156 },
      { id: "30-50", label: "30% - 50%", count: 234 },
      { id: "10-30", label: "10% - 30%", count: 567 },
    ],
  },
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
      { id: "4.5+", label: "4.5 stars & up", count: 234 },
      { id: "4+", label: "4+ stars & up", count: 567 },
      { id: "3.5+", label: "3.5+ stars & up", count: 892 },
    ],
  },
];

export function DealsPageClient({
  initialProducts,
  categories,
  maxPrice,
}: DealsPageClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  const handleFilterChange = useCallback(
    (groupId: string, value: string, checked: boolean) => {
      setSelectedFilters((prev) => {
        const group = prev[groupId] || [];
        return {
          ...prev,
          [groupId]: checked ? [...group, value] : group.filter((v) => v !== value),
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

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
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
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default: // popular
        result.sort((a, b) => b.soldCount - a.soldCount);
    }

    return result;
  }, [initialProducts, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <DealsHeader
        sortBy={sortBy}
        onSortChange={setSortBy}
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
                                selectedFilters[group.id]?.includes(
                                  option.id
                                ) || false
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
            {/* Results header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-sm text-slate-600">
                Affichage de{" "}
                <strong className="text-slate-900">
                  {Math.min(filteredAndSortedProducts.length, 24)}
                </strong>{" "}
                sur{" "}
                <strong className="text-slate-900">
                  {filteredAndSortedProducts.length}
                </strong>{" "}
                produits
              </p>
            </motion.div>

            {/* Products grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                {filteredAndSortedProducts.slice(0, 24).map((product, index) => (
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
                  Essayez d'ajuster vos filtres ou votre recherche
                </p>
              </motion.div>
            )}

            {/* Load more button */}
            {filteredAndSortedProducts.length > 24 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 px-8 py-3 font-semibold text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  Charger plus de produits
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
