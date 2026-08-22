// CMS INTEGRATION EXAMPLE
// This shows how to integrate ProductPickerModal into a CMS section page

"use client";

import { useState, useEffect } from "react";
import { ProductPickerModal } from "@/components/admin/ProductPickerModal";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  images: string[];
}

export default function CMSSectionExample() {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxProducts, setMaxProducts] = useState(6);

  const SECTION_KEY = "showcaseGrid"; // Your section key

  // Fetch current section products on mount
  useEffect(() => {
    fetchSectionProducts();
  }, []);

  const fetchSectionProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${SECTION_KEY}/products`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const products = Array.isArray(data.data) ? data.data : [];
        setSelectedProducts(products);
        
        // Extract product IDs
        const productIds = products
          .map((item: any) => item.product?.id || item.id)
          .filter(Boolean);
        setSelectedProductIds(productIds);
        
        // Get max products from section settings if available
        if (data.section?.maxProducts) {
          setMaxProducts(data.section.maxProducts);
        }
      }
    } catch (error) {
      console.error("Error fetching section products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection from ProductPickerModal
  const handleProductSelectionChange = (productIds: string[]) => {
    setSelectedProductIds(productIds);
    
    // Optionally fetch full product details for preview
    if (productIds.length > 0) {
      fetchProductDetails(productIds);
    } else {
      setSelectedProducts([]);
    }
  };

  // Fetch full product details for preview
  const fetchProductDetails = async (ids: string[]) => {
    try {
      const res = await fetch(`/api/admin/cms/products/search?limit=50`);
      const data = await res.json();
      
      if (data.success && data.products) {
        const allProducts = data.products;
        const selected = allProducts.filter((p: Product) => ids.includes(p.id));
        setSelectedProducts(selected);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Save the selection to the CMS
  const handleSaveSelection = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/homepage-sections/${SECTION_KEY}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: selectedProductIds,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Products saved successfully");
        await fetchSectionProducts(); // Refresh to get updated data
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving products:", error);
      toast.error("Failed to save products");
    } finally {
      setSaving(false);
    }
  };

  // Remove a single product from selection
  const handleRemoveProduct = (productId: string) => {
    const newIds = selectedProductIds.filter(id => id !== productId);
    const newProducts = selectedProducts.filter(p => p.id !== productId);
    setSelectedProductIds(newIds);
    setSelectedProducts(newProducts);
  };

  return (
    <div className="space-y-6">
      {/* Product Picker Modal */}
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <ProductPickerModal
          value={selectedProductIds}
          onChange={handleProductSelectionChange}
          sectionKey={SECTION_KEY}
          maxItems={maxProducts}
          label="Select Products"
          description="Choose products to feature in this section."
        />
      </div>

      {/* Selected Products Preview */}
      {selectedProducts.length > 0 && (
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Selected Products ({selectedProducts.length}/{maxProducts})
            </h3>
            <button
              onClick={handleSaveSelection}
              disabled={saving}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Selection"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-3 transition hover:border-primary/25"
              >
                <img
                  src={product.images?.[0] || "/placeholder-product.png"}
                  alt={product.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="rounded-full border border-border bg-background p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedProducts.length === 0 && !loading && (
        <div className="rounded-[2rem] border border-dashed border-border bg-background/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No products selected yet. Click "Select Products" to choose products for this section.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-[2rem] border border-border bg-card p-12 text-center">
          <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      )}
    </div>
  );
}

/* USAGE NOTES:

1. Replace SECTION_KEY with your actual section key
2. Ensure the API endpoint exists: /api/admin/cms/homepage-sections/[key]/products
3. The ProductPickerModal handles:
   - Opening/closing modal
   - Search with debounce
   - Multi-select with max items limit
   - Saving to CMS (if sectionKey is provided)
4. The preview shows selected products with remove buttons
5. Save button persists the selection to the CMS

API RESPONSE FORMAT:
{
  success: true,
  products: [
    {
      id: "uuid",
      name: "Product Name",
      sku: "SKU-001",
      images: ["url1", "url2"],
      category: { id: "uuid", name: "Category", slug: "category" }
    }
  ],
  total: 100,
  limit: 20,
  cursor: "last-product-id",
  hasMore: true
}
*/
