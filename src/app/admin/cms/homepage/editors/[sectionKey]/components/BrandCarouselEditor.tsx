"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Plus, Trash2 } from "lucide-react";

export function BrandCarouselEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brands, setBrands] = useState<any[]>(parsedConfig.brands || []);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, { ...parsedConfig, brands });
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
        <h3 className="text-xl font-semibold">Brand Carousel</h3>
        <button onClick={addBrand} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="space-y-4">
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
          <p className="text-muted-foreground text-center py-8 border border-dashed rounded-xl">No brands configured.</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Brand Configuration"}
        </button>
      </div>
    </div>
  );
}
