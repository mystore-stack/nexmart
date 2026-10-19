"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Smartphone,
  Monitor,
  Tablet,
  Undo2,
  Redo2,
  Save,
  Play,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  PanelLeft,
  PanelRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Layers,
  FileText,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Trash2,
  GripVertical,
  LayoutDashboard,
  Palette,
  History,
  Grid,
  Award,
  Zap,
  ShoppingBag,
  Tag,
  Gift,
  Bell,
  Compass,
} from "lucide-react";
import { MobilePhoneCanvas } from "./MobilePhoneCanvas";
import { MobileMediaLibraryModal } from "./MobileMediaLibraryModal";

// Types
export type ViewportMode = "mobile" | "tablet" | "desktop";
export type StudioPanel = "tree" | "properties" | "both" | "none";
export type SaveStatus = "clean" | "dirty" | "saving" | "saved" | "error";

export interface ValidationError {
  field: string;
  message: string;
}

export interface SectionTreeItem {
  id: string;
  sectionKey: string;
  titleFr: string;
  titleAr?: string | null;
  order: number;
  active: boolean;
  type: string;
  config?: any;
  children?: SectionTreeItem[];
}

export interface StudioState {
  selectedSection: SectionTreeItem | null;
  viewportMode: ViewportMode;
  panelMode: StudioPanel;
  saveStatus: SaveStatus;
  hasUnsavedChanges: boolean;
  searchQuery: string;
  filterStatus: "all" | "active" | "inactive";
  isPreviewMode: boolean;
  undoStack: any[];
  redoStack: any[];
}

interface CmsStudioShellProps {
  sections: SectionTreeItem[];
  categories: any[];
  brands: any[];
  products: any[];
  onSectionSelect: (section: SectionTreeItem | null) => void;
  onSectionToggleActive: (section: SectionTreeItem) => void;
  onSectionMove: (index: number, direction: "up" | "down") => void;
  onSectionDelete: (section: SectionTreeItem) => void;
  onSectionDuplicate: (section: SectionTreeItem) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onRefresh: () => Promise<void>;
  renderSectionEditor: (section: SectionTreeItem) => React.ReactNode;
  renderPropertiesPanel: (section: SectionTreeItem) => React.ReactNode;
  onOpenAddSectionModal?: () => void;
  onOpenTokensModal?: () => void;
  onOpenRevisionsModal?: () => void;
  isLoading?: boolean;
}

