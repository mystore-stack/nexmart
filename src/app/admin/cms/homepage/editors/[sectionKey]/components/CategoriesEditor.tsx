"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";

export function CategoriesEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {});

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, config);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Categories Display Settings</h3>
      
      <div className="bg-card p-6 rounded-2xl border space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Note: This section automatically pulls the top active categories from your store. 
          You can configure how they are displayed here.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Categories to Show</label>
            <input 
              type="number" 
              value={config.limit || 8} 
              onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input 
              type="checkbox" 
              checked={config.showCount ?? true} 
              onChange={(e) => setConfig({ ...config, showCount: e.target.checked })}
              id="showCount"
            />
            <label htmlFor="showCount" className="text-sm font-medium cursor-pointer">
              Show product count badge
            </label>
          </div>
        </div>
      </div>

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
