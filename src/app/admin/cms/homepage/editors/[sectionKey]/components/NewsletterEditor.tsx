"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";

export function NewsletterEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(parsedConfig || {
    eyebrow: "Newsletter exclusive",
    title: "Les meilleures offres, avant tout le monde.",
    description: "Offres personnalisées, alertes de prix, tendances et promotions exclusives.",
    placeholder: "Votre adresse email",
    buttonText: "S'abonner"
  });

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, config);
      router.refresh();
    });
  };

  const updateField = (field: string, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Newsletter Configuration</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 font-medium">Eyebrow (Sur-titre)</label>
          <input 
            type="text" 
            value={config.eyebrow || ""} 
            onChange={(e) => updateField("eyebrow", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Title</label>
          <input 
            type="text" 
            value={config.title || ""} 
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1 font-medium">Description</label>
          <textarea 
            value={config.description || ""} 
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Input Placeholder</label>
          <input 
            type="text" 
            value={config.placeholder || ""} 
            onChange={(e) => updateField("placeholder", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Button Text</label>
          <input 
            type="text" 
            value={config.buttonText || ""} 
            onChange={(e) => updateField("buttonText", e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
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
