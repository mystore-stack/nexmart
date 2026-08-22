"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { ProductSelector } from "@/components/admin/ProductSelector";

export function BestMatchEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(parsedConfig.title || "Your best match");
  const [floatingImages, setFloatingImages] = useState<string[]>(
    parsedConfig.floatingImages || ["", "", ""]
  );
  
  // Need exactly 3 cards for this specific banner layout
  const initialCards = parsedConfig.cards?.length === 3 ? parsedConfig.cards : [
    { title: "Smart Watch", subtitle: "Health monitoring", price: "$75", image: "", href: "/products" },
    { title: "In-earphones", subtitle: "Audio equipment", price: "$245", image: "", href: "/products" },
    { title: "Chromebook", subtitle: "Productivity", price: "$55", image: "", href: "/products" }
  ];
  const [cards, setCards] = useState<any[]>(initialCards);
  const [useManualProducts, setUseManualProducts] = useState(parsedConfig.useManualProducts || false);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, { ...parsedConfig, title, floatingImages, cards, useManualProducts });
      router.refresh();
    });
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const updateFloatingImage = (index: number, value: string) => {
    const newImages = [...floatingImages];
    newImages[index] = value;
    setFloatingImages(newImages);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Best Match Banner Editor</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-xl bg-card">
          <label className="block text-sm font-medium mb-1">Main Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="p-4 border rounded-xl bg-card space-y-4">
          <h4 className="font-medium">Floating Images (Left Side)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => (
              <div key={`floating-${idx}`}>
                <label className="block text-xs mb-1">Image {idx + 1} URL</label>
                <input 
                  type="text" 
                  value={floatingImages[idx] || ""} 
                  onChange={(e) => updateFloatingImage(idx, e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium px-1">Product Cards (Right Side)</h4>
          {cards.map((card, index) => (
            <div key={`card-${index}`} className="p-4 border rounded-xl bg-card space-y-4">
              <span className="font-medium text-sm">Card {index + 1}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1">Title</label>
                  <input 
                    type="text" 
                    value={card.title || ""} 
                    onChange={(e) => updateCard(index, "title", e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Subtitle</label>
                  <input 
                    type="text" 
                    value={card.subtitle || ""} 
                    onChange={(e) => updateCard(index, "subtitle", e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Price</label>
                  <input 
                    type="text" 
                    value={card.price || ""} 
                    onChange={(e) => updateCard(index, "price", e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={card.image || ""} 
                    onChange={(e) => updateCard(index, "image", e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1">Destination URL</label>
                  <input 
                    type="text" 
                    value={card.href || ""} 
                    onChange={(e) => updateCard(index, "href", e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
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

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Trending Products</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox"
              checked={useManualProducts}
              onChange={(e) => setUseManualProducts(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Use Manual Product Selection</span>
          </label>
        </div>
        <div className={`bg-card p-6 rounded-2xl border space-y-6 ${!useManualProducts ? 'opacity-50 pointer-events-none' : ''}`}>
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
