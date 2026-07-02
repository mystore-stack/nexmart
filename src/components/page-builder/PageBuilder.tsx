"use client";

import React, { useState } from "react";
import { PageSectionRenderer } from "./PageSectionRenderer";
import { SectionLibraryModal, AddSectionButton, useSectionInsert } from "./library";
import { SectionSettingsPanel } from "./settings";
import { PreviewModes, PreviewContainer, type PreviewMode } from "./PreviewModes";
import { useDragAndDrop, useHistory, useAutoSave } from "./hooks";
import { Undo, Redo, Save, RefreshCw } from "lucide-react";
import type { PageSection, SectionConfig } from "./types";

interface PageBuilderProps {
  sections: PageSection[];
  onSectionsChange: (sections: PageSection[]) => void;
  onSave?: () => Promise<void> | void;
  enableAutoSave?: boolean;
  enableUndoRedo?: boolean;
  enableDragDrop?: boolean;
}

/**
 * Enterprise-grade Page Builder component with advanced features
 * 
 * Features:
 * - Add sections from library
 * - Edit section settings with live preview
 * - Visual drag-and-drop reordering
 * - Undo/redo history
 * - Auto-save with debouncing
 * - Live preview modes (Desktop, Laptop, Tablet, Mobile)
 * - Delete sections
 * - Toggle section visibility
 * 
 * Usage:
 * ```tsx
 * <PageBuilder
 *   sections={sections}
 *   onSectionsChange={setSections}
 *   onSave={handleSave}
 *   enableAutoSave={true}
 *   enableUndoRedo={true}
 *   enableDragDrop={true}
 * />
 * ```
 */
