"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Plus, Trash2 } from "lucide-react";

export function BrandCarouselEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brands, setBrands] = useState<any[]>(parsedConfig.brands || []);
  const [title, setTitle] = useState<string>(parsedConfig.title || "");
  const [subtitle, setSubtitle] = useState<string>(parsedConfig.subtitle || "");
  const [badge, setBadge] = useState<string>(parsedConfig.badge || "");

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, {
        ...parsedConfig,
        title,
        subtitle,
        badge,
        brands,
      });
      router.refresh();
    });
  };

  const addBrand = () => {
    setBrands([...brands, { id: Date.now().toString(), name: "New Brand", logo: "" }]);
  };

  const removeBrand = (index: number) => {
    setBrands(brands.filter((_, i) => i !== index));
  };

  const updateBrand = (index: number, field: string, value: string) => {
    const newBrands = [...brands];
    newBrands[index] = { ...newBrands[index], [field]: value };
    setBrands(newBrands);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">3D Brand Showcase</h3>
        <button onClick={addBrand} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Custom Brand
        </button>
      </div>

      {/* Header Info Controls */}
      <div className="p-4 border rounded-xl bg-card space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Header Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Badge</label>
            <input
              type="text"
              placeholder="— NOS MARQUES VEDETTES —"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Title</label>
            <input
              type="text"
              placeholder="Les plus grandes marques, réunies pour vous"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Subtitle</label>
            <input
              type="text"
              placeholder="Qualité • Confiance • Meilleurs prix"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Custom Brands (Leave empty to use 16 standard showcase brands)</h4>
        {brands.map((brand, index) => (
          <div key={brand.id} className="p-4 border rounded-xl bg-card space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Brand {index + 1}</span>
              <button onClick={() => removeBrand(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Brand Name</label>
                <input 
                  type="text" 
                  value={brand.name || ""} 
                  onChange={(e) => updateBrand(index, "name", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Logo Image URL</label>
                <input 
                  type="text" 
                  value={brand.logo || ""} 
                  onChange={(e) => updateBrand(index, "logo", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}
        {brands.length === 0 && (
          <p className="text-muted-foreground text-center py-6 border border-dashed rounded-xl text-sm">
            Default mode active: Rendering Apple, Samsung, Xiaomi, Sony, JBL, LG, HP, Dell, Nike, Adidas, Puma, Lenovo, Canon, Bosch, Philips, Tefal in 3D presentation cards.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : "Save Brand Showcase Configuration"}
        </button>
      </div>
    </div>
  );
}

