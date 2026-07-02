"use client";

import React, { useEffect, useState } from "react";

import { Search, X, Package } from "lucide-react";

function ProductThumb({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // If src changes, reset failure state.
  useEffect(() => {
    setFailed(false);
    setTimedOut(false);
  }, [src]);

  const timeoutMs = 2000;

  return (
    <div
      className={
        size === "lg"
          ? "relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0"
          : "relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0"
      }
    >
      {!failed && !timedOut ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="object-cover w-full h-full"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={() => {
            // no-op: successful load ends the timeout implicitly
          }}
          onAbort={() => setFailed(true)}
          style={{ display: failed || timedOut ? "none" : "block" }}
        />
      ) : null}

      {(failed || timedOut) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className={size === "lg" ? "w-6 h-6 text-muted-foreground/30" : "w-4 h-4 text-muted-foreground/30"} />
        </div>
      )}

      {/* Timeout guard: if the image doesn't load quickly, fail it and render placeholder. */}
      {!failed && !timedOut && (
        <TimeoutOnce
          key={src}
          timeoutMs={timeoutMs}
          onTimeout={() => setTimedOut(true)}
        />
      )}
    </div>
  );
}

function TimeoutOnce({
  timeoutMs,
  onTimeout,
}: {
  timeoutMs: number;
  onTimeout: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      onTimeout();
    }, timeoutMs);
    return () => window.clearTimeout(t);
  }, [timeoutMs, onTimeout]);
  return null;
}


interface Product {

  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  comparePrice?: number;
  published: boolean;
  stock: number;
  category?: {
    name: string;
  };
}

interface ProductSelectorProps {
  value?: string;
  onChange: (productId: string) => void;
  disabled?: boolean;
  filterPublished?: boolean;
}

