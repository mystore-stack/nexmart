"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function ShowcaseGridEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    showBestsellers: true,
    showNewArrivals: true,
    sponsoredTitle: "Xiaomi 14 Ultra",
    sponsoredSubtitle: "Performance sans compromis",
    sponsoredPrice: "À partir de 9.999 DH",
    sponsoredLink: "/sponsored",
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
          <h3 className="text-xl font-semibold">Showcase Grid Settings</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure the 4 main blocks of the showcase grid: Sponsored, Bestsellers, New Arrivals, and Seasonal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border space-y-4">
          <h4 className="font-semibold border-b pb-2">Sponsored Block (Left)</h4>
          <div>
            <label className="block text-sm mb-1">Product Name</label>
            <input 
              type="text" 
              value={config.sponsoredTitle || ""} 
              onChange={(e) => setConfig({ ...config, sponsoredTitle: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Subtitle</label>
            <input 
              type="text" 
              value={config.sponsoredSubtitle || ""} 
              onChange={(e) => setConfig({ ...config, sponsoredSubtitle: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Pricing Text</label>
            <input 
              type="text" 
              value={config.sponsoredPrice || ""} 
              onChange={(e) => setConfig({ ...config, sponsoredPrice: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Link URL</label>
            <input 
              type="text" 
              value={config.sponsoredLink || ""} 
              onChange={(e) => setConfig({ ...config, sponsoredLink: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border space-y-4">
          <h4 className="font-semibold border-b pb-2">Dynamic Blocks</h4>
          
          <div className="flex items-center justify-between p-3 border rounded-xl">
            <div>
              <p className="font-medium">Best Sellers List</p>
              <p className="text-xs text-muted-foreground">Automatically fetch top 3 selling items</p>
            </div>
            <input 
              type="checkbox" 
              checked={config.showBestsellers ?? true} 
              onChange={(e) => setConfig({ ...config, showBestsellers: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-xl">
            <div>
              <p className="font-medium">New Arrivals List</p>
              <p className="text-xs text-muted-foreground">Automatically fetch top 3 newest items</p>
            </div>
            <input 
              type="checkbox" 
              checked={config.showNewArrivals ?? true} 
              onChange={(e) => setConfig({ ...config, showNewArrivals: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border space-y-6 mt-6">
          <h4 className="font-semibold text-lg border-b pb-2">Sponsored Product Selection</h4>
          <ProductSelector 
            sectionKey={section.sectionKey} 
            maxProducts={section.maxProducts || 1}
            initialProducts={section.products || []}
          />
        </div>
      </div>
    </div>
  );
}
