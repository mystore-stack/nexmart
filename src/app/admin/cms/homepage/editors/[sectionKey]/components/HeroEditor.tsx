"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSectionConfig } from "../actions";
import { Plus, Trash2 } from "lucide-react";

export function HeroEditor({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slides, setSlides] = useState<any[]>(parsedConfig.slides || []);

  const handleSave = () => {
    startTransition(async () => {
      await updateSectionConfig(section.id, { ...parsedConfig, slides });
      router.refresh();
    });
  };

  const addSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), title: "New Slide", titleAccent: "", subtitle: "", eyebrow: "", image: "", cta: "Explorer", href: "", ctaSecondary: "", hrefSecondary: "" }]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Hero Slides</h3>
        <button onClick={addSlide} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="p-4 border rounded-xl bg-card space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Slide {index + 1}</span>
              <button onClick={() => removeSlide(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input 
                  type="text" 
                  value={slide.title || ""} 
                  onChange={(e) => updateSlide(index, "title", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Title Accent (2nd line)</label>
                <input 
                  type="text" 
                  value={slide.titleAccent || ""} 
                  onChange={(e) => updateSlide(index, "titleAccent", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1">Subtitle</label>
                <input 
                  type="text" 
                  value={slide.subtitle || ""} 
                  onChange={(e) => updateSlide(index, "subtitle", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Eyebrow (Small text on top)</label>
                <input 
                  type="text" 
                  value={slide.eyebrow || ""} 
                  onChange={(e) => updateSlide(index, "eyebrow", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={slide.image || ""} 
                  onChange={(e) => updateSlide(index, "image", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">CTA Text</label>
                <input 
                  type="text" 
                  value={slide.cta || ""} 
                  onChange={(e) => updateSlide(index, "cta", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">CTA Link</label>
                <input 
                  type="text" 
                  value={slide.href || ""} 
                  onChange={(e) => updateSlide(index, "href", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Secondary CTA Text</label>
                <input 
                  type="text" 
                  value={slide.ctaSecondary || ""} 
                  onChange={(e) => updateSlide(index, "ctaSecondary", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Secondary CTA Link</label>
                <input 
                  type="text" 
                  value={slide.hrefSecondary || ""} 
                  onChange={(e) => updateSlide(index, "hrefSecondary", e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <p className="text-muted-foreground text-center py-8 border border-dashed rounded-xl">No slides configured.</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Hero Configuration"}
        </button>
      </div>
    </div>
  );
}
