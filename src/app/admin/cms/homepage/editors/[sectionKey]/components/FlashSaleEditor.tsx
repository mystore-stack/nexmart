"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";
import { Plus, Trash2 } from "lucide-react";

export function FlashSaleEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    title: section.sectionKey === "superDeals" ? "Super Deals" : "Vente Flash",
    subtitle: section.sectionKey === "superDeals" ? "Special promotions" : "Dépêchez-vous, les offres expirent bientôt!",
    features: [
      { icon: "Tag", title: "Prix exclusifs", desc: "Jusqu'à -30% sur vos produits préférés" },
      { icon: "Shield", title: "Garantie 1 an", desc: "Tous nos produits sont garantis" },
      { icon: "Truck", title: "Livraison rapide", desc: "Disponible partout au Maroc" },
    ],
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

  const addFeature = () => {
    setConfig({
      ...config,
      features: [...(config.features || []), { icon: "Star", title: "", desc: "" }]
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(config.features || [])];
    newFeatures.splice(index, 1);
    setConfig({ ...config, features: newFeatures });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...(config.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setConfig({ ...config, features: newFeatures });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Flash Sale Configuration</h3>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="bg-card p-6 rounded-2xl border space-y-6">
          <h4 className="font-semibold text-lg border-b pb-2">Timer Configuration</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">End Date/Time (Countdown Target)</label>
              <input 
                type="datetime-local" 
                value={config.endDate || ""}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f2effd] p-6 rounded-2xl border border-[#d6cbf5] mt-6 space-y-6">
          <h4 className="font-semibold text-lg text-[#5f48e6] border-b border-[#d6cbf5] pb-2">Sidebar Features</h4>
          <div className="space-y-4">
            {(config.features || []).map((feat: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="w-1/4">
                  <label className="block text-xs font-medium mb-1">Icon Type</label>
                  <select 
                    value={feat.icon}
                    onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-slate-50"
                  >
                    <option value="Tag">Tag</option>
                    <option value="Shield">Shield</option>
                    <option value="Truck">Truck</option>
                    <option value="Star">Star</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Title</label>
                    <input 
                      type="text" 
                      value={feat.title}
                      onChange={(e) => updateFeature(idx, "title", e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input 
                      type="text" 
                      value={feat.desc}
                      onChange={(e) => updateFeature(idx, "desc", e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
                <button onClick={() => removeFeature(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg mt-5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addFeature} className="flex items-center gap-2 text-sm font-medium text-[#5f48e6] hover:underline">
              <Plus className="w-4 h-4" /> Add Feature
            </button>
          </div>
        </div>

        <div className="bg-[#eefaf3] p-6 rounded-2xl border border-[#c1ebd3] mt-6 space-y-6">
          <h4 className="font-semibold text-lg text-[#1f8755] border-b border-[#c1ebd3] pb-2">Gift Configuration (Bottom Bar)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Gift Title</label>
              <input 
                type="text" 
                value={config.giftTitle || ""}
                onChange={(e) => setConfig({ ...config, giftTitle: e.target.value })}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gift Image URL</label>
              <input 
                type="text" 
                value={config.giftImage || ""}
                onChange={(e) => setConfig({ ...config, giftImage: e.target.value })}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Gift Description</label>
              <input 
                type="text" 
                value={config.giftDescription || ""}
                onChange={(e) => setConfig({ ...config, giftDescription: e.target.value })}
                className="w-full border rounded-lg p-2 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-xl font-semibold mb-4">Flash Sale Products</h3>
        <ProductSelector 
          sectionKey={section.sectionKey} 
          maxProducts={section.maxProducts || 8}
          initialProducts={section.products || []}
        />
      </div>
    </div>
  );
}
