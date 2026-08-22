"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronDown, Search, Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { normalizeProductSelectionIds } from "@/components/admin/product-picker-state";

export interface ProductPickerProduct {
  id: string;
  name: string;
  sku: string;
  images: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductPickerModalProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  sectionKey?: string;
  maxItems?: number;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductPickerModal({
  value = [],
  onChange,
  sectionKey,
  maxItems = 12,
  label = "Select Products",
  description = "Choose products from the catalog.",
  placeholder = "Search products by name or SKU",
  disabled = false,
}: ProductPickerModalProps) {
  const [open, setOpen] = useState(false);
  const [draftSelection, setDraftSelection] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductPickerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Log when component mounts
  console.log("[ProductPickerModal] Component mounted with value:", value);



  // Sync draft selection with value when modal opens
  useEffect(() => {
    if (open) {
      const normalized = normalizeProductSelectionIds(value);
      console.log("[ProductPickerModal] Syncing draft selection with value:", value, "normalized:", normalized);
      setDraftSelection(normalized);
    }
  }, [open, value]);

  // Fetch products function
  const fetchProducts = async (searchQuery: string = "") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: "20",
        published: "true",
      });

      // Only add query param if user typed something
      if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
      }

      const url = `/api/admin/cms/products/search?${params.toString()}`;
      console.log("[ProductPickerModal] Fetching:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("[ProductPickerModal] FULL API DATA:", data);
      console.log("[ProductPickerModal] PRODUCTS ARRAY:", data.products);
      console.log("[ProductPickerModal] PRODUCTS LENGTH:", data.products?.length || 0);
      console.log("[ProductPickerModal] TOTAL:", data.total);

      // Handle multiple response formats
      let productsArray = [];
      let totalCount = 0;

      if (data.success && data.data) {
        // Format: { success: true, data: { products: [], total: 20 } }
        productsArray = Array.isArray(data.data.products) ? data.data.products : [];
        totalCount = data.data.total || productsArray.length;
      } else if (Array.isArray(data?.products)) {
        // Format: { products: [], total: 20 }
        productsArray = data.products;
        totalCount = data.total || productsArray.length;
      } else if (Array.isArray(data?.data)) {
        // Format: { data: [] }
        productsArray = data.data;
        totalCount = productsArray.length;
      }

      console.log("[ProductPickerModal] FINAL PRODUCTS ARRAY:", productsArray);
      console.log("[ProductPickerModal] FINAL PRODUCTS LENGTH:", productsArray.length);

      // Force set products regardless of errors
      setProducts(productsArray);
      setTotal(totalCount);
    } catch (err) {
      console.error("[ProductPickerModal] Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when modal opens
  useEffect(() => {
    if (open) {
      console.log("[ProductPickerModal] Modal opened, fetching initial products");
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        console.log("[ProductPickerModal] Debounced search for:", query);
        fetchProducts(query);
      }
    }, 300);

    return () => {
      console.log("[ProductPickerModal] Clearing debounce timer");
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  const selectedCount = draftSelection.length;
  // Render all products directly from state
  // This ensures products show up if they're in the state
  const displayProducts = products;

  // Monitor state changes for debugging
  useEffect(() => {
    console.log("[ProductPickerModal] STATE UPDATE:", {
      productsLength: products.length,
      displayProductsLength: displayProducts.length,
      draftSelectionLength: draftSelection.length,
      loading,
      error,
      total,
    });
  }, [products.length, displayProducts.length, draftSelection.length, loading, error, total]);

  const toggleSelection = (productId: string) => {
    setDraftSelection((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      if (maxItems && current.length >= maxItems) {
        toast.error(`You can select up to ${maxItems} products.`);
        return current;
      }
      return [...current, productId];
    });
  };

  const handleConfirm = async () => {
    if (sectionKey) {
      setSaving(true);
      try {
        const response = await fetch(`/api/admin/cms/homepage-sections/${sectionKey}/products`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: draftSelection }),
        });
        const payload = await response.json();
        if (!payload.success) {
          throw new Error(payload.error || "Failed to save selection");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to save products");
        setSaving(false);
        return;
      } finally {
        setSaving(false);
      }
    }

    onChange?.(draftSelection);
    setOpen(false);
    setQuery(""); // Reset search when closing
    setProducts([]); // Clear products when closing
  };

  const handleCancel = () => {
    setOpen(false);
    setQuery(""); // Reset search when closing
    setProducts([]); // Clear products when closing
    setDraftSelection(normalizeProductSelectionIds(value)); // Reset to original selection
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{label}</span>
            {selectedCount > 0 ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {selectedCount} selected
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl sm:h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="border-b border-border p-4 sm:p-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {total > 0 ? `${total} products found` : "Select products"}
                </p>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {selectedCount}/{maxItems}
                </span>
              </div>

              {error ? (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 p-8 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-3">
                      <div className="h-14 w-14 animate-pulse rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-xs">
                    DEBUG: Products={products.length}, Display={displayProducts.length}, Loading={loading}
                  </div>
                  {displayProducts.length === 0 ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 p-8 text-center">
                      <Search className="mb-3 h-8 w-8 text-muted-foreground" />
                      <h4 className="text-sm font-semibold text-foreground">
                        {query ? "No products found" : "No products available"}
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {query ? "Try a different search term" : "There are no products in the catalog"}
                      </p>
                    </div>
                  ) : (
                    displayProducts.map((product) => {
                      const isSelected = draftSelection.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleSelection(product.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                            isSelected
                              ? "border-primary/40 bg-primary/10"
                              : "border-border bg-background/70 hover:border-primary/25 hover:bg-surface"
                          }`}
                        >
                          <img
                            src={product.images?.[0] || "/placeholder-product.png"}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                              {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{product.sku}</p>
                            {product.category?.name ? (
                              <p className="mt-1 text-[11px] text-muted-foreground">{product.category.name}</p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-2xl border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={saving || selectedCount === 0}
                className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  `Confirm (${selectedCount})`
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
