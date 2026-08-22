"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Plus, Trash2 } from "lucide-react";

export function PromoCardsEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cards, setCards] = useState<any[]>(parsedConfig.cards || []);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, { ...parsedConfig, cards });
      router.refresh();
    });
  };

  const addCard = () => {
    setCards([...cards, { id: Date.now().toString(), title: "New Promo", subtitle: "", image: "", href: "/", cta: "Acheter" }]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Promotional Cards</h3>
        <button onClick={addCard} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
          <Plus className="w-4 h-4" /> Add Promo Card
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div key={card.id} className="p-4 border rounded-xl bg-card space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Card {index + 1}</span>
              <button onClick={() => removeCard(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input 
                  type="text" 
                  value={card.title || ""} 
                  onChange={(e) => updateCard(index, "title", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Subtitle</label>
                <input 
                  type="text" 
                  value={card.subtitle || ""} 
                  onChange={(e) => updateCard(index, "subtitle", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Background Image URL</label>
                <input 
                  type="text" 
                  value={card.image || ""} 
                  onChange={(e) => updateCard(index, "image", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Background Color (Hex)</label>
                <input 
                  type="text" 
                  value={card.bgColor || ""} 
                  onChange={(e) => updateCard(index, "bgColor", e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="#000000"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Destination URL</label>
                <input 
                  type="text" 
                  value={card.href || ""} 
                  onChange={(e) => updateCard(index, "href", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Button Text (CTA)</label>
                <input 
                  type="text" 
                  value={card.cta || ""} 
                  onChange={(e) => updateCard(index, "cta", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-muted-foreground text-center py-8 border border-dashed rounded-xl">No promotional cards configured.</p>
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
