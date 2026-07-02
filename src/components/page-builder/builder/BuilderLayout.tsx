"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BuilderSidebar } from "./BuilderSidebar";
import { PreviewFrame } from "./PreviewFrame";
import { InspectorPanel } from "./InspectorPanel";
import { Toolbar } from "./Toolbar";
import type { PageBuilderPage, PageSection } from "@prisma/client";

interface BuilderLayoutProps {
  page: PageBuilderPage & { sections: PageSection[] };
  onSave: (page: PageBuilderPage & { sections: PageSection[] }) => Promise<void>;
  onPublish: (page: PageBuilderPage & { sections: PageSection[] }) => Promise<void>;
}

export function BuilderLayout({ page, onSave, onPublish }: BuilderLayoutProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [sections, setSections] = useState(page.sections);
  
  // Undo/Redo state
  const [history, setHistory] = useState<PageSection[][]>([page.sections]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addToHistory = (newSections: PageSection[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
      setSections(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
      setSections(history[historyIndex + 1]);
    }
  };

  const handlePreview = () => {
    window.open(`/${page.slug}`, '_blank');
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave({ ...page, sections });
      }
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + Y: Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + P: Preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePreview();
      }
      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedSectionId(null);
      }
      // Delete: Delete selected section
      if (e.key === 'Delete' && selectedSectionId) {
        handleSectionDelete(selectedSectionId);
      }
      // Ctrl/Cmd + D: Duplicate selected section
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedSectionId) {
        e.preventDefault();
        handleSectionDuplicate(selectedSectionId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sections, selectedSectionId, canUndo, canRedo, page, onSave]);

  const handleSectionUpdate = (updatedSection: PageSection) => {
    const newSections = sections.map(s => s.id === updatedSection.id ? updatedSection : s);
    setSections(newSections);
    addToHistory(newSections);
  };

  const handleSectionReorder = (newSections: PageSection[]) => {
    setSections(newSections);
    addToHistory(newSections);
  };

  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    const newSections = sections.map(s => s.id === sectionId ? { ...s, enabled } : s);
    setSections(newSections);
    addToHistory(newSections);
  };

  const handleSectionDelete = (sectionId: string) => {
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections(newSections);
    addToHistory(newSections);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  const handleSectionDuplicate = (sectionId: string) => {
    const sectionToDuplicate = sections.find(s => s.id === sectionId);
    if (sectionToDuplicate) {
      const newSection = {
        ...sectionToDuplicate,
        id: crypto.randomUUID(),
        displayOrder: sections.length,
      };
      const newSections = [...sections, newSection];
      setSections(newSections);
      addToHistory(newSections);
    }
  };

  const handleAddSection = (sectionType: string) => {
    const newSection: PageSection = {
      id: crypto.randomUUID(),
      pageId: page.id,
      sectionType: sectionType as any,
      displayOrder: sections.length,
      enabled: true,
      config: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      startDate: null,
      endDate: null,
      backgroundColor: null,
      spacing: "medium",
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    addToHistory(newSections);
    setSelectedSectionId(newSection.id);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar
        page={page}
        sections={sections}
        onSave={() => onSave({ ...page, sections })}
        onPublish={() => onPublish({ ...page, sections })}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onToggleInspector={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={handlePreview}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-r border-border bg-card"
            >
              <BuilderSidebar
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={setSelectedSectionId}
                onSectionUpdate={handleSectionUpdate}
                onSectionReorder={handleSectionReorder}
                onSectionToggle={handleSectionToggle}
                onSectionDelete={handleSectionDelete}
                onSectionDuplicate={handleSectionDuplicate}
                onAddSection={handleAddSection}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Preview */}
        <div className="flex-1 bg-muted/30 overflow-hidden">
          <PreviewFrame
            sections={sections}
            previewMode={previewMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
          />
        </div>

        {/* Right Inspector */}
        <AnimatePresence mode="wait">
          {!isInspectorCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-l border-border bg-card"
            >
              {selectedSection ? (
                <InspectorPanel
                  section={selectedSection}
                  onUpdate={handleSectionUpdate}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="text-sm">Select a section to edit</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
