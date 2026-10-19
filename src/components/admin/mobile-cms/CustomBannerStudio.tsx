"use client";

import React from "react";
import {
  Palette,
  Sparkles,
  Tag,
  Gift,
  Flame,
  Star,
  Percent,
  Zap,
  ArrowRight,
  ExternalLink,
  Layers,
  Sliders,
} from "lucide-react";
import { MobileImageUploader } from "./MobileImageUploader";

interface CustomBannerStudioProps {
  titleFr: string;
  titleAr?: string | null;
  subtitleFr?: string | null;
  subtitleAr?: string | null;
  bannerImage?: string | null;
  config: any;
  onChangeTitleFr: (val: string) => void;
  onChangeTitleAr: (val: string) => void;
  onChangeSubtitleFr: (val: string) => void;
  onChangeSubtitleAr: (val: string) => void;
  onChangeBannerImage: (url: string | null) => void;
  onChangeConfig: (config: any) => void;
}

const ICONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sparkles", label: "Étoiles", icon: Sparkles },
  { id: "tag", label: "Promotion", icon: Tag },
  { id: "gift", label: "Cadeau", icon: Gift },
  { id: "flame", label: "Tendance", icon: Flame },
  { id: "star", label: "Exclusif", icon: Star },
  { id: "percent", label: "Remise", icon: Percent },
  { id: "zap", label: "Flash", icon: Zap },
];

const PRESET_GRADIENTS = [
  { label: "Émeraude Royal", bg: "#1B4332", text: "#FFFFFF", accent: "#D4AF37" },
  { label: "Or Marocain", bg: "#D4AF37", text: "#121212", accent: "#1B4332" },
  { label: "Charbon Luxe", bg: "#18181B", text: "#FAFAF7", accent: "#D4AF37" },
  { label: "Terre Cuite", bg: "#C85A32", text: "#FFFFFF", accent: "#EAB308" },
  { label: "Bleu Saphir", bg: "#1E3A8A", text: "#FFFFFF", accent: "#38BDF8" },
  { label: "Bordeaux Impérial", bg: "#701A75", text: "#FFFFFF", accent: "#F472B6" },
];

const CTA_DESTINATIONS = [
  { id: "SHOP", label: "Catalogue Général (Boutique)" },
  { id: "CATEGORY", label: "Catégorie spécifique" },
  { id: "PRODUCT", label: "Fiche Produit" },
  { id: "COUPONS", label: "Bons d'achat & Coupons" },
  { id: "REWARDS", label: "NexPlay & Récompenses" },
];

