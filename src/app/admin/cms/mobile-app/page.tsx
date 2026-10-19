"use client";

// src/app/admin/cms/mobile-app/page.tsx
// NEXMART — Super Admin Mobile App Control Center

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CmsStudioShell, SectionTreeItem } from "@/components/admin/mobile-cms/CmsStudioShell";
import { MobileSectionContentEditor } from "@/components/admin/mobile-cms/MobileSectionContentEditor";
import { AddSectionModal, RegistrySectionType } from "@/components/admin/mobile-cms/AddSectionModal";
import { GlobalTokensModal } from "@/components/admin/mobile-cms/GlobalTokensModal";
import { RevisionsModal } from "@/components/admin/mobile-cms/RevisionsModal";

export interface MobileSection {
  id: string;
  sectionKey: string;
  titleFr: string;
  titleAr?: string | null;
  subtitleFr?: string | null;
  subtitleAr?: string | null;
  order: number;
  active: boolean;
  layoutType: string;
  bannerImage?: string | null;
  config?: any;
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  startAt?: string | null;
  endAt?: string | null;
  type?: string;
  createdAt: string;
  updatedAt: string;
  status?: "draft" | "published" | "scheduled";
}

export default function MobileAppCmsPage() {
  const [sections, setSections] = useState<SectionTreeItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SectionTreeItem | null>(null);
  const [undoStack, setUndoStack] = useState<SectionTreeItem[][]>([]);
  const [redoStack, setRedoStack] = useState<SectionTreeItem[][]>([]);

  // Modals state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isTokensOpen, setIsTokensOpen] = useState(false);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);

  // Load data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [secRes, catRes, brRes, prodRes] = await Promise.allSettled([
        fetch("/api/admin/cms/mobile-app").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/admin/brands").then((r) => r.json()),
        fetch("/api/products?limit=50").then((r) => r.json()),
      ]);

      if (secRes.status === "fulfilled" && secRes.value?.success) {
        const data = secRes.value.data || [];
        setSections(data);
        if (selectedSection) {
          const fresh = data.find((s: any) => s.id === selectedSection.id);
          if (fresh) setSelectedSection(fresh);
        }
      }
      if (catRes.status === "fulfilled" && catRes.value?.success) {
        setCategories(catRes.value.data || []);
      }
      if (brRes.status === "fulfilled" && brRes.value?.success) {
        setBrands(brRes.value.data || []);
      }
      if (prodRes.status === "fulfilled") {
        const pData = prodRes.value.products || prodRes.value.data || [];
        setProducts(pData);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update a section locally
  const handleSectionChange = (sectionId: string, patch: Partial<SectionTreeItem>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s))
    );
    if (selectedSection?.id === sectionId) {
      setSelectedSection((prev) => (prev ? { ...prev, ...patch } : null));
    }
  };

  // Toggle active status
  const handleToggleActive = async (section: SectionTreeItem) => {
    const updatedStatus = !section.active;
    handleSectionChange(section.id, { active: updatedStatus });

    try {
      const res = await fetch("/api/admin/cms/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: section.id, active: updatedStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de mise à jour");
      }
      toast.success(`Section "${section.titleFr}" ${updatedStatus ? "activée" : "masquée"}`);
    } catch (err: any) {
      handleSectionChange(section.id, { active: section.active });
      toast.error(err.message || "Erreur de mise à jour");
    }
  };

  // Reorder sections
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const updated = newSections.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(updated);

    try {
      const payload = {
        action: "reorder",
        items: updated.map((s) => ({ id: s.id, order: s.order })),
      };
      const res = await fetch("/api/admin/cms/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de réorganisation");
      }
      toast.success("Ordre des sections mis à jour");
    } catch (err: any) {
      toast.error(err.message || "Erreur de réorganisation");
      fetchData();
    }
  };

  // Delete section
  const handleDelete = async (section: SectionTreeItem) => {
    if (!confirm(`Supprimer définitivement la section "${section.titleFr}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/cms/mobile-app?id=${section.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de suppression");
      }
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      if (selectedSection?.id === section.id) {
        setSelectedSection(null);
      }
      toast.success("Section supprimée");
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression");
    }
  };

  // Duplicate section with unique cloned key
  const handleDuplicate = async (section: SectionTreeItem) => {
    try {
      const timestamp = Date.now();
      const clonedKey = `sec_${section.type || "section"}_${timestamp}`;
      const newSection = {
        ...section,
        id: undefined,
        sectionKey: clonedKey,
        titleFr: `${section.titleFr} (copie)`,
        order: sections.length + 1,
        action: "duplicate",
      };
      const res = await fetch("/api/admin/cms/mobile-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSection),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de duplication");
      }
      await fetchData();
      toast.success("Section dupliquée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur de duplication");
    }
  };

  // Add section from registry modal
  const handleAddSectionFromRegistry = async (registryType: RegistrySectionType) => {
    try {
      const timestamp = Date.now();
      const uniqueKey = `sec_${registryType.type.replace(/[^a-zA-Z0-9_]/g, "_")}_${timestamp}`;
      const newSectionData = {
        sectionKey: uniqueKey,
        type: registryType.type,
        titleFr: registryType.name,
        titleAr: registryType.nameAr || null,
        layoutType: registryType.defaultLayout || "grid",
        order: sections.length + 1,
        active: true,
        config: registryType.defaultConfig || {},
        productIds: [],
        categoryIds: [],
        brandIds: [],
      };

      const res = await fetch("/api/admin/cms/mobile-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSectionData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec d'ajout de la section");
      }

      toast.success(`Section "${registryType.name}" créée`);
      await fetchData();
      if (json.data) {
        setSelectedSection(json.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'ajout de section");
    }
  };

  // Save all modified sections
  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/cms/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec d'enregistrement");
      }
      toast.success("Toutes les modifications ont été enregistrées");
      setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
      setRedoStack([]);
    } catch (err: any) {
      toast.error(err.message || "Erreur d'enregistrement");
      throw err;
    }
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setSections(previousState);
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    toast.info("Annulé");
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setSections(nextState);
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(sections))]);
    toast.info("Rétabli");
  };

  // Publish to mobile app live feed & record revision snapshot
  const handlePublish = async () => {
    try {
      const response = await fetch("/api/admin/cms/mobile-app/publish", {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Publication échouée");
      }
      toast.success("Configuration mobile publiée en direct ! (Point de restauration créé)");
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erreur de publication");
      throw error;
    }
  };

  // Render section editor using specialized MobileSectionContentEditor
  const renderSectionEditor = (section: SectionTreeItem) => {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <MobileSectionContentEditor
          section={section as any}
          onChange={(patch) => handleSectionChange(section.id, patch)}
          categories={categories}
          brands={brands}
          products={products}
        />
      </div>
    );
  };

  // Render properties panel
  const renderPropertiesPanel = (section: SectionTreeItem) => {
    return (
      <div className="space-y-4">
        {/* Basic Properties */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Propriétés de base
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titre (FR)
              </label>
              <input
                type="text"
                value={section.titleFr || ""}
                onChange={(e) => handleSectionChange(section.id, { titleFr: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-right">
                العنوان (AR)
              </label>
              <input
                type="text"
                dir="rtl"
                value={section.titleAr || ""}
                onChange={(e) => handleSectionChange(section.id, { titleAr: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none font-arabic"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clé unique (ID section)
              </label>
              <input
                type="text"
                value={section.sectionKey}
                readOnly
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-mono bg-slate-50 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type de section
              </label>
              <input
                type="text"
                value={section.type || "custom"}
                readOnly
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs bg-slate-50 text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Visibilité & Ordre
          </h4>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Actif sur mobile</span>
            <button
              type="button"
              onClick={() => handleToggleActive(section)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                section.active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {section.active ? "Visible" : "Masquée"}
            </button>
          </div>
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">Ordre d'affichage</span>
            <span className="text-xs font-bold text-slate-900 font-mono">#{section.order}</span>
          </div>
        </div>

        {/* Scheduling */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Programmation Temporelle
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date de début</label>
              <input
                type="datetime-local"
                value={section.startAt ? new Date(section.startAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => handleSectionChange(section.id, { startAt: e.target.value || null } as any)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date de fin</label>
              <input
                type="datetime-local"
                value={section.endAt ? new Date(section.endAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => handleSectionChange(section.id, { endAt: e.target.value || null } as any)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <CmsStudioShell
        sections={sections}
        categories={categories}
        brands={brands}
        products={products}
        onSectionSelect={(section) => setSelectedSection(section)}
        onSectionToggleActive={handleToggleActive}
        onSectionMove={handleMove}
        onSectionDelete={handleDelete}
        onSectionDuplicate={handleDuplicate}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onSave={handleSave}
        onPublish={handlePublish}
        onRefresh={fetchData}
        renderSectionEditor={renderSectionEditor}
        renderPropertiesPanel={renderPropertiesPanel}
        onOpenAddSectionModal={() => setIsAddSectionOpen(true)}
        onOpenTokensModal={() => setIsTokensOpen(true)}
        onOpenRevisionsModal={() => setIsRevisionsOpen(true)}
        isLoading={loading}
      />

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onAddSection={handleAddSectionFromRegistry}
      />

      {/* Global Tokens / Design System Modal */}
      <GlobalTokensModal
        isOpen={isTokensOpen}
        onClose={() => setIsTokensOpen(false)}
        onSettingsSaved={fetchData}
      />

      {/* Revisions & History Modal */}
      <RevisionsModal
        isOpen={isRevisionsOpen}
        onClose={() => setIsRevisionsOpen(false)}
        onRestored={fetchData}
      />
    </>
  );
}
