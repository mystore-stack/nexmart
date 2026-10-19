"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Palette,
  Check,
  RotateCcw,
  Save,
  Loader2,
  Sparkles,
  Sliders,
  Type,
  Maximize,
} from "lucide-react";
import toast from "react-hot-toast";

interface GlobalTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

const THEME_PRESETS = [
  {
    id: "moroccan-luxury",
    name: "Moroccan Luxury (Défaut)",
    description: "Émeraude impériale, or éclatant et blanc pur",
    colors: {
      primary: "#1B4332",
      primaryDark: "#0F281E",
      primaryLight: "#D8F0EB",
      ink: "#121212",
      bg: "#FAFAF7",
      surface: "#FFFFFF",
      gold: "#D4AF37",
      accent: "#D4AF37",
    },
  },
  {
    id: "emerald-gold",
    name: "Emerald Gold",
    description: "Teintes vertes royales et dorure satinée",
    colors: {
      primary: "#0A3622",
      primaryDark: "#051D12",
      primaryLight: "#CFE8DC",
      ink: "#111827",
      bg: "#F7F7F7",
      surface: "#FFFFFF",
      gold: "#C5A059",
      accent: "#E8C872",
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Noir profond, gris subtils et touche d'azur",
    colors: {
      primary: "#18181B",
      primaryDark: "#09090B",
      primaryLight: "#E4E4E7",
      ink: "#09090B",
      bg: "#FAFAFA",
      surface: "#FFFFFF",
      gold: "#3B82F6",
      accent: "#3B82F6",
    },
  },
  {
    id: "moroccan-terracotta",
    name: "Moroccan Terracotta",
    description: "Terre de Marrakech, ambre chaud et ocre jaune",
    colors: {
      primary: "#C85A32",
      primaryDark: "#8C381A",
      primaryLight: "#FBECE6",
      ink: "#1C1917",
      bg: "#FDF8F5",
      surface: "#FFFFFF",
      gold: "#EAB308",
      accent: "#E28743",
    },
  },
];

export function GlobalTokensModal({ isOpen, onClose, onSettingsSaved }: GlobalTokensModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "geometry" | "typography">("colors");

  const [settings, setSettings] = useState({
    colors: {
      primary: "#1B4332",
      primaryDark: "#0F281E",
      primaryLight: "#D8F0EB",
      ink: "#121212",
      bg: "#FAFAF7",
      surface: "#FFFFFF",
      gold: "#D4AF37",
      accent: "#D4AF37",
    },
    radius: {
      sm: 6,
      md: 12,
      lg: 18,
      xl: 24,
      pill: 999,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    },
    typography: {
      appName: "NexMart",
      tagline: "المتجر المغربي الفاخر",
      fontScale: 1.0,
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms/mobile-app/settings");
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setSettings((prev) => ({
          ...prev,
          ...json.data,
          colors: { ...prev.colors, ...(json.data.colors || {}) },
          radius: { ...prev.radius, ...(json.data.radius || {}) },
          spacing: { ...prev.spacing, ...(json.data.spacing || {}) },
          typography: { ...prev.typography, ...(json.data.typography || {}) },
        }));
      }
    } catch {
      // Keep default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...preset.colors },
    }));
    toast.success(`Thème "${preset.name}" appliqué`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms/mobile-app/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur d'enregistrement");
      }
      toast.success("Paramètres et Design Tokens enregistrés");
      if (onSettingsSaved) onSettingsSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Design System & Paramètres Globaux Mobile
              </h3>
              <p className="text-xs text-slate-500">
                Contrôlez les couleurs de marque, la géométrie et la présentation globale
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "colors"
                ? "border-emerald-700 text-emerald-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Palette className="h-4 w-4" />
            Couleurs & Thèmes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("geometry")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "geometry"
                ? "border-emerald-700 text-emerald-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Maximize className="h-4 w-4" />
            Arrondis & Espacements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "typography"
                ? "border-emerald-700 text-emerald-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Type className="h-4 w-4" />
            Identité & Textes
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {activeTab === "colors" && (
            <div className="space-y-6">
              {/* Thèmes prédéfinis */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Préréglages Thématiques
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEME_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.description}</p>
                      </div>
                      <div className="flex -space-x-1 shrink-0 ml-3">
                        <div
                          className="h-6 w-6 rounded-full border border-white shadow"
                          style={{ backgroundColor: p.colors.primary }}
                        />
                        <div
                          className="h-6 w-6 rounded-full border border-white shadow"
                          style={{ backgroundColor: p.colors.gold }}
                        />
                        <div
                          className="h-6 w-6 rounded-full border border-white shadow"
                          style={{ backgroundColor: p.colors.bg }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nuancier détaillé */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nuancier de la Marque (Live Hex)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "primary", label: "Couleur Primaire" },
                    { key: "primaryDark", label: "Primaire Foncée" },
                    { key: "primaryLight", label: "Primaire Claire" },
                    { key: "gold", label: "Or / Dorure" },
                    { key: "accent", label: "Accent secondaire" },
                    { key: "bg", label: "Fond d'écran" },
                    { key: "surface", label: "Cartes & Surface" },
                    { key: "ink", label: "Texte Principal" },
                  ].map(({ key, label }) => {
                    const colorVal = (settings.colors as any)[key] || "#000000";
                    return (
                      <div key={key} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          {label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorVal}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                colors: { ...prev.colors, [key]: e.target.value },
                              }))
                            }
                            className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={colorVal}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                colors: { ...prev.colors, [key]: e.target.value },
                              }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono uppercase focus:border-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "geometry" && (
            <div className="space-y-6">
              {/* Rayons des angles */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Échelle des Rayons d'angles (Border Radius)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "sm", label: "Petit (sm)" },
                    { key: "md", label: "Moyen (md)" },
                    { key: "lg", label: "Grand (lg)" },
                    { key: "xl", label: "Extra-Grand (xl)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{label}</span>
                        <span>{(settings.radius as any)[key]}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="36"
                        value={(settings.radius as any)[key]}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            radius: { ...prev.radius, [key]: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-emerald-700"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Échelle des Espacements */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Échelle des Espacements (Spacing)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "sm", label: "Compact (sm)", min: 4, max: 16 },
                    { key: "md", label: "Standard (md)", min: 8, max: 24 },
                    { key: "lg", label: "Aéré (lg)", min: 12, max: 32 },
                  ].map(({ key, label, min, max }) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{label}</span>
                        <span>{(settings.spacing as any)[key]}px</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={(settings.spacing as any)[key]}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            spacing: { ...prev.spacing, [key]: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-emerald-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "typography" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Textes Globaux de l'Application Mobile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de l'Application
                  </label>
                  <input
                    type="text"
                    value={settings.typography.appName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        typography: { ...prev.typography, appName: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-right">
                    شعار التطبيق (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={settings.typography.tagline}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        typography: { ...prev.typography, tagline: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-arabic"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-900 shadow-md transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer les Tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