export function CustomBannerStudio({
  titleFr,
  titleAr,
  subtitleFr,
  subtitleAr,
  bannerImage,
  config = {},
  onChangeTitleFr,
  onChangeTitleAr,
  onChangeSubtitleFr,
  onChangeSubtitleAr,
  onChangeBannerImage,
  onChangeConfig,
}: CustomBannerStudioProps) {
  const ctaLabel = config?.ctaLabel || "Découvrir";
  const ctaLabelAr = config?.ctaLabelAr || "اكتشف الآن";
  const ctaAction = config?.ctaAction || "SHOP";
  const backgroundColor = config?.backgroundColor || "#1B4332";
  const textColor = config?.textColor || "#FFFFFF";
  const accentColor = config?.accentColor || "#D4AF37";
  const selectedIcon = config?.icon || "sparkles";
  const borderRadius = config?.borderRadius ?? 16;
  const padding = config?.padding ?? 16;

  const update = (key: string, val: any) => {
    onChangeConfig({
      ...config,
      [key]: val,
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Aperçu Visuel de la Bannière
        </h4>
        <div
          className="relative overflow-hidden transition-all duration-300"
          style={{
            backgroundColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
            padding: `${padding}px`,
          }}
        >
          {bannerImage && (
            <img
              src={bannerImage}
              alt="Banner background"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}
          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: accentColor, color: backgroundColor }}
                >
                  <Sparkles className="h-3 w-3" />
                  Bannière Spéciale
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight drop-shadow-sm">
                {titleFr || "Titre de la bannière"}
              </h3>
              {subtitleFr && (
                <p className="text-xs opacity-90 drop-shadow-sm">{subtitleFr}</p>
              )}
            </div>
            <div className="shrink-0">
              <span
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: accentColor, color: backgroundColor }}
              >
                {ctaLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Titres & Textes Bilingues */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-700" />
          Textes & Messages
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre Principal (FR)
            </label>
            <input
              type="text"
              value={titleFr || ""}
              onChange={(e) => onChangeTitleFr(e.target.value)}
              placeholder="Ex: Collection Exclusive Hiver"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-right">
              العنوان الرئيسي (AR)
            </label>
            <input
              type="text"
              dir="rtl"
              value={titleAr || ""}
              onChange={(e) => onChangeTitleAr(e.target.value)}
              placeholder="مثال: تشكيلة الشتاء الفاخرة"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-arabic"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sous-titre (FR)
            </label>
            <input
              type="text"
              value={subtitleFr || ""}
              onChange={(e) => onChangeSubtitleFr(e.target.value)}
              placeholder="Ex: Jusqu'à -40% sur une sélection de prestige"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-right">
              الوصف الفرعي (AR)
            </label>
            <input
              type="text"
              dir="rtl"
              value={subtitleAr || ""}
              onChange={(e) => onChangeSubtitleAr(e.target.value)}
              placeholder="مثال: خصومات حصرية تصل إلى 40%"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-arabic"
            />
          </div>
        </div>
      </div>

      {/* Bouton d'action (CTA) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-emerald-700" />
          Bouton d'Action (Call To Action)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Texte du Bouton (FR)
            </label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => update("ctaLabel", e.target.value)}
              placeholder="Ex: Découvrir"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-right">
              نص الزر (AR)
            </label>
            <input
              type="text"
              dir="rtl"
              value={ctaLabelAr}
              onChange={(e) => update("ctaLabelAr", e.target.value)}
              placeholder="مثال: اكتشف الآن"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none font-arabic"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination dans l'application
            </label>
            <select
              value={ctaAction}
              onChange={(e) => update("ctaAction", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              {CTA_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Palette de Couleurs & Thèmes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Palette className="h-4 w-4 text-emerald-700" />
          Palette de Couleurs & Préréglages
        </h4>

        {/* Presets rapides */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Palettes Recommandées
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_GRADIENTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  update("backgroundColor", p.bg);
                  update("textColor", p.text);
                  update("accentColor", p.accent);
                }}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2 text-left hover:border-emerald-500 transition-all"
              >
                <div
                  className="h-6 w-6 rounded-lg border border-black/10 shrink-0"
                  style={{ backgroundColor: p.bg }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom hex colors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Arrière-plan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => update("backgroundColor", e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => update("backgroundColor", e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Couleur du Texte
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => update("textColor", e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => update("textColor", e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Couleur d'Accentuation (Bouton/Badge)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                className="h-9 w-9 rounded border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Icône & Mise en Page */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-700" />
          Mise en Page & Géométrie
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Icône Décorative
          </label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => {
              const IconComp = i.icon;
              const isSelected = selectedIcon === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => update("icon", i.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                  {i.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Rayon des angles (Border Radius)</span>
              <span>{borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={borderRadius}
              onChange={(e) => update("borderRadius", Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Espacement interne (Padding)</span>
              <span>{padding}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={padding}
              onChange={(e) => update("padding", Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* Image de fond optionnelle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-700" />
          Image d'Arrière-plan Optionnelle
        </h4>
        <p className="text-xs text-slate-500">
          Une image semi-transparente est superposée à la couleur d'arrière-plan choisie.
        </p>
        <MobileImageUploader
          label="Image de fond"
          value={bannerImage || ""}
          onChange={(url) => {
            onChangeBannerImage(url);
            update("bannerImage", url || "");
          }}
          aspectRatio="21:9"
          recommendedDimensions="1200 x 500 px"
        />
      </div>
    </div>
  );
}
