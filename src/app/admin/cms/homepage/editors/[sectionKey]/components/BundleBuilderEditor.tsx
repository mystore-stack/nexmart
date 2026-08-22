"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function BundleBuilderEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    title: "CRÉEZ VOTRE BUNDLE",
    subtitle: "Choisissez vos produits préférés et économisez jusqu'à 30% sur l'achat.",
    ctaText: "Créer mon bundle",
    maxDiscountPercent: 30,
    showGift: true,
    giftTitle: "Kit de nettoyage 7-en-1",
    giftDescription: "Pour garder tous vos appareils propres et comme neufs au quotidien.",
    giftImage: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200&auto=format&fit=crop"
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
          <h3 className="text-xl font-semibold">Bundle Builder Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Configure the texts, gift, and products eligible for the bundle builder.
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
              <label className="block text-sm font-medium mb-2">Button Text (CTA)</label>
              <input 
                type="text" 
                value={config.ctaText || ""}
                onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="Créer mon bundle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Percentage (%)</label>
              <input 
                type="number" 
                value={config.maxDiscountPercent || 30}
                onChange={(e) => setConfig({ ...config, maxDiscountPercent: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#eefaf3] p-6 rounded-2xl border border-[#c1ebd3] space-y-6">
          <div className="flex items-center justify-between border-b border-[#c1ebd3] pb-2">
            <h4 className="font-semibold text-lg text-[#1f8755]">Gift Configuration (Cadeau Offert)</h4>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.showGift !== false}
                onChange={(e) => setConfig({ ...config, showGift: e.target.checked })}
                className="rounded border-gray-300 text-[#1f8755] focus:ring-[#1f8755]"
              />
              Show Gift Section
            </label>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${config.showGift === false ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-medium mb-2">Gift Title</label>
              <input 
                type="text" 
                value={config.giftTitle || ""}
                onChange={(e) => setConfig({ ...config, giftTitle: e.target.value })}
                className="w-full border rounded-lg p-2 bg-white"
                placeholder="e.g. Kit de nettoyage 7-en-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gift Image URL</label>
              <input 
                type="text" 
                value={config.giftImage || ""}
                onChange={(e) => setConfig({ ...config, giftImage: e.target.value })}
                className="w-full border rounded-lg p-2 bg-white"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Gift Description</label>
              <input 
                type="text" 
                value={config.giftDescription || ""}
                onChange={(e) => setConfig({ ...config, giftDescription: e.target.value })}
                className="w-full border rounded-lg p-2 bg-white"
                placeholder="Pour garder tous vos appareils propres..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-xl font-semibold mb-4">Eligible Bundle Products</h3>
        <ProductSelector 
          sectionKey={section.sectionKey} 
          maxProducts={section.maxProducts || 4}
          initialProducts={section.products || []}
        />
      </div>
    </div>
  );
}
