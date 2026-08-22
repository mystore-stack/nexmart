"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, GripVertical, Loader2, Search, Sparkles, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  image?: string | null;
  images?: string[];
  category?: {
    name?: string;
    slug?: string;
  } | null;
  brand?: string | null;
  tags?: string[];
}

interface ProductPickerProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  mode?: "single" | "multiple";
  maxItems?: number;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductPicker({
  value = [],
  onChange,
  mode = "multiple",
  maxItems = 12,
  label = "Sélectionner des produits",
  description = "Recherchez, filtrez et sélectionnez un ou plusieurs produits.",
  placeholder = "Rechercher un produit ou un SKU",
  disabled = false,
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(Array.isArray(value) ? value : []);
  const [selectedItems, setSelectedItems] = useState<ProductOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setSelectedIds(Array.isArray(value) ? value : []);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [open, debouncedSearch, categoryFilter, brandFilter]);

  useEffect(() => {
    if (!open) return;
    void loadFilters();
  }, [open]);

  useEffect(() => {
    if (!selectedIds.length) {
      setSelectedItems([]);
      return;
    }

    const byId = new Map<string, ProductOption>();
    products.forEach((product) => byId.set(product.id, product));
    const nextItems = selectedIds
      .map((id) => byId.get(id))
      .filter((item): item is ProductOption => Boolean(item));

    setSelectedItems((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));
      const merged = selectedIds
        .map((id) => {
          const fromProducts = byId.get(id);
          if (fromProducts) return fromProducts;
          return prevMap.get(id);
        })
        .filter((item): item is ProductOption => Boolean(item));
      return merged;
    });

    if (nextItems.length !== selectedIds.length) {
      setSelectedItems((prev) => {
        const prevMap = new Map(prev.map((item) => [item.id, item]));
        return selectedIds
          .map((id) => byId.get(id) ?? prevMap.get(id))
          .filter((item): item is ProductOption => Boolean(item));
      });
    }
  }, [selectedIds, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "40", published: "true" });
      if (debouncedSearch.trim()) params.set("query", debouncedSearch.trim());
      if (categoryFilter) params.set("category", categoryFilter);
      if (brandFilter) params.set("brand", brandFilter);

      const response = await fetch(`/api/admin/cms/products/search?${params.toString()}`);
      const payload = await response.json();

      console.log("[ProductPicker] FULL API DATA:", payload);
      console.log("[ProductPicker] PRODUCTS ARRAY:", payload.products);
      console.log("[ProductPicker] PRODUCTS LENGTH:", payload.products?.length || 0);

      if (!response.ok) {
        console.error("[ProductPicker] API error:", payload);
        toast.error(payload?.error || "Erreur lors de la recherche");
        setProducts([]);
        return;
      }

      // Handle multiple response formats
      let items = [];
      if (payload.success && payload.data) {
        items = Array.isArray(payload.data.products)
          ? payload.data.products.map(normalizeProduct)
          : [];
      } else if (Array.isArray(payload?.products)) {
        items = payload.products.map(normalizeProduct);
      } else if (Array.isArray(payload?.data)) {
        items = payload.data.map(normalizeProduct);
      }

      console.log("[ProductPicker] MAPPED ITEMS:", items.length);
      setProducts(items);
    } catch (error) {
      console.error("Failed to load products", error);
      toast.error("Erreur lors du chargement des produits");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    setLoadingFilters(true);
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products/brands"),
      ]);

      const categoriesPayload = await categoriesResponse.json();
      const brandsPayload = await brandsResponse.json();

      const categoryList = Array.isArray(categoriesPayload?.data)
        ? categoriesPayload.data
            .map((item: { name?: string; slug?: string }) => item.name || item.slug)
            .filter(Boolean)
        : [];
      const brandList = Array.isArray(brandsPayload?.brands)
        ? brandsPayload.brands.filter(Boolean)
        : [];

      setCategories(categoryList);
      setBrands(brandList);
    } catch (error) {
      console.error("Failed to load filters", error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Show all products, not just unselected ones
  // Selected products will be marked with checkmarks in the UI
  // This fixes the issue where pre-selected products were hidden from the picker
  const availableProducts = useMemo(() => {
    return products;
  }, [products]);

  const handleSelect = (product: ProductOption) => {
    if (disabled) return;

    if (mode === "single") {
      const nextIds = selectedIds[0] === product.id ? [] : [product.id];
      const nextItems = nextIds.map((id) => (id === product.id ? product : selectedItems.find((item) => item.id === id))).filter(Boolean) as ProductOption[];
      setSelectedIds(nextIds);
      setSelectedItems(nextItems);
      onChange?.(nextIds);
      return;
    }

    if (selectedIds.includes(product.id)) {
      const nextIds = selectedIds.filter((id) => id !== product.id);
      const nextItems = selectedItems.filter((item) => item.id !== product.id);
      setSelectedIds(nextIds);
      setSelectedItems(nextItems);
      onChange?.(nextIds);
      return;
    }

    if (maxItems && selectedIds.length >= maxItems) {
      toast.error(`Vous pouvez sélectionner jusqu'à ${maxItems} produits.`);
      return;
    }

    const nextIds = [...selectedIds, product.id];
    const nextItems = [...selectedItems, product];
    setSelectedIds(nextIds);
    setSelectedItems(nextItems);
    onChange?.(nextIds);
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    const nextIds = selectedIds.filter((selectedId) => selectedId !== id);
    const nextItems = selectedItems.filter((item) => item.id !== id);
    setSelectedIds(nextIds);
    setSelectedItems(nextItems);
    onChange?.(nextIds);
  };

  const moveSelection = (draggedId: string, targetId: string) => {
    if (draggedId === targetId || mode === "single") return;
    const nextIds = selectedIds.filter((id) => id !== draggedId);
    const targetIndex = nextIds.indexOf(targetId);
    const insertIndex = targetIndex >= 0 ? targetIndex : nextIds.length;
    nextIds.splice(insertIndex, 0, draggedId);
    setSelectedIds(nextIds);
    const itemMap = new Map(selectedItems.map((item) => [item.id, item]));
    const nextItems = nextIds.map((id) => itemMap.get(id)).filter(Boolean) as ProductOption[];
    setSelectedItems(nextItems);
    onChange?.(nextIds);
  };

  return (
    <>
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
            {selectedIds.length > 0 ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl sm:h-[85vh]">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid flex-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
                <div className="border-b border-border p-4 sm:p-6">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none ring-0"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Catégorie</span>
                      <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Marque</span>
                      <select
                        value={brandFilter}
                        onChange={(event) => setBrandFilter(event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Toutes les marques</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  {loading ? (
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
                  ) : availableProducts.length ? (
                    <div className="space-y-2">
                      {availableProducts.map((product) => {
                        const isSelected = selectedIds.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelect(product)}
                            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${isSelected ? "border-primary/40 bg-primary/10" : "border-border bg-background/70 hover:border-primary/25 hover:bg-surface"}`}
                          >
                            <img
                              src={product.image || product.images?.[0] || "/placeholder-product.png"}
                              alt={product.name}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                                {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{product.sku}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                {product.category?.name ? <span>{product.category.name}</span> : null}
                                {product.brand ? <span>• {product.brand}</span> : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 p-8 text-center">
                      <Search className="mb-3 h-8 w-8 text-muted-foreground" />
                      <h4 className="text-sm font-semibold text-foreground">Aucun produit trouvé</h4>
                      <p className="mt-2 text-sm text-muted-foreground">Essayez un autre terme ou changez de filtres.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col bg-background/60">
                <div className="border-b border-border px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Sélection actuelle</h4>
                      <p className="text-sm text-muted-foreground">
                        {mode === "single" ? "Un seul produit" : `Jusqu'à ${maxItems} produits`}
                      </p>
                    </div>
                    <div className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {selectedItems.length}/{maxItems}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  {selectedItems.length ? (
                    <div className="space-y-2">
                      {selectedItems.map((product) => (
                        <div
                          key={product.id}
                          draggable={mode === "multiple"}
                          onDragStart={() => setDraggingId(product.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggingId && draggingId !== product.id) {
                              moveSelection(draggingId, product.id);
                            }
                            setDraggingId(null);
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                        >
                          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <img
                            src={product.image || product.images?.[0] || "/placeholder-product.png"}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(product.id)}
                            className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-surface"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 p-8 text-center">
                      <Sparkles className="mb-3 h-8 w-8 text-muted-foreground" />
                      <h4 className="text-sm font-semibold text-foreground">Aucune sélection</h4>
                      <p className="mt-2 text-sm text-muted-foreground">Choisissez un ou plusieurs produits dans la liste.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function normalizeProduct(product: any): ProductOption {
  const images = Array.isArray(product?.images) ? product.images : [];
  const firstImage = typeof product?.image === "string" && product.image ? product.image : images[0];
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const brand = tags.find((tag: string) => tag && tag === tag.toUpperCase()) || tags[0] || product?.brand || null;

  return {
    id: product?.id,
    name: product?.name || "Produit sans nom",
    sku: product?.sku || "-",
    image: firstImage,
    images,
    category: product?.category
      ? {
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    brand,
    tags,
  };
}
