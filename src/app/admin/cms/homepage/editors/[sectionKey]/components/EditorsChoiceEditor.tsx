"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function EditorsChoiceEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    title: "Editor's Choice",
    subtitle: "Curated selection",
    ctaText: "View All",
    maxProducts: section.maxProducts || 6
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
        console.error(`[EditorsChoiceEditor] Error fetching section products:`, error);
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
      console.error(`[EditorsChoiceEditor] Error saving selection:`, error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Editor's Choice Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure the texts and products for the Editor's Choice section.
        </p>

        <div className="bg-card p-6 rounded-2xl border space-y-6 mb-6">
          <h4 className="font-semibold text-lg border-b pb-2">Header Texts & Config</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input 
                type="text" 
                value={config.title || ""}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle / Badge</label>
              <input 
                type="text" 
                value={config.subtitle || ""}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Button Text (CTA)</label>
              <input 
                type="text" 
                value={config.ctaText || ""}
                onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Products</label>
              <input 
                type="number" 
                value={config.maxProducts || 8}
                onChange={(e) => setConfig({ ...config, maxProducts: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min="1"
                max="24"
              />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border space-y-6">
          <h4 className="font-semibold text-lg border-b pb-2">Selected Products</h4>
          {isLoadingProducts ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading products...
            </div>
          ) : (
            <ProductSelector 
              sectionKey={section.sectionKey} 
              maxProducts={section.maxProducts || 6}
              initialProducts={initialProducts}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