export function ProductSelector({ value, onChange, disabled = false, filterPublished = true }: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authError, setAuthError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      fetchProduct(value);
    }
  }, [value]);

  const fetchProduct = async (productId: string) => {
    console.log("[ProductSelector] === fetchProduct START ===");
    console.log("[ProductSelector] Product ID:", productId);
    
    try {
      const response = await fetch(`/api/admin/products?search=${productId}`, {
        credentials: "include",
      });
      
      console.log("[ProductSelector] fetchProduct HTTP Status:", response.status);
      console.log("[ProductSelector] fetchProduct Response ok:", response.ok);
      
      if (!response.ok) {
        console.error("[ProductSelector] fetchProduct HTTP Error:", response.status);
        const errorText = await response.text();
        console.error("[ProductSelector] fetchProduct Error body:", errorText);
        return;
      }
      
      const data = await response.json();
      console.log("[ProductSelector] fetchProduct Raw JSON:", JSON.stringify(data, null, 2));
      
      // Try different possible response structures
      let product: any = null;
      
      if (Array.isArray(data.products)) {
        console.log("[ProductSelector] fetchProduct Using data.products");
        product = data.products.find((p: any) => p.id === productId);
      } else if (Array.isArray(data.data)) {
        console.log("[ProductSelector] fetchProduct Using data.data (direct array)");
        product = data.data.find((p: any) => p.id === productId);
      } else if (data.data && Array.isArray(data.data.data)) {
        console.log("[ProductSelector] fetchProduct Using data.data.data (nested array)");
        product = data.data.data.find((p: any) => p.id === productId);
      }
      
      console.log("[ProductSelector] fetchProduct Found product:", product ? product.id : "null");
      if (product) {
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error("[ProductSelector] fetchProduct Exception:", error);
      console.error("[ProductSelector] fetchProduct Exception message:", error instanceof Error ? error.message : String(error));
      console.error("[ProductSelector] fetchProduct Exception stack:", error instanceof Error ? error.stack : "No stack trace");
    } finally {
      console.log("[ProductSelector] === fetchProduct END ===");
    }
  };

  const searchProducts = async (query: string) => {
    console.log("[ProductSelector] === searchProducts START ===");
    console.log("[ProductSelector] Query:", query);
    console.log("[ProductSelector] filterPublished:", filterPublished);
    setLoading(true);
    
    try {
      // Build URL with proper published parameter
      const params = new URLSearchParams();
      params.set("search", query);
      params.set("limit", "50");
      
      if (filterPublished === true) {
        params.set("published", "true");
      }
      // If filterPublished is false or undefined, don't set published parameter (shows all products)
      
      const url = `/api/admin/products?${params.toString()}`;
      console.log("[ProductSelector] Fetching URL:", url);
      console.log("[ProductSelector] Starting fetch...");
      
      const response = await fetch(url, {
        credentials: "include",
      });
      
      console.log("[ProductSelector] === RESPONSE RECEIVED ===");
      console.log("[ProductSelector] HTTP Status:", response.status);
      console.log("[ProductSelector] HTTP Status Text:", response.statusText);
      console.log("[ProductSelector] Response ok:", response.ok);
      console.log("[ProductSelector] Response headers:", Object.fromEntries(response.headers.entries()));
      
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        console.error("[ProductSelector] Authentication failed - user not logged in");
        setAuthError(true);
        setProducts([]);
        setApiError("Authentication failed. Please log in.");
        return;
      }
      
      if (!response.ok) {
        console.error("[ProductSelector] HTTP Error - Status:", response.status);
        const errorText = await response.text();
        console.error("[ProductSelector] Error response body:", errorText);
        setProducts([]);
        setApiError(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      console.log("[ProductSelector] === RAW JSON RESPONSE ===");
      console.log("[ProductSelector] Raw JSON:", JSON.stringify(data, null, 2));
      console.log("[ProductSelector] Response success:", data.success);
      console.log("[ProductSelector] Has data property:", "data" in data);
      console.log("[ProductSelector] data type:", typeof data.data);
      console.log("[ProductSelector] data is array:", Array.isArray(data.data));
      
      if (data.data && typeof data.data === "object") {
        console.log("[ProductSelector] data.data exists:", "data" in data.data);
        console.log("[ProductSelector] data.data type:", typeof data.data.data);
        console.log("[ProductSelector] data.data is array:", Array.isArray(data.data.data));
      }
      
      if (response.ok && data.success) {
        // Try different possible response structures
        let productsList: any[] = [];
        
        if (Array.isArray(data.products)) {
          console.log("[ProductSelector] Using data.products");
          productsList = data.products;
        } else if (Array.isArray(data.data)) {
          console.log("[ProductSelector] Using data.data (direct array)");
          productsList = data.data;
        } else if (data.data && Array.isArray(data.data.data)) {
          console.log("[ProductSelector] Using data.data.data (nested array)");
          productsList = data.data.data;
        } else {
          console.error("[ProductSelector] Unknown response structure");
          console.error("[ProductSelector] Available keys:", Object.keys(data));
          throw new Error("Unknown /api/admin/products response structure. Expected top-level products array and pagination object.");
        }
        
        console.log("[ProductSelector] Extracted products count:", productsList.length);
        console.log("[ProductSelector] First product sample:", productsList[0]);
        
        setProducts(productsList);
        setApiError(null);
      } else {
        console.error("[ProductSelector] API returned error or success=false");
        console.error("[ProductSelector] data.success:", data.success);
        console.error("[ProductSelector] data.error:", data.error);
        setProducts([]);
        setApiError(data.error || "API returned success=false");
      }
    } catch (error) {
      console.error("[ProductSelector] === EXCEPTION THROWN ===");
      console.error("[ProductSelector] Exception:", error);
      console.error("[ProductSelector] Exception message:", error instanceof Error ? error.message : String(error));
      console.error("[ProductSelector] Exception stack:", error instanceof Error ? error.stack : "No stack trace");
      setProducts([]);
      setApiError(error instanceof Error ? error.message : String(error));
    } finally {
      console.log("[ProductSelector] === searchProducts END ===");
      console.log("[ProductSelector] Loading state:", false);
      console.log("[ProductSelector] Products count:", products.length);
      console.log("[ProductSelector] API Error:", apiError);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[ProductSelector] useEffect triggered:", { isOpen, searchLength: search.length });
    
    // Reset errors when opening dropdown
    if (isOpen) {
      setAuthError(false);
      setApiError(null);
    }
    
    // Load all products initially when dropdown opens
    if (isOpen && search.length === 0) {
      console.log("[ProductSelector] Loading all products on open");
      searchProducts("");
    }
    // Search when user types
    if (search.length > 0) {
      console.log("[ProductSelector] Debouncing search for:", search);
      const debounceTimer = setTimeout(() => {
        searchProducts(search);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [search, isOpen]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    onChange(product.id);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setSelectedProduct(null);
    onChange("");
  };

  return (
    <div className="relative">
      {selectedProduct ? (
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {selectedProduct.images[0] ? (
              <ProductThumb src={selectedProduct.images[0]} alt={selectedProduct.name} size="lg" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}




          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedProduct.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedProduct.price} MAD
              {selectedProduct.comparePrice && (
                <span className="ml-2 line-through">{selectedProduct.comparePrice} MAD</span>
              )}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selected product"
              aria-label="Clear selected product"
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

          )}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(true)}
            disabled={disabled}
            className={`w-full flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-left hover:border-primary/50 transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Select a product...</span>
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-72">
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : authError ? (
                    <div className="p-4 text-center text-red-500">
                      Authentication required. Please log in to access products.
                    </div>
                  ) : apiError ? (
                    <div className="p-4 text-center text-red-500">
                      {apiError}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {search.length > 0
                        ? `No products found for "${search}".`
                        : filterPublished
                          ? "No published products found for this organization. Publish products first or disable the published filter."
                          : "No products found for this organization. Create products first."}
                    </div>
                  ) : (
                    products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelect(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <ProductThumb src={product.images[0]} alt={product.name} size="sm" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                          )}

                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.price} MAD
                            {product.comparePrice && (
                              <span className="ml-1 line-through">{product.comparePrice} MAD</span>
                            )}
                          </p>
                        </div>
                        {!product.published && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded">
                            Draft
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
