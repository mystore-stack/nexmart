"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateSectionOrder, toggleSectionEnabled } from "./actions";
import { ArrowUp, ArrowDown, Settings, Eye, EyeOff, GripVertical } from "lucide-react";

export function SectionList({ initialSections }: { initialSections: any[] }) {
  const [sections, setSections] = useState(initialSections);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, enabled: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !enabled } : s))
    );
    startTransition(async () => {
      await toggleSectionEnabled(id, !enabled);
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    if (direction === "up" && index > 0) {
      const temp = newSections[index - 1];
      newSections[index - 1] = newSections[index];
      newSections[index] = temp;
    } else if (direction === "down" && index < newSections.length - 1) {
      const temp = newSections[index + 1];
      newSections[index + 1] = newSections[index];
      newSections[index] = temp;
    } else {
      return;
    }

    // Update display orders based on index
    const updated = newSections.map((s, i) => ({ ...s, displayOrder: i }));
    setSections(updated);

    startTransition(async () => {
      await updateSectionOrder(
        updated.map((s) => ({ id: s.id, displayOrder: s.displayOrder }))
      );
    });
  };

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
            section.enabled 
              ? "bg-gradient-to-r from-emerald-50/50 to-white border-emerald-200/50 hover:border-emerald-300 hover:shadow-lg" 
              : "bg-muted/30 border-muted/50 hover:border-muted"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <button
                disabled={index === 0 || isPending}
                onClick={() => handleMove(index, "up")}
                className="p-2 hover:bg-emerald-100 rounded-lg text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={index === sections.length - 1 || isPending}
                onClick={() => handleMove(index, "down")}
                className="p-2 hover:bg-emerald-100 rounded-lg text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3 bg-emerald-100/50 rounded-xl">
              <GripVertical className="w-5 h-5 text-emerald-600" />
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  {section.sectionKey}
                </span>
                <span className="mx-2">•</span>
                {section._count?.products || 0} Products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggle(section.id, section.enabled)}
              disabled={isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                section.enabled
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {section.enabled ? "Active" : "Hidden"}
            </button>

            <Link
              href={`/admin/cms/homepage/editors/${section.sectionKey}`}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-md"
            >
              <Settings className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
