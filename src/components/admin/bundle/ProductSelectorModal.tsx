"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Package, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { ProductSearch } from "./ProductSearch";
import { ProductFilters } from "./ProductFilters";
import type { Product, ProductFilters as ProductFiltersType, ProductSelectorProps } from "./types";

export function ProductSelectorModal({
  isOpen,
  onClose,
  onProductsSelected,
  selectedProductIds,
  maxSelections,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Record<string, Product>>({});
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 12,
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("q", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
      if (filters.inStock) params.set("inStock", "true");
      params.set("page", (filters.page || 1).toString());
      params.set("limit", (filters.limit || 12).toString());

      const url = `/api/admin/products?${params.toString()}`;
      console.log("[BundleProductSelector] Request URL:", url);

      const response = await fetch(url, {
        credentials: "include",
      });
      console.log("[BundleProductSelector] Status:", response.status, response.statusText);
      console.log("[BundleProductSelector] Headers:", Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log("[BundleProductSelector] JSON response:", data);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products from ${url}. HTTP ${response.status} ${response.statusText}. ${data?.error || ""}`.trim()
        );
      }

      if (data.success) {
        const fetchedProducts = (Array.isArray(data.products) ? data.products : []) as Product[];
        setProducts(fetchedProducts);
        setPagination((data.pagination || pagination) as typeof pagination);

        if (fetchedProducts.length === 0) {
          const total = data.pagination?.total ?? 0;
          setError(
            total === 0
              ? "No products found for these filters. If this selector is limited to published products, publish products first."
              : "This page returned no products. Try another page or reset filters."
          );
        }
        
        // Extract unique categories and brands from products
        const uniqueCategories = Array.from(
          new Map(
            fetchedProducts
              .filter((p: Product) => p.category)
              .map((p: Product) => [p.category!.id, p.category!])
          ).values()
        );
        setCategories(uniqueCategories);
        
        const uniqueBrands = Array.from(
          new Set(
            fetchedProducts
              .filter((p: Product) => p.brand)
              .map((p: Product) => p.brand!)
          )
        ) as string[];
        setBrands(uniqueBrands);
      } else {
        setError(data.error || "API returned success=false while fetching products");
      }
    } catch (err) {
      console.error("[BundleProductSelector] Fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch products when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts]);

  // Reset selection when modal opens - fetch selected products
  useEffect(() => {
    if (isOpen && selectedProductIds.length > 0) {
      // Fetch the full product objects for selected IDs
      const fetchSelectedProducts = async () => {
        try {
          const idsParam = selectedProductIds.join(',');
          const response = await fetch(`/api/admin/products?ids=${idsParam}`, {
            credentials: "include",
          });
          const data = await response.json();
          if (data.success && data.products) {
            const selectionMap: Record<string, Product> = {};
            data.products.forEach((p: Product) => {
              selectionMap[p.id] = p;
            });
            setCurrentSelection(selectionMap);
          }
        } catch (err) {
          console.error("[ProductSelectorModal] Failed to fetch selected products:", err);
        }
      };
      fetchSelectedProducts();
    } else if (isOpen) {
      setCurrentSelection({});
    }
  }, [isOpen, selectedProductIds]);

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (maxSelections && Object.keys(currentSelection).length >= maxSelections) {
      return;
    }
    setCurrentSelection((prev) => ({ ...prev, [productId]: product }));
  };

  const handleDeselectProduct = (productId: string) => {
    setCurrentSelection((prev) => {
      const newSelection = { ...prev };
      delete newSelection[productId];
      return newSelection;
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters((prev) => ({ ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 12 });
  };

  const handleConfirm = () => {
    const selectedProducts = Object.values(currentSelection);
    onProductsSelected(selectedProducts);
    onClose();
  };

  const handleCancel = () => {
    setCurrentSelection({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold">Select Products</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {Object.keys(currentSelection).length} product{Object.keys(currentSelection).length !== 1 ? "s" : ""} selected
                {maxSelections && ` (max ${maxSelections})`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-border space-y-4">
            <ProductSearch
              value={filters.search || ""}
              onChange={(value) => handleFilterChange({ ...filters, search: value })}
              disabled={loading}
            />
            <ProductFilters
              filters={filters}
              onChange={handleFilterChange}
              categories={categories}
              brands={brands}
              onReset={handleResetFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{error}</p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="mt-4 px-4 py-2 btn-primary"
                >
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={!!currentSelection[product.id]}
                    onSelect={handleSelectProduct}
                    onDeselect={handleDeselectProduct}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer with Pagination and Actions */}
          <div className="p-6 border-t border-border space-y-4">
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={Object.keys(currentSelection).length === 0}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Confirm Selection ({Object.keys(currentSelection).length})
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
