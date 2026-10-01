"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function ProductCollectionManager({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [initialProducts, setInitialProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch section products on mount to ensure we have the latest data
  useEffect(() => {
    const fetchSectionProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/cms/homepage-sections/${section.sectionKey}/products`);
        const data = await res.json();
        
        console.log("[ProductCollectionManager] Fetched section products:", data);
        
        if (data.success && data.data) {
          // The API returns data.data.data as the products array
          const products = Array.isArray(data.data.data) ? data.data.data : [];
          console.log("[ProductCollectionManager] Setting initial products:", products);
          setInitialProducts(products);
        }
      } catch (error) {
        console.error("[ProductCollectionManager] Error fetching section products:", error);
        // Fallback to section.products if API fails
        setInitialProducts(section.products || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectionProducts();
  }, [section.sectionKey]);

  // Handle selection changes and save to database
  const handleSelectionChange = async (products: any[]) => {
    try {
      // Extract product IDs from the selected products
      const productIds = products.map(p => p.productId || p.product?.id).filter(Boolean);
      
      console.log("[ProductCollectionManager] Saving selection:", productIds);
      
      // Save to database via PATCH API
      const res = await fetch(`/api/admin/cms/homepage-sections/${section.sectionKey}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productIds }),
      });

      const data = await res.json();
      
      if (data.success) {
        console.log("[ProductCollectionManager] Selection saved successfully");
        // Refresh data after save
        const freshRes = await fetch(`/api/admin/cms/homepage-sections/${section.sectionKey}/products`);
        const freshData = await freshRes.json();
        
        if (freshData.success && freshData.data) {
          // The API returns data.data.data as the products array
          const products = Array.isArray(freshData.data.data) ? freshData.data.data : [];
          setInitialProducts(products);
        }
        
        // Revalidate homepage
        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("[ProductCollectionManager] Save failed:", data.error);
      }
    } catch (error) {
      console.error("[ProductCollectionManager] Error saving selection:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Manage Products</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Search and select products for the {section.title} section. Changes are saved automatically.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading products...
          </div>
        ) : (
          <ProductSelector 
            sectionKey={section.sectionKey} 
            maxProducts={parsedConfig?.maxProducts || 12}
            initialProducts={initialProducts}
            onSelectionChange={handleSelectionChange}
          />
        )}
      </div>
    </div>
  );
}

