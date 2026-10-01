"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function RecommendedEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    strategy: "AI_PERSONALIZED",
    fallbackStrategy: "BEST_SELLERS",
    limit: 8,
  });
  const [initialProducts, setInitialProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, config);
      router.refresh();
    });
  };

  // Fetch section products on mount
  useEffect(() => {
    const fetchSectionProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const res = await fetch(`/api/admin/cms/homepage-sections/${section.sectionKey}/products`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const products = Array.isArray(data.data.data) ? data.data.data : [];
          setInitialProducts(products);
        }
      } catch (error) {
        console.error(`[RecommendedEditor] Error fetching section products:`, error);
        setInitialProducts(section.products || []);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchSectionProducts();
  }, [section.sectionKey]);

  // Handle selection changes and save to database
  const handleSelectionChange = async (products: any[]) => {
    try {
      const productIds = products.map(p => p.productId || p.product?.id).filter(Boolean);
      
      const res = await fetch(`/api/admin/cms/homepage-sections/${section.sectionKey}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productIds }),
      });

      const data = await res.json();
      
      if (data.success) {
        const freshRes = await fetch(`/api/admin/cms/homepage-sections/${section.sectionKey}/products`);
        const freshData = await freshRes.json();
        
        if (freshData.success && freshData.data) {
          const products = Array.isArray(freshData.data.data) ? freshData.data.data : [];
          setInitialProducts(products);
        }
        
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      console.error(`[RecommendedEditor] Error saving selection:`, error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold">RECOMMENDED SPECIALIZED EDITOR — RUNTIME TEST</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure how the recommended products are selected for each user.
        </p>

        <div className="bg-card p-6 rounded-2xl border space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Strategy</label>
              <select 
                value={config.strategy}
                onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
                className="w-full border rounded-lg p-2"
              >
                <option value="AI_PERSONALIZED">AI Personalized (User History)</option>
                <option value="RECENTLY_VIEWED">Recently Viewed Based</option>
                <option value="CART_BASED">Cart Based</option>
                <option value="MANUAL">Manual Selection Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fallback Strategy</label>
              <select 
                value={config.fallbackStrategy}
                onChange={(e) => setConfig({ ...config, fallbackStrategy: e.target.value })}
                className="w-full border rounded-lg p-2"
                disabled={config.strategy === "MANUAL"}
              >
                <option value="BEST_SELLERS">Best Sellers</option>
                <option value="NEW_ARRIVALS">New Arrivals</option>
                <option value="TRENDING">Trending Products</option>
                <option value="MANUAL">Manual Selection</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Used if the primary strategy yields no results (e.g. new user).</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Products to Show</label>
              <input 
                type="number" 
                value={config.limit || 8}
                onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min={4}
                max={20}
              />
            </div>
          </div>
        </div>
      </div>

      {(config.strategy === "MANUAL" || config.fallbackStrategy === "MANUAL") && (
        <div className="pt-4 border-t">
          <h3 className="text-xl font-semibold">Manual Fallback Products</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Select the exact products to show when the manual strategy is used.
          </p>
          {isLoadingProducts ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading products...
            </div>
          ) : (
            <ProductSelector 
              sectionKey={section.sectionKey} 
              maxProducts={config.limit}
              initialProducts={initialProducts}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
