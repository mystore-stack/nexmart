"use client";
// src/app/admin/products/page.tsx
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff, Filter,
  Package, AlertTriangle, MoreVertical, ArrowUpDown,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { formatPrice, formatDate } from "@/utils/format";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished" | "lowstock">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) params.set("search", search);
    if (filter === "published") params.set("published", "true");
    if (filter === "unpublished") params.set("published", "false");

    console.log("[FRONTEND] Fetching products with params:", params.toString());

    try {
      const res = await fetch(`/api/admin/products?${params}`, {
        credentials: "include",
      });
      
      console.log("[FRONTEND] Response status:", res.status, res.statusText);
      
      if (!res.ok) {
        console.error("[FRONTEND] API returned error status:", res.status, res.statusText);
        setProducts([]);
        return;
      }

      const text = await res.text();
      console.log("[FRONTEND] Response text length:", text.length);
      console.log("[FRONTEND] Response text (first 500 chars):", text.substring(0, 500));
      
      if (!text) {
        console.error("[FRONTEND] API returned empty response body");
        setProducts([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
        console.log("[FRONTEND] Parsed data:", data);
        console.log("[FRONTEND] data.success:", data.success);
        console.log("[FRONTEND] products is array:", Array.isArray(data.products));
        console.log("[FRONTEND] products length:", data.products?.length);
      } catch (parseError) {
        console.error("[FRONTEND] Failed to parse JSON response:", parseError);
        console.error("[FRONTEND] Raw response text:", text);
        setProducts([]);
        return;
      }
      
      if (data.success) {
        let prods = Array.isArray(data.products) ? data.products : [];
        const pagination = data.pagination;
        
        console.log("========== FULL API RESPONSE ==========");
        console.log(JSON.stringify(data, null, 2));
        console.log("success =", data.success);
        console.log("products =", data.products);
        console.log("pagination =", data.pagination);
        console.log("products length =", prods.length);
        
        if (filter === "lowstock") {
          prods = prods.filter((p: any) => p.stock <= p.lowStockAt && p.stock > 0);
        }
        
        console.log("BEFORE setProducts");
        console.log("incoming =", data);
        console.log("products passed to state =", prods?.length);
        
        setProducts(prods);
        setTotal(pagination?.total || 0);
        setTotalPages(pagination?.totalPages || 1);
        
        // CRITICAL FIX: Log warning if API returns success but no data
        if (prods.length === 0 && pagination?.total === 0) {
          console.warn("[FRONTEND] WARNING: API returned success but no products found");
          console.warn("[FRONTEND] This may indicate an empty database, an organizationId mismatch, or filters excluding all products");
          console.warn("[FRONTEND] Check server logs for [TENANT] and [ADMIN PRODUCTS] warnings");
        }
      } else {
        console.error("[FRONTEND] API returned success=false:", data);
        toast.error(data.error || "Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      console.error("[FRONTEND] Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Log state changes
  useEffect(() => {
    console.log("STATE products changed:", products.length);
  }, [products]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const togglePublish = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !product.published }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => p.id === product.id ? { ...p, published: !p.published } : p)
        );
        toast.success(product.published ? "Product unpublished" : "Product published");
      }
    } catch {
      toast.error("Failed to update product");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure? This will unpublish the product.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Product removed");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "unpublished", label: "Drafts" },
    { id: "lowstock", label: "Low Stock" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total.toLocaleString()} total products
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary py-2.5 px-5">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU..."
              className="input pl-10 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f.id
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            <div className="h-14 border-b border-border skeleton rounded-none" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-border last:border-0 skeleton rounded-none opacity-50" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Sold</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => {
                  const isLowStock = product.stock > 0 && product.stock <= product.lowStockAt;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Product info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{product.category?.name}</span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                          {product.comparePrice && (
                            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice)}</p>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          {(isLowStock || isOutOfStock) && (
                            <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${isOutOfStock ? "text-red-500" : "text-orange-500"}`} />
                          )}
                          <span className={`text-sm font-medium ${
                            isOutOfStock ? "text-red-500"
                            : isLowStock ? "text-orange-500"
                            : "text-green-600"
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className={`badge text-xs font-semibold px-2.5 py-1 ${
                          product.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {product.published ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Sold */}
                      <td className="px-4 py-4 hidden xl:table-cell">
                        <span className="text-sm text-muted-foreground">{product.soldCount.toLocaleString()}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => togglePublish(product)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title={product.published ? "Unpublish" : "Publish"}
                          >
                            {product.published
                              ? <EyeOff className="w-4 h-4" />
                              : <Eye className="w-4 h-4" />
                            }
                          </button>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500"
                            title="Delete"
                          >
                            {deletingId === product.id
                              ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {total.toLocaleString()} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-outline py-2 px-3 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-outline py-2 px-3 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
