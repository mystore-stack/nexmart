// src/components/admin/ProductSelector.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Plus, GripVertical, Package, DollarSign, Box, Tag, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  published: boolean;
}

interface SelectedProduct {
  id: string;
  order: number;
  customPrice?: number;
  customBadge?: string;
  active: boolean;
  product: Product;
}

interface ProductSelectorProps {
  sectionKey: string;
  maxProducts?: number;
  onSelectionChange?: (products: SelectedProduct[]) => void;
  initialProducts?: SelectedProduct[];
  disabled?: boolean;
}

export function ProductSelector({
  sectionKey,
  maxProducts = 12,
  onSelectionChange,
  initialProducts = [],
  disabled = false,
}: ProductSelectorProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [skuQuery, setSkuQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedProducts);
    }
  }, [selectedProducts, onSelectionChange]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/products/brands");
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const searchProducts = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (skuQuery) params.append("sku", skuQuery);
      if (categoryFilter) params.append("category", categoryFilter);
      if (brandFilter) params.append("brand", brandFilter);
      if (publishedOnly !== undefined) params.append("published", publishedOnly.toString());
      params.append("limit", "50");

      const res = await fetch(`/api/admin/cms/products/search?${params}`);
      const data = await res.json();
      
      if (data.success) {
        // Filter out already selected products
        const selectedIds = new Set(selectedProducts.map(sp => sp.product.id));
        const availableProducts = (data.data || []).filter((p: Product) => !selectedIds.has(p.id));
        setSearchResults(availableProducts);
        setShowSearchResults(true);
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const addProduct = async (product: Product) => {
    if (selectedProducts.length >= maxProducts) {
      toast.error(`Maximum ${maxProducts} produits autorisés`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${sectionKey}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          order: selectedProducts.length,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSelectedProducts([...selectedProducts, {
          id: data.id,
          order: selectedProducts.length,
          active: true,
          product,
        }]);
        setSearchResults(searchResults.filter(p => p.id !== product.id));
        toast.success("Produit ajouté");
      } else {
        toast.error(data.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const removeProduct = async (sectionProductId: string) => {
    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${sectionKey}/products?id=${sectionProductId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (data.success) {
        setSelectedProducts(selectedProducts.filter(sp => sp.id !== sectionProductId));
        toast.success("Produit supprimé");
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const reorderProducts = async (fromIndex: number, toIndex: number) => {
    const newProducts = [...selectedProducts];
    const [moved] = newProducts.splice(fromIndex, 1);
    newProducts.splice(toIndex, 0, moved);

    // Update order values
    const reorderedProducts = newProducts.map((sp, index) => ({
      ...sp,
      order: index,
    }));

    setSelectedProducts(reorderedProducts);

    // Save to server
    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${sectionKey}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reorderedProducts.map(sp => ({ id: sp.id, order: sp.order })),
      
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error("Erreur lors du réordonnancement");
      }
    } catch (error) {
      toast.error("Erreur lors du réordonnancement");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderProducts(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const updateCustomPrice = async (sectionProductId: string, customPrice: number | undefined) => {
    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${sectionKey}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sectionProductId,
          customPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedProducts(selectedProducts.map(sp => 
          sp.id === sectionProductId ? { ...sp, customPrice } : sp
        ));
        toast.success("Prix personnalisé mis à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const updateCustomBadge = async (sectionProductId: string, customBadge: string | undefined) => {
    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${sectionKey}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sectionProductId,
          customBadge,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedProducts(selectedProducts.map(sp => 
          sp.id === sectionProductId ? { ...sp, customBadge } : sp
        ));
        toast.success("Badge personnalisé mis à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" /> Rechercher des produits
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Nom</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom..."
              className="input w-full"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">SKU</label>
            <input
              type="text"
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              placeholder="Rechercher par SKU..."
              className="input w-full"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Catégorie</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-full"
              disabled={disabled}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Marque</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="input w-full"
              disabled={disabled}
            >
              <option value="">Toutes les marques</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={publishedOnly}
              onChange={(e) => setPublishedOnly(e.target.checked)}
              className="w-4 h-4"
              disabled={disabled}
            />
            Uniquement les produits publiés
          </label>
          <button
            onClick={searchProducts}
            disabled={disabled || isSearching}
            className="btn-primary px-4 py-2 text-sm font-bold rounded-xl inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isSearching ? "Recherche..." : "Rechercher"}
          </button>
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="mt-4 border border-border rounded-2xl bg-surface max-h-96 overflow-y-auto">
            {searchResults.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 border-b border-border last:border-b-0 hover:bg-border/50 transition-colors"
              >
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white border flex-shrink-0">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-foreground">
                      {product.price.toLocaleString("fr-MA")} DH
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addProduct(product)}
                  disabled={disabled}
                  className="btn-primary p-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showSearchResults && searchResults.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">Aucun produit trouvé</p>
        )}
      </div>

      {/* Selected Products */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" /> Produits sélectionnés
            <span className="text-sm font-normal text-muted-foreground">
              ({selectedProducts.length}/{maxProducts})
            </span>
          </h3>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun produit sélectionné</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedProducts.map((sp, index) => (
              <div
                key={sp.id}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface transition-all ${
                  draggedIndex === index ? "ring-2 ring-brand-500" : ""
                } ${!disabled ? "cursor-move hover:border-border/80" : ""}`}
              >
                {!disabled && (
                  <div className="cursor-grab text-muted-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                )}

                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white border flex-shrink-0">
                  {sp.product.images[0] && (
                    <Image
                      src={sp.product.images[0]}
                      alt={sp.product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sp.product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {sp.product.sku}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-foreground">
                      {(sp.customPrice || sp.product.price).toLocaleString("fr-MA")} DH
                    </span>
                    {sp.customPrice && sp.customPrice !== sp.product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {sp.product.price.toLocaleString("fr-MA")} DH
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Stock: {sp.product.stock}
                    </span>
                  </div>
                  {sp.customBadge && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded">
                      {sp.customBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!disabled && (
                    <button
                      onClick={() => removeProduct(sp.id)}
                      className="btn-ghost p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customization Options */}
      {selectedProducts.length > 0 && !disabled && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" /> Personnalisation
          </h3>
          <div className="space-y-4">
            {selectedProducts.map((sp) => (
              <div key={sp.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sp.product.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={sp.customPrice || ""}
                      onChange={(e) => updateCustomPrice(sp.id, e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder={sp.product.price.toString()}
                      className="input w-24 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={sp.customBadge || ""}
                      onChange={(e) => updateCustomBadge(sp.id, e.target.value || undefined)}
                      placeholder="Badge"
                      className="input w-32 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
