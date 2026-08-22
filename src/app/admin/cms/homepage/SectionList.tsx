"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateSectionOrder, toggleSectionEnabled } from "./actions";
import { ArrowUp, ArrowDown, Settings, Eye, EyeOff } from "lucide-react";

export function SectionList({ initialSections }: { initialSections: any[] }) {
  const [sections, setSections] = useState(initialSections);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, active: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !active } : s))
    );
    startTransition(async () => {
      await toggleSectionEnabled(id, !active);
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
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={`flex items-center justify-between p-4 border rounded-xl shadow-sm ${
            section.active ? "bg-card" : "bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <button
                disabled={index === 0 || isPending}
                onClick={() => handleMove(index, "up")}
                className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-50"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={index === sections.length - 1 || isPending}
                onClick={() => handleMove(index, "down")}
                className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-50"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-lg">{section.title}</h3>
              <p className="text-sm text-muted-foreground">
                Type: {section.sectionKey} • {section._count?.products || 0} Products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggle(section.id, section.active)}
              disabled={isPending}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                section.active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {section.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {section.active ? "Active" : "Hidden"}
            </button>

            <Link
              href={`/admin/cms/homepage/editors/${section.sectionKey}`}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border bg-card text-sm font-medium hover:bg-muted"
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
