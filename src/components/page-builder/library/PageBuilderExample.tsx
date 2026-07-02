"use client";

import React, { useState } from "react";
import { SectionLibraryModal, AddSectionButton, useSectionInsert } from "./index";
import type { PageSection } from "../types";

/**
 * Example integration of the Section Library with a Page Builder
 * 
 * This component demonstrates how to:
 * 1. Use the AddSectionButton to open the library
 * 2. Use the useSectionInsert hook to manage section insertion
 * 3. Handle section insertion with focus and settings panel
 * 
 * Usage:
 * ```tsx
 * <PageBuilderExample />
 * ```
 */
export function PageBuilderExample() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [settingsOpenFor, setSettingsOpenFor] = useState<string | null>(null);

  const { insertPosition, openLibraryAt, closeLibrary, insertSection } = useSectionInsert({
    onSectionInsert: (newSection, position) => {
      setSections((prev) => {
        const updated = [...prev];
        updated.splice(position, 0, newSection);
        // Update displayOrder for all sections
        return updated.map((section, index) => ({
          ...section,
          displayOrder: index,
        }));
      });
    },
    onSectionFocus: (sectionId) => {
      setFocusedSectionId(sectionId);
    },
    onSettingsOpen: (sectionId) => {
      setSettingsOpenFor(sectionId);
    },
  });

  const handleAddSection = (position: number) => {
    openLibraryAt(position);
    setIsLibraryOpen(true);
  };

  const handleInsert = (sectionId: string, config: any) => {
    insertSection(sectionId, config);
    setIsLibraryOpen(false);
  };

  const handleCloseLibrary = () => {
    closeLibrary();
    setIsLibraryOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Page Builder Example</h1>

        {/* Add Section Button */}
        <div className="mb-6">
          <AddSectionButton
            onClick={() => handleAddSection(sections.length)}
            label="Add Section"
            variant="primary"
          />
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No sections added yet. Click &quot;Add Section&quot; to start building.</p>
            </div>
          ) : (
            sections.map((section, index) => (
              <div
                key={section.id}
                id={`section-${section.id}`}
                className={`bg-white rounded-lg border-2 p-6 transition-all ${
                  focusedSectionId === section.id
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{section.sectionType}</h3>
                    <p className="text-sm text-gray-500">Order: {section.displayOrder}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddSection(index)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Insert Above
                    </button>
                    <button
                      onClick={() => setSettingsOpenFor(section.id)}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() =>
                        setSections((prev) => prev.filter((s) => s.id !== section.id))
                      }
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Settings Panel (simplified example) */}
                {settingsOpenFor === section.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Section Settings</h4>
                    <p className="text-sm text-gray-600">
                      Configure {section.sectionType} settings here.
                    </p>
                    <button
                      onClick={() => setSettingsOpenFor(null)}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      Close Settings
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Section Library Modal */}
        <SectionLibraryModal
          isOpen={isLibraryOpen}
          onClose={handleCloseLibrary}
          onInsert={handleInsert}
          insertPosition={insertPosition ?? undefined}
        />
      </div>
    </div>
  );
}
