"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Package } from "lucide-react";
import Image from "next/image";

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

  useEffect(() => {
    if (value) {
      fetchProduct(value);
    }
  }, [value]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/search?search=${productId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const product = data.data?.find((p: any) => p.id === productId);
        if (product) {
          setSelectedProduct(product);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  const searchProducts = async (query: string) => {
    console.log("[ProductSelector] searchProducts called with query:", query);
    setLoading(true);
    try {
      const url = `/api/admin/products/search?search=${encodeURIComponent(query)}&published=${filterPublished}&limit=50`;
      console.log("[ProductSelector] Fetching URL:", url);
      
      const response = await fetch(url, {
        credentials: "include",
      });
      
      console.log("[ProductSelector] Response status:", response.status);
      console.log("[ProductSelector] Response ok:", response.ok);
      
      const data = await response.json();
      console.log("[ProductSelector] Response data:", data);
      
      if (response.ok && data) {
        const productsList = data.data || [];
        console.log("[ProductSelector] Products list:", productsList);
        setProducts(productsList);
      } else {
        console.error("[ProductSelector] Products API error:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error("[ProductSelector] Failed to search products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[ProductSelector] useEffect triggered:", { isOpen, searchLength: search.length });
    
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
              <Image
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
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
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {search.length > 0 ? "No products found" : "No products available. Create products first."}
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
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
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
