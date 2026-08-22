"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function RelatedProductsEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    title: "Related Products",
    subtitle: "You might also like",
    maxProducts: section.maxProducts || 8,
    isAutomatic: true
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
          <h3 className="text-xl font-semibold">Related Products Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure texts and whether related products are manual or automatic.
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
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input 
                type="text" 
                value={config.subtitle || ""}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Products</label>
              <input 
                type="number" 
                value={config.maxProducts || 6}
                onChange={(e) => setConfig({ ...config, maxProducts: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min="1"
                max="12"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input 
                  type="checkbox"
                  checked={config.isAutomatic !== false}
                  onChange={(e) => setConfig({ ...config, isAutomatic: e.target.checked })}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium">Use Automatic AI Recommendations (overrides manual selection)</span>
              </label>
            </div>
          </div>
        </div>

        <div className={`bg-card p-6 rounded-2xl border space-y-6 ${config.isAutomatic !== false ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-lg">Manual Selected Products</h4>
          </div>
          <ProductSelector 
            sectionKey={section.sectionKey} 
            maxProducts={section.maxProducts || 8}
            initialProducts={section.products || []}
          />
        </div>
      </div>
    </div>
  );
}
