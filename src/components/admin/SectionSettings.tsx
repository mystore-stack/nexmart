// src/components/admin/SectionSettings.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, X } from "lucide-react";
import toast from "react-hot-toast";

interface SectionSettingsProps {
  sectionKey: string;
  onSettingsChange?: (settings: any) => void;
  disabled?: boolean;
}

interface SectionData {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  viewAllButton?: string;
  destinationUrl?: string;
  order: number;
  displayOrder: number;
  active: boolean;
  maxProducts: number;
  hideIfEmpty: boolean;
}

export function SectionSettings({ sectionKey, onSettingsChange, disabled = false }: SectionSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    bannerImage: "",
    viewAllButton: "",
    destinationUrl: "",
    displayOrder: 0,
    active: true,
    maxProducts: 12,
    hideIfEmpty: false,
  });

  useEffect(() => {
    fetchSection();
  }, [sectionKey]);

  const fetchSection = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/homepage-sections");
      const data = await res.json();
      
      if (data.success && data.data) {
        const foundSection = data.data.find((s: SectionData) => s.sectionKey === sectionKey);
        if (foundSection) {
          setSection(foundSection);
          setFormData({
            title: foundSection.title || "",
            subtitle: foundSection.subtitle || "",
            description: foundSection.description || "",
            bannerImage: foundSection.bannerImage || "",
            viewAllButton: foundSection.viewAllButton || "",
            destinationUrl: foundSection.destinationUrl || "",
            displayOrder: foundSection.displayOrder || 0,
            active: foundSection.active ?? true,
            maxProducts: foundSection.maxProducts || 12,
            hideIfEmpty: foundSection.hideIfEmpty || false,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching section:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/homepage-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: section.id,
          ...formData,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Paramètres de section enregistrés");
        setSection({ ...section, ...formData });
        if (onSettingsChange) {
          onSettingsChange({ ...section, ...formData });
        }
        setIsOpen(false);
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="btn-ghost p-2 rounded-xl border border-border opacity-50">
        <Settings className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="btn-ghost p-2 rounded-xl border border-border hover:bg-surface transition-colors"
        title="Paramètres de section"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-2xl shadow-luxury max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres de section
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-ghost p-2 rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Basic Settings */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">Informations de base</h3>
                
                <div>
                  <label className="font-bold block mb-1">Titre de la section</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Sous-titre</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full min-h-[60px]"
                    rows={2}
                  />
                </div>
              </div>

              {/* Visual Settings */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">Apparence</h3>
                
                <div>
                  <label className="font-bold block mb-1">Image de bannière (URL)</label>
                  <input
                    type="text"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    className="input w-full"
                    placeholder="/images/banner.jpg"
                  />
                </div>
              </div>

              {/* Navigation Settings */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">Navigation</h3>
                
                <div>
                  <label className="font-bold block mb-1">Texte du bouton "Voir tout"</label>
                  <input
                    type="text"
                    value={formData.viewAllButton}
                    onChange={(e) => setFormData({ ...formData, viewAllButton: e.target.value })}
                    className="input w-full"
                    placeholder="Voir tout"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">URL de destination</label>
                  <input
                    type="text"
                    value={formData.destinationUrl}
                    onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                    className="input w-full"
                    placeholder="/collections/flash-deals"
                  />
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">Affichage</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Ordre d'affichage</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                      className="input w-full"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Limite de produits</label>
                    <input
                      type="number"
                      value={formData.maxProducts}
                      onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                      className="input w-full"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm">Options</h3>
                
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
                  <div className="flex items-center gap-2">
                    {formData.active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-medium text-foreground">Section active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.active ? "bg-brand-700" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.active ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Masquer si vide</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hideIfEmpty: !formData.hideIfEmpty })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.hideIfEmpty ? "bg-brand-700" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.hideIfEmpty ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline px-4 py-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-5 py-2 font-bold inline-flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