export function PageBuilder({
  sections,
  onSectionsChange,
  onSave,
  enableAutoSave = true,
  enableUndoRedo = true,
  enableDragDrop = true,
}: PageBuilderProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [settingsSectionId, setSettingsSectionId] = useState<string | null>(null);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  // History for undo/redo
  const { state: historySections, setState: setHistoryState, undo, redo, canUndo, canRedo } = useHistory<PageSection[]>(
    sections,
    { maxHistory: 50 }
  );

  // Auto-save
  const { saveStatus, hasUnsavedChanges, saveNow, isSaving } = useAutoSave<PageSection[]>({
    data: sections,
    onSave: async (data) => {
      if (onSave) {
        await onSave();
      }
    },
    debounceMs: 2000,
    enabled: enableAutoSave,
  });

  // Drag and drop
  const { dragState, getDraggableProps } = useDragAndDrop<PageSection>({
    items: sections,
    onReorder: onSectionsChange,
  });

  const { insertPosition, openLibraryAt, closeLibrary, insertSection } = useSectionInsert({
    onSectionInsert: (newSection, position) => {
      const updated = [...sections];
      updated.splice(position, 0, newSection);
      const newSections = updated.map((section, index) => ({
        ...section,
        displayOrder: index,
      }));
      onSectionsChange(newSections);
      if (enableUndoRedo) {
        setHistoryState(newSections, { type: "add", description: "Add section" });
      }
    },
    onSectionFocus: (sectionId) => {
      setFocusedSectionId(sectionId);
    },
    onSettingsOpen: (sectionId) => {
      setSettingsSectionId(sectionId);
    },
  });

  const handleAddSection = (position: number) => {
    openLibraryAt(position);
    setIsLibraryOpen(true);
  };

  const handleInsert = (sectionId: string, config: SectionConfig) => {
    insertSection(sectionId, config);
    setIsLibraryOpen(false);
  };

  const handleCloseLibrary = () => {
    closeLibrary();
    setIsLibraryOpen(false);
  };

  const handleSectionUpdate = (sectionId: string, config: Partial<SectionConfig>) => {
    const newSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, config: { ...section.config, ...config } }
        : section
    );
    onSectionsChange(newSections);
    if (enableUndoRedo) {
      setHistoryState(newSections, { type: "update", description: "Update section settings" });
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const newSections = sections.filter((section) => section.id !== sectionId);
    onSectionsChange(newSections);
    if (enableUndoRedo) {
      setHistoryState(newSections, { type: "delete", description: "Delete section" });
    }
    if (settingsSectionId === sectionId) {
      setSettingsSectionId(null);
    }
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index < 0) return;

    const newSections = [...sections];
    if (direction === "up" && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === "down" && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }

    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      displayOrder: index,
    }));
    onSectionsChange(reorderedSections);
    if (enableUndoRedo) {
      setHistoryState(reorderedSections, { type: "move", description: "Move section" });
    }
  };

  const handleToggleSection = (sectionId: string) => {
    const newSections = sections.map((section) =>
      section.id === sectionId ? { ...section, enabled: !section.enabled } : section
    );
    onSectionsChange(newSections);
    if (enableUndoRedo) {
      setHistoryState(newSections, { type: "update", description: "Toggle section visibility" });
    }
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      onSectionsChange(previousState);
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      onSectionsChange(nextState);
    }
  };

  const handleSaveNow = async () => {
    await saveNow();
  };

  const settingsSection = sections.find((section) => section.id === settingsSectionId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
            <p className="text-sm text-gray-500">{sections.length} section{sections.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {enableUndoRedo && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
            )}
            <PreviewModes currentMode={previewMode} onModeChange={setPreviewMode} />
            {enableAutoSave && (
              <div className="flex items-center gap-2 text-sm">
                {isSaving && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === "saved" && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Save className="w-4 h-4" />
                    <span>Saved</span>
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="text-red-600">Save failed</div>
                )}
              </div>
            )}
            <AddSectionButton
              onClick={() => handleAddSection(sections.length)}
              label="Add Section"
              variant="primary"
            />
            {onSave && (
              <button
                onClick={handleSaveNow}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Page
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <PreviewContainer mode={previewMode}>
            {sections.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Start Building Your Page</h2>
                <p className="text-gray-500 mb-8">
                  Add sections from the library to create your custom page layout.
                </p>
                <AddSectionButton
                  onClick={() => handleAddSection(0)}
                  label="Add Your First Section"
                  variant="primary"
                  size="lg"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  {...(enableDragDrop ? getDraggableProps(index) : {})}
                  className={`relative group bg-white rounded-xl border-2 transition-all ${
                    focusedSectionId === section.id
                      ? "border-primary-500 ring-2 ring-primary-200"
                      : dragState.isDragging && dragState.draggedIndex === index
                      ? "border-primary-500 opacity-50"
                      : dragState.draggedOverIndex === index
                      ? "border-primary-400 border-dashed"
                      : section.enabled
                      ? "border-gray-200 hover:border-gray-300"
                      : "border-gray-200 opacity-50"
                  }`}
                >
                  {/* Section Controls */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {enableDragDrop && (
                      <div className="p-2 bg-white border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50" title="Drag to reorder">
                        ⋮⋮
                      </div>
                    )}
                    {!enableDragDrop && (
                      <>
                        <button
                          onClick={() => handleMoveSection(section.id, "up")}
                          disabled={index === 0}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveSection(section.id, "down")}
                          disabled={index === sections.length - 1}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleToggleSection(section.id)}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      title={section.enabled ? "Disable" : "Enable"}
                    >
                      {section.enabled ? "👁" : "👁‍🗨"}
                    </button>
                    <button
                      onClick={() => setSettingsSectionId(section.id)}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      title="Settings"
                    >
                      ⚙
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>

                  {/* Insert Above Button */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => handleAddSection(index)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full hover:bg-primary-700 shadow-lg"
                    >
                      + Insert Above
                    </button>
                  </div>

                  {/* Section Content */}
                  <div className={section.enabled ? "" : "pointer-events-none"}>
                    <PageSectionRenderer section={section} />
                  </div>

                  {/* Section Label */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {section.sectionType}
                  </div>
                </div>
              ))}

              {/* Add Section at Bottom */}
              <div className="flex justify-center py-4">
                <AddSectionButton
                  onClick={() => handleAddSection(sections.length)}
                  label="Add Section"
                  variant="secondary"
                />
              </div>
            </div>
          )}
          </PreviewContainer>
        </div>

        {/* Settings Panel */}
        {settingsSection && (
          <SectionSettingsPanel
            section={settingsSection}
            isOpen={!!settingsSectionId}
            onClose={() => setSettingsSectionId(null)}
            onUpdate={handleSectionUpdate}
          />
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
  );
}