export function CmsStudioShell({
  sections,
  categories,
  brands,
  products,
  onSectionSelect,
  onSectionToggleActive,
  onSectionMove,
  onSectionDelete,
  onSectionDuplicate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onPublish,
  onRefresh,
  renderSectionEditor,
  renderPropertiesPanel,
  onOpenAddSectionModal,
  onOpenTokensModal,
  onOpenRevisionsModal,
  isLoading = false,
}: CmsStudioShellProps) {
  const [state, setState] = useState<StudioState>({
    selectedSection: null,
    viewportMode: "mobile",
    panelMode: "both",
    saveStatus: "clean",
    hasUnsavedChanges: false,
    searchQuery: "",
    filterStatus: "all",
    isPreviewMode: false,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTargetId, setMediaTargetId] = useState<string>("");

  // Handle selection
  const handleSectionSelect = useCallback((section: SectionTreeItem | null) => {
    setState((prev) => ({
      ...prev,
      selectedSection: section,
      hasUnsavedChanges: true,
      saveStatus: "dirty",
    }));
    onSectionSelect(section);
  }, [onSectionSelect]);

  // Handle drag and drop reordering
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (fromIndex === targetIndex || fromIndex < 0 || fromIndex >= sections.length) return;

    // Determine direction and call the move handler with the fromIndex
    const direction = fromIndex < targetIndex ? "down" : "up";
    onSectionMove(fromIndex, direction);
  }, [sections, onSectionMove]);

  // Handle save
  const handleSave = useCallback(async () => {
    setState((prev) => ({ ...prev, saveStatus: "saving" }));
    try {
      await onSave();
      setState((prev) => ({ ...prev, saveStatus: "saved", hasUnsavedChanges: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, saveStatus: "error" }));
    }
  }, [onSave]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    try {
      await onPublish();
      setState((prev) => ({ ...prev, saveStatus: "saved", hasUnsavedChanges: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, saveStatus: "error" }));
    }
  }, [onPublish]);

  // Toggle panel
  const togglePanel = useCallback((panel: "left" | "right") => {
    setState((prev) => {
      if (panel === "left") {
        if (prev.panelMode === "both") return { ...prev, panelMode: "right" };
        if (prev.panelMode === "right") return { ...prev, panelMode: "none" };
        if (prev.panelMode === "none") return { ...prev, panelMode: "right" };
        return { ...prev, panelMode: "both" };
      } else {
        if (prev.panelMode === "both") return { ...prev, panelMode: "left" };
        if (prev.panelMode === "left") return { ...prev, panelMode: "none" };
        if (prev.panelMode === "none") return { ...prev, panelMode: "left" };
        return { ...prev, panelMode: "both" };
      }
    });
  }, []);

  // Filter sections
  const filteredSections = sections.filter((section) => {
    const matchesSearch = !state.searchQuery ||
      [section.titleFr, section.titleAr, section.sectionKey, section.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(state.searchQuery.toLowerCase()));

    const matchesFilter = state.filterStatus === "all" ||
      (state.filterStatus === "active" && section.active) ||
      (state.filterStatus === "inactive" && !section.active);

    return matchesSearch && matchesFilter;
  });

  // Get section type metadata
  const getSectionTypeMetadata = (type: string) => {
    const typeLower = (type || "").toLowerCase();
    if (typeLower.includes("hero")) return { icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-50", label: "Hero Carousel" };
    if (typeLower.includes("custom-banner") || typeLower.includes("custombanner")) return { icon: Tag, color: "text-emerald-700", bgColor: "bg-emerald-50", label: "Bannière Spéciale" };
    if (typeLower.includes("category")) return { icon: Grid, color: "text-blue-600", bgColor: "bg-blue-50", label: "Catégories" };
    if (typeLower.includes("brand")) return { icon: Award, color: "text-amber-600", bgColor: "bg-amber-50", label: "Marques" };
    if (typeLower.includes("flash")) return { icon: Zap, color: "text-red-600", bgColor: "bg-red-50", label: "Vente Flash" };
    if (typeLower.includes("product")) return { icon: ShoppingBag, color: "text-indigo-600", bgColor: "bg-indigo-50", label: "Produits" };
    if (typeLower.includes("offer") || typeLower.includes("grouped")) return { icon: Layers, color: "text-pink-600", bgColor: "bg-pink-50", label: "Offres" };
    if (typeLower.includes("coupon")) return { icon: Tag, color: "text-teal-600", bgColor: "bg-teal-50", label: "Coupons" };
    if (typeLower.includes("gift")) return { icon: Gift, color: "text-violet-600", bgColor: "bg-violet-50", label: "Cadeaux" };
    if (typeLower.includes("popup") || typeLower.includes("welcome")) return { icon: Bell, color: "text-orange-600", bgColor: "bg-orange-50", label: "Popup" };
    if (typeLower.includes("journey")) return { icon: Compass, color: "text-cyan-600", bgColor: "bg-cyan-50", label: "Parcours" };
    if (typeLower.includes("nexplay")) return { icon: Award, color: "text-yellow-600", bgColor: "bg-yellow-50", label: "NexPlay" };
    return { icon: Settings, color: "text-slate-600", bgColor: "bg-slate-50", label: "Section" };
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5">
            <Smartphone className="h-4 w-4 text-emerald-800" />
            <span className="text-sm font-bold text-emerald-950">NexMart Mobile CMS</span>
            <span className="rounded-md bg-emerald-800 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
              Super Admin
            </span>
          </div>

          {onOpenTokensModal && (
            <button
              type="button"
              onClick={onOpenTokensModal}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-800 transition-all shadow-sm"
            >
              <Palette className="h-3.5 w-3.5 text-emerald-700" />
              Design & Thème
            </button>
          )}

          {onOpenRevisionsModal && (
            <button
              type="button"
              onClick={onOpenRevisionsModal}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-purple-400 hover:text-purple-800 transition-all shadow-sm"
            >
              <History className="h-3.5 w-3.5 text-purple-700" />
              Historique des Versions
            </button>
          )}

          {/* Draft Status */}
          <div className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
            state.saveStatus === "saved"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : state.saveStatus === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : state.saveStatus === "saving"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}>
            {state.saveStatus === "saved" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {state.saveStatus === "error" && <AlertCircle className="h-3.5 w-3.5" />}
            {state.saveStatus === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {state.saveStatus === "clean" && <span className="h-2 w-2 rounded-full bg-slate-400" />}
            {state.saveStatus === "dirty" && <span className="h-2 w-2 rounded-full bg-amber-500" />}
            {state.saveStatus === "saved" && "Enregistré"}
            {state.saveStatus === "error" && "Erreur"}
            {state.saveStatus === "saving" && "Enregistrement..."}
            {state.saveStatus === "clean" && "Aucun changement"}
            {state.saveStatus === "dirty" && "Modifications non enregistrées"}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              title="Annuler"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              title="Rétablir"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Selector */}
          <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, viewportMode: "mobile" }))}
              className={`rounded-md p-1.5 ${state.viewportMode === "mobile" ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"}`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, viewportMode: "tablet" }))}
              className={`rounded-md p-1.5 ${state.viewportMode === "tablet" ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"}`}
              title="Tablette"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, viewportMode: "desktop" }))}
              className={`rounded-md p-1.5 ${state.viewportMode === "desktop" ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"}`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${
              state.isPreviewMode
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {state.isPreviewMode ? "Mode aperçu" : "Mode édition"}
          </button>

          {/* Save & Publish */}
          <button
            type="button"
            onClick={handleSave}
            disabled={state.saveStatus === "saving" || !state.hasUnsavedChanges}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-50"
          >
            {state.saveStatus === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Enregistrer
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={state.saveStatus === "saving"}
            className="flex items-center gap-1.5 rounded-md bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Publier
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Section Tree */}
        {state.panelMode === "both" || state.panelMode === "left" ? (
          <aside className="flex w-72 flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-900">Sections</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePanel("left")}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  title="Masquer le panneau"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-2 border-b border-slate-200 p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={state.searchQuery}
                  onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="Rechercher..."
                  className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-700"
                />
              </div>
              <div className="flex gap-1">
                {["all", "active", "inactive"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, filterStatus: status as any }))}
                    className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold ${
                      state.filterStatus === status
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status === "all" ? "Toutes" : status === "active" ? "Actives" : "Inactives"}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Tree */}
            <div className="flex-1 overflow-y-auto">
              {filteredSections.map((section, index) => {
                const metadata = getSectionTypeMetadata(section.type);
                const isSelected = state.selectedSection?.id === section.id;
                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group flex items-center gap-2 border-b border-slate-100 px-3 py-2 hover:bg-slate-50 cursor-move ${
                      isSelected ? "bg-emerald-50" : ""
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-slate-400" />
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${metadata.bgColor}`}
                    >
                      <metadata.icon className={`h-4 w-4 ${metadata.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{section.titleFr}</p>
                      <p className="truncate text-xs text-slate-500">{metadata.label}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onSectionToggleActive(section)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200"
                        title={section.active ? "Masquer" : "Afficher"}
                      >
                        {section.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSectionDuplicate(section)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200"
                        title="Dupliquer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSectionDelete(section)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Section Button */}
            <div className="border-t border-slate-200 p-3">
              <button
                type="button"
                onClick={onOpenAddSectionModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2 text-xs font-bold text-emerald-800 hover:border-emerald-600 hover:bg-emerald-100/70 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Ajouter une section
              </button>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => togglePanel("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-md border border-l-0 border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
            title="Afficher le panneau"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* Center - Preview / Editor */}
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-100">
          {state.selectedSection ? (
            <div className="flex h-full flex-col">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSectionSelect(null)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{state.selectedSection.titleFr}</h3>
                    <p className="text-xs text-slate-500">{state.selectedSection.sectionKey}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ouvrir la page
                  </button>
                </div>
              </div>

              {/* Validation Error Area */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-red-900">Erreurs de validation</p>
                      <ul className="mt-1 space-y-0.5">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-xs text-red-700">
                            <span className="font-medium">{error.field}:</span> {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValidationErrors([])}
                      className="rounded-md p-1 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Editor or Preview */}
              <div className="flex-1 overflow-auto p-4">
                {state.isPreviewMode ? (
                  <div className="flex h-full items-center justify-center">
                    <div
                      className={`transition-all duration-300 ${
                        state.viewportMode === "mobile"
                          ? "w-[375px]"
                          : state.viewportMode === "tablet"
                          ? "w-[768px]"
                          : "w-full max-w-5xl"
                      }`}
                    >
                      <MobilePhoneCanvas
                        sections={[state.selectedSection]}
                        categories={categories}
                        brands={brands}
                        products={products}
                        onSelectSection={() => {}}
                        onToggleActive={() => {}}
                        onMoveSection={() => {}}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-4xl">
                    {renderSectionEditor(state.selectedSection)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <LayoutDashboard className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm font-semibold text-slate-600">Sélectionnez une section pour l'éditer</p>
                <p className="mt-1 text-xs text-slate-500">Ou utilisez le panneau de gauche pour naviguer</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Properties */}
        {state.panelMode === "both" || state.panelMode === "right" ? (
          <aside className="flex w-80 flex-col border-l border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-900">Propriétés</h2>
              <button
                type="button"
                onClick={() => togglePanel("right")}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                title="Masquer le panneau"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {state.selectedSection ? (
                renderPropertiesPanel(state.selectedSection)
              ) : (
                <div className="text-center text-sm text-slate-500">
                  Aucune section sélectionnée
                </div>
              )}
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => togglePanel("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-l-md border border-r-0 border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
            title="Afficher le panneau"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Media Library Modal */}
      {isMediaModalOpen && (
        <MobileMediaLibraryModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(image) => {
            // Handle image selection
            setMediaTargetId("");
            setIsMediaModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
