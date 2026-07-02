"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@hello-pangea/dnd";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";

interface Section {
  id: string;
  sectionType: string;
  enabled: boolean;
  displayOrder: number;
  config: any;
}

interface DragDropBuilderProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionDuplicate: (sectionId: string) => void;
  onAddSection: (sectionType: string) => void;
  availableSectionTypes: { type: string; label: string; icon: string }[];
}

export function DragDropBuilder({
  sections,
  onSectionsChange,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onAddSection,
  availableSectionTypes,
}: DragDropBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);

        const newSections = [...sections];
        const [movedSection] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, movedSection);

        // Update displayOrder
        newSections.forEach((section, index) => {
          section.displayOrder = index;
        });

        onSectionsChange(newSections);
        triggerAutoSave();
      }
    },
    [sections, onSectionsChange]
  );

  const triggerAutoSave = useCallback(() => {
    setIsAutoSaving(true);
    setTimeout(() => setIsAutoSaving(false), 1000);
  }, []);

  const toggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleToggleEnabled = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        onSectionUpdate(sectionId, { enabled: !section.enabled });
        triggerAutoSave();
      }
    },
    [sections, onSectionUpdate, triggerAutoSave]
  );

  const getSectionIcon = (sectionType: string) => {
    const type = availableSectionTypes.find((t) => t.type === sectionType);
    return type?.icon || "Layout";
  };

  const getSectionLabel = (sectionType: string) => {
    const type = availableSectionTypes.find((t) => t.type === sectionType);
    return type?.label || sectionType;
  };

  return (
    <div className="drag-drop-builder">
      {/* Section Library */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Section</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableSectionTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => onAddSection(type.type)}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2">
          {sections.map((section, index) => (
            <SectionItem
              key={section.id}
              section={section}
              index={index}
              isCollapsed={collapsedSections.has(section.id)}
              onToggleCollapse={toggleCollapse}
              onToggleEnabled={handleToggleEnabled}
              onUpdate={onSectionUpdate}
              onDelete={onSectionDelete}
              onDuplicate={onSectionDuplicate}
              getSectionIcon={getSectionIcon}
              getSectionLabel={getSectionLabel}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg">
              {getSectionLabel(
                sections.find((s) => s.id === activeId)?.sectionType || ""
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm">Saving...</span>
        </div>
      )}
    </div>
  );
}

interface SectionItemProps {
  section: Section;
  index: number;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Section>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  getSectionIcon: (type: string) => string;
  getSectionLabel: (type: string) => string;
}

function SectionItem({
  section,
  index,
  isCollapsed,
  onToggleCollapse,
  onToggleEnabled,
  onUpdate,
  onDelete,
  onDuplicate,
  getSectionIcon,
  getSectionLabel,
}: SectionItemProps) {
  return (
    <div
      id={section.id}
      className={`bg-white border rounded-lg transition-all ${
        section.enabled ? "border-gray-200" : "border-gray-300 opacity-60"
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        <button
          onClick={() => onToggleCollapse(section.id)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {index + 1}. {getSectionLabel(section.sectionType)}
            </span>
            {!section.enabled && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Hidden
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleEnabled(section.id)}
            className="p-2 hover:bg-gray-100 rounded"
            title={section.enabled ? "Hide" : "Show"}
          >
            {section.enabled ? (
              <Eye className="w-4 h-4 text-gray-500" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <button
            onClick={() => onDuplicate(section.id)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>

          <button
            onClick={() => onDelete(section.id)}
            className="p-2 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>

          <button
            onClick={() => onUpdate(section.id, {})}
            className="p-2 hover:bg-gray-100 rounded"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Section Preview (collapsed) */}
      {!isCollapsed && (
        <div className="p-4 bg-gray-50 min-h-[100px]">
          <div className="text-sm text-gray-500 mb-2">Preview</div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-xs text-gray-400">
              Section content preview would render here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
