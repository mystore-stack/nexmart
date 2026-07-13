"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Settings,
  Plus,
  Save,
  Undo2,
  Redo2,
  BarChart3,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export interface HomepageSection {
  id: string;
  type: string;
  title?: string;
  displayOrder: number;
  isVisible: boolean;
  config: Record<string, any>;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

interface SectionManagerProps {
  sections: HomepageSection[];
  onSectionsChange: (sections: HomepageSection[]) => void;
  onEditSection: (section: HomepageSection) => void;
  onDeleteSection: (sectionId: string) => void;
  isLoading?: boolean;
  onSave?: () => Promise<void>;
}

const SECTION_TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  HERO: { label: "Hero Banner", color: "bg-blue-500", icon: "🎯" },
  FEATURED_PRODUCTS: { label: "Featured Products", color: "bg-purple-500", icon: "⭐" },
  CATEGORIES: { label: "Categories", color: "bg-green-500", icon: "📁" },
  FLASH_DEALS: { label: "Flash Deals", color: "bg-red-500", icon: "⚡" },
  NEW_ARRIVALS: { label: "New Arrivals", color: "bg-cyan-500", icon: "🆕" },
  TESTIMONIALS: { label: "Testimonials", color: "bg-yellow-500", icon: "💬" },
  NEWSLETTER: { label: "Newsletter", color: "bg-indigo-500", icon: "📧" },
  CUSTOM_HTML: { label: "Custom HTML", color: "bg-gray-500", icon: "💻" },
  AI_RECOMMENDATIONS: { label: "AI Recommendations", color: "bg-pink-500", icon: "🤖" },
};

export function SectionManager({
  sections,
  onSectionsChange,
  onEditSection,
  onDeleteSection,
  isLoading = false,
  onSave,
}: SectionManagerProps) {
  const [history, setHistory] = useState<HomepageSection[][]>([sections]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newSections = Array.from(sections);
    const [draggedSection] = newSections.splice(source.index, 1);
    newSections.splice(destination.index, 0, draggedSection);

    // Update display order
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      displayOrder: index,
    }));

    onSectionsChange(updatedSections);
    updateHistory(updatedSections);
    toast.success("Section reordered");
  }, [sections, onSectionsChange]);

  const updateHistory = (newSections: HomepageSection[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onSectionsChange(history[newIndex]);
      toast.success("Undo successful");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onSectionsChange(history[newIndex]);
      toast.success("Redo successful");
    }
  };

  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, isVisible: !section.isVisible }
        : section
    );
    onSectionsChange(updatedSections);
    updateHistory(updatedSections);
  };

  const handleDuplicate = (section: HomepageSection) => {
    const newSection: HomepageSection = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      displayOrder: sections.length,
    };
    const updatedSections = [...sections, newSection];
    onSectionsChange(updatedSections);
    updateHistory(updatedSections);
    toast.success("Section duplicated");
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave();
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getConversionRate = (section: HomepageSection) => {
    if (!section.clicks || section.clicks === 0) return 0;
    return ((section.conversions || 0) / section.clicks * 100).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-background border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className="gap-2"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {sections.length} sections
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || isLoading}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections-list">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 transition-colors ${
                snapshot.isDraggingOver ? "bg-muted/50 rounded-lg p-4" : ""
              }`}
            >
              <AnimatePresence>
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-card border border-border rounded-lg p-4 transition-all ${
                          snapshot.isDragging
                            ? "shadow-lg scale-105 bg-muted"
                            : "hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* Section Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${SECTION_TYPE_LABELS[section.type]?.color || "bg-gray-500"}`}>
                                {SECTION_TYPE_LABELS[section.type]?.label || section.type}
                              </div>
                              {section.title && (
                                <span className="text-sm font-medium text-foreground truncate">
                                  {section.title}
                                </span>
                              )}
                            </div>
                            {(section.impressions !== undefined || section.clicks !== undefined) && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {section.impressions !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {section.impressions.toLocaleString()} views
                                  </span>
                                )}
                                {section.clicks !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {section.clicks.toLocaleString()} clicks
                                  </span>
                                )}
                                {section.conversions !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" />
                                    {getConversionRate(section)}% conversion
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleVisibility(section.id)
                              }
                              title={section.isVisible ? "Hide" : "Show"}
                            >
                              {section.isVisible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditSection(section)}
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(section)}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteSection(section.id)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No sections added yet</p>
          <Button
            onClick={() => {
              // This would typically open an "add section" dialog
              toast.info("Add Section dialog would open here");
            }}
          >
            Add First Section
          </Button>
        </div>
      )}
    </div>
  );
}
