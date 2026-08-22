"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function BundleProductsEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    title: "Bundle Products",
    description: "Great savings when bought together",
    discount: 15,
    bundlePrice: 0,
    ctaText: "Add Bundle to Cart"
  });

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, config);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Bundle Products Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure texts, discount, and select products for this bundle.
        </p>

        <div className="bg-card p-6 rounded-2xl border space-y-6 mb-6">
          <h4 className="font-semibold text-lg border-b pb-2">Header Texts & Config</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Bundle Title</label>
              <input 
                type="text" 
                value={config.title || ""}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bundle Description</label>
              <input 
                type="text" 
                value={config.description || ""}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount (%)</label>
              <input 
                type="number" 
                value={config.discount || 0}
                onChange={(e) => setConfig({ ...config, discount: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bundle Price (Optional Fixed Price)</label>
              <input 
                type="number" 
                value={config.bundlePrice || 0}
                onChange={(e) => setConfig({ ...config, bundlePrice: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min="0"
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
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border space-y-6">
          <h4 className="font-semibold text-lg border-b pb-2">Selected Products</h4>
          <ProductSelector 
            sectionKey={section.sectionKey} 
            maxProducts={section.maxProducts || 6}
            initialProducts={section.products || []}
          />
        </div>
      </div>
    </div>
  );
}
