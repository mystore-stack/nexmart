"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Layout,
  Megaphone,
  Tag,
  Zap,
  Package,
  Star,
  TrendingUp,
  Sparkles,
  Award,
  MessageSquare,
  Mail,
  Layers,
  Shield,
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageSection } from "@prisma/client";
import { SECTION_DEFINITIONS } from "@/components/page-builder/library/section-library";

const SECTION_ICONS: Record<string, any> = {
  ANNOUNCEMENT_BAR: Megaphone,
  HERO: Layout,
  CATEGORIES: Layers,
  FLASH_SALE: Zap,
  PROMOTIONAL_BANNER: Megaphone,
  FEATURED_PRODUCTS: Package,
  BEST_SELLERS: Star,
  TRENDING: TrendingUp,
  NEW_ARRIVALS: Sparkles,
  BRANDS: Award,
  TESTIMONIALS: MessageSquare,
  NEWSLETTER: Mail,
  FOOTER: Settings,
  BENEFITS: Shield,
};

const SECTION_NAMES: Record<string, string> = {
  ANNOUNCEMENT_BAR: "Announcement Bar",
  HERO: "Hero Banner",
  CATEGORIES: "Featured Categories",
  FLASH_SALE: "Flash Sale",
  PROMOTIONAL_BANNER: "Promo Banner",
  FEATURED_PRODUCTS: "Featured Products",
  BEST_SELLERS: "Best Sellers",
  TRENDING: "Trending",
  NEW_ARRIVALS: "New Arrivals",
  BRANDS: "Brands",
  TESTIMONIALS: "Testimonials",
  NEWSLETTER: "Newsletter",
  FOOTER: "Footer",
  BENEFITS: "Benefits",
};

interface SectionCardProps {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SectionCard({ section, isSelected, onSelect, onToggle, onDelete, onDuplicate }: SectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = SECTION_ICONS[section.sectionType] || Settings;
  const sectionName = SECTION_NAMES[section.sectionType] || section.sectionType;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={(e: React.MouseEvent) => {
        if (!(e.target as HTMLElement).closest("button")) {
          onSelect();
        }
      }}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{sectionName}</h4>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(!section.enabled);
            }}
            className="p-1.5 hover:bg-muted rounded-lg"
            title={section.enabled ? "Hide" : "Show"}
          >
            {section.enabled ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 hover:bg-muted rounded-lg"
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-muted rounded-lg text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Disabled indicator */}
      {!section.enabled && (
        <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-medium">Hidden</span>
        </div>
      )}
    </div>
  );
}

interface BuilderSidebarProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onSectionUpdate: (section: PageSection) => void;
  onSectionReorder: (sections: PageSection[]) => void;
  onSectionToggle: (id: string, enabled: boolean) => void;
  onSectionDelete: (id: string) => void;
  onSectionDuplicate: (id: string) => void;
  onAddSection: (sectionType: string) => void;
}

export function BuilderSidebar({
  sections,
  selectedSectionId,
  onSelectSection,
  onSectionUpdate,
  onSectionReorder,
  onSectionToggle,
  onSectionDelete,
  onSectionDuplicate,
  onAddSection,
}: BuilderSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showSectionLibrary, setShowSectionLibrary] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredSections = sections.filter((section) =>
    SECTION_NAMES[section.sectionType]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = [...sections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);
      onSectionReorder(newSections);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sections</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-lg"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Section List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {filteredSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => onSelectSection(section.id)}
                    onToggle={(enabled) => onSectionToggle(section.id, enabled)}
                    onDelete={() => onSectionDelete(section.id)}
                    onDuplicate={() => onSectionDuplicate(section.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {filteredSections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No sections found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Section Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setShowSectionLibrary(true)}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Section Library Modal */}
      <AnimatePresence>
        {showSectionLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSectionLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-semibold">Add Section</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a section to add to your homepage</p>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SECTION_DEFINITIONS.map((sectionDef) => {
                    const Icon = SECTION_ICONS[sectionDef.id.toUpperCase()] || Layout;
                    return (
                      <button
                        key={sectionDef.id}
                        onClick={() => {
                          onAddSection(sectionDef.id.toUpperCase());
                          setShowSectionLibrary(false);
                        }}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{sectionDef.name}</h4>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{sectionDef.description}</p>
                        {sectionDef.popular && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Popular</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
