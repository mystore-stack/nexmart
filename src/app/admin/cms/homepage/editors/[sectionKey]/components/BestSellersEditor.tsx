"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function BestSellersEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    title: "Best Sellers",
    maxProducts: section.maxProducts || 8
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
          <h3 className="text-xl font-semibold">Best Sellers Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure the texts and top products for the Best Sellers section.
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
          <h4 className="font-semibold text-lg border-b pb-2">Selected Products (Ranking)</h4>
          <p className="text-sm text-muted-foreground mb-4">The order here determines the ranking.</p>
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
