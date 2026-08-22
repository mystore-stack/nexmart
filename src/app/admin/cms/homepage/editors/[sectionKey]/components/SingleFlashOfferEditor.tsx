"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function SingleFlashOfferEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    subtitle: "Prix réduit pendant une durée limitée !",
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    stockRemaining: 8,
    totalStock: 50,
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Single Flash Offer (Offre Flash)</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Configure a single product showcase with a countdown timer and remaining stock indicator.
        </p>

        <div className="bg-card p-6 rounded-2xl border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input 
                type="text" 
                value={config.subtitle || ""}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="Prix réduit pendant une durée limitée !"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Countdown Target (End Date/Time)</label>
              <input 
                type="datetime-local" 
                value={config.endDate || ""}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Remaining (Pieces in stock)</label>
              <input 
                type="number" 
                value={config.stockRemaining || 0}
                onChange={(e) => setConfig({ ...config, stockRemaining: parseInt(e.target.value) })}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Stock (For progress bar)</label>
              <input 
                type="number" 
                value={config.totalStock || 0}
                onChange={(e) => setConfig({ ...config, totalStock: parseInt(e.target.value) })}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-xl font-semibold mb-4">Featured Product (Select only 1)</h3>
        <ProductSelector 
          sectionKey={section.sectionKey} 
          maxProducts={1}
          initialProducts={section.products || []}
        />
      </div>
    </div>
  );
}
