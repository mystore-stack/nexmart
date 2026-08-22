"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Plus, Trash2 } from "lucide-react";

export function ServiceBannersEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [banners, setBanners] = useState<any[]>(parsedConfig.banners || [
    { id: "1", title: "Livraison Gratuite", description: "Pour toute commande supérieure à 500 DH", icon: "Truck" },
    { id: "2", title: "Paiement Sécurisé", description: "Paiement 100% sécurisé à la livraison ou en ligne", icon: "ShieldCheck" },
    { id: "3", title: "Support Client", description: "Assistance 24/7 pour répondre à vos questions", icon: "HeadphonesIcon" },
  ]);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, { ...parsedConfig, banners });
      router.refresh();
    });
  };

  const addBanner = () => {
    setBanners([...banners, { id: Date.now().toString(), title: "New Service", description: "", icon: "Star" }]);
  };

  const removeBanner = (index: number) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const updateBanner = (index: number, field: string, value: string) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setBanners(newBanners);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Service Banners</h3>
        <button onClick={addBanner} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
          <Plus className="w-4 h-4" /> Add Service Feature
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div key={banner.id} className="p-4 border rounded-xl bg-card space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Service {index + 1}</span>
              <button onClick={() => removeBanner(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input 
                  type="text" 
                  value={banner.title || ""} 
                  onChange={(e) => updateBanner(index, "title", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Lucide Icon Name</label>
                <input 
                  type="text" 
                  value={banner.icon || ""} 
                  onChange={(e) => updateBanner(index, "icon", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1">Description</label>
                <input 
                  type="text" 
                  value={banner.description || ""} 
                  onChange={(e) => updateBanner(index, "description", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-muted-foreground text-center py-8 border border-dashed rounded-xl">No service banners configured.</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
