"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Palette,
  Smartphone,
  ArrowRight,
  Sparkles,
  Link2,
  Layers,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  RotateCw,
  Settings2,
  Type,
  Layers as LayersIcon,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { MobileImageUploader } from "./MobileImageUploader";
import {
  MobileHeroBannerItem,
  DEFAULT_HERO_BANNER,
  normalizeHeroBanner,
} from "@/lib/cms/schemas/mobile-hero";

export interface HeroBannerItem extends MobileHeroBannerItem {}

const GRADIENT_PRESETS = [
  { name: "Émeraude", colors: ["#0F766E", "#042F2E"] },
  { name: "Océan", colors: ["#0284C7", "#0369A1"] },
  { name: "Violet Royal", colors: ["#7C3AED", "#4C1D95"] },
  { name: "Ambre & Or", colors: ["#D97706", "#78350F"] },
  { name: "Rose & Ruby", colors: ["#E11D48", "#881337"] },
  { name: "Noir & Sarcelle", colors: ["#0A4F40", "#19C79C"] },
];

interface HeroStudioProps {
  banners: HeroBannerItem[];
  onChange: (banners: HeroBannerItem[]) => void;
  categories: any[];
  products: any[];
}

export function HeroStudio({
  banners,
  onChange,
  categories,
  products,
}: HeroStudioProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeBanner = banners[selectedIdx] || banners[0] || null;

  const addBanner = () => {
    const newBanner: HeroBannerItem = {
      ...DEFAULT_HERO_BANNER,
      id: `banner-${Date.now()}`,
    };
    const next = [...banners, newBanner];
    onChange(next);
    setSelectedIdx(next.length - 1);
  };

  const removeBanner = (idx: number) => {
    if (banners.length <= 1) {
      toast.error("Vous devez conserver au moins une bannière.");
      return;
    }
    const next = banners.filter((_, i) => i !== idx);
    onChange(next);
    setSelectedIdx(Math.max(0, idx - 1));
  };

  const moveBanner = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;
    const next = [...banners];
    const [item] = next.splice(idx, 1);
    next.splice(targetIdx, 0, item);
    onChange(next);
    setSelectedIdx(targetIdx);
  };

  const updateActiveBanner = (field: string, value: any) => {
    if (!activeBanner) return;
    const next = banners.map((b, i) =>
      i === selectedIdx ? { ...b, [field]: value } : b
    );
    onChange(next);
  };

  return (
    <div className="space-y-6">
      {/* Header and Slide Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/20 rounded-2xl border border-border">
        <div>
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Carrousel Hero Mobile ({banners.length} slides)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configurez les slides d'en-tête de l'application avec visuels, textes bilingues et redirections.
          </p>
        </div>

        <button
          type="button"
          onClick={addBanner}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter une slide</span>
        </button>
      </div>

      {/* Slide Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {banners.map((b, i) => (
          <div
            key={b.id || i}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
              selectedIdx === i
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedIdx(i)}
              className="text-xs font-bold whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Slide #{i + 1}</span>
              <span className="text-[10px] opacity-80 truncate max-w-[80px]">
                {b.titleFr || "Sans titre"}
              </span>
            </button>

            <div className="flex items-center ml-1 opacity-70 hover:opacity-100">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => moveBanner(i, "up")}
                className="p-0.5 hover:bg-black/20 rounded disabled:opacity-30"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={i === banners.length - 1}
                onClick={() => moveBanner(i, "down")}
                className="p-0.5 hover:bg-black/20 rounded disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeBanner && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Form (Left) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Image Upload */}
            <div className="p-4 bg-card rounded-2xl border border-border shadow-sm">
              <MobileImageUploader
                label="Image d'arrière-plan de la slide"
                value={activeBanner.image}
                onChange={(url) => updateActiveBanner("image", url)}
                folder="nexmart/hero-banners"
                recommendedSize="1200 × 600 px (Format paysage)"
              />
            </div>

            {/* 2. French Texts */}
            <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-3">
              <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Textes en Français
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Badge FR</label>
                  <input
                    type="text"
                    value={activeBanner.badgeFr || ""}
                    onChange={(e) => updateActiveBanner("badgeFr", e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border"
                    placeholder="Ex: ⚡ Offre du jour"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Bouton CTA FR</label>
                  <input
                    type="text"
                    value={activeBanner.ctaFr || ""}
                    onChange={(e) => updateActiveBanner("ctaFr", e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border"
                    placeholder="Ex: Découvrir maintenant"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Titre Principal FR *</label>
                <input
                  type="text"
                  value={activeBanner.titleFr || ""}
                  onChange={(e) => updateActiveBanner("titleFr", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border font-bold"
                  placeholder="Ex: Premium picks pour votre style"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Sous-titre FR</label>
                <input
                  type="text"
                  value={activeBanner.subtitleFr || ""}
                  onChange={(e) => updateActiveBanner("subtitleFr", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border"
                  placeholder="Ex: Jusqu'à -50% sur une sélection de prestige"
                />
              </div>
            </div>

            {/* 3. Arabic Texts */}
            <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-3">
              <h4 className="text-xs font-black uppercase text-foreground text-right flex items-center justify-end gap-2">
                <span>المحتوى بالعربية (Arabic RTL)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-right">زر الإجراء (CTA AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={activeBanner.ctaAr || ""}
                    onChange={(e) => updateActiveBanner("ctaAr", e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border font-arabic text-right"
                    placeholder="مثال: تسوق الآن"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-right">الشارة (Badge AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={activeBanner.badgeAr || ""}
                    onChange={(e) => updateActiveBanner("badgeAr", e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border font-arabic text-right"
                    placeholder="مثال: ⚡ عرض محدود"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 text-right">العنوان بالعربية</label>
                <input
                  type="text"
                  dir="rtl"
                  value={activeBanner.titleAr || ""}
                  onChange={(e) => updateActiveBanner("titleAr", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border font-arabic text-right font-bold"
                  placeholder="مثال: تشكيلة فاخرة لأسلوب حياتك"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1 text-right">العنوان الفرعي بالعربية</label>
                <input
                  type="text"
                  dir="rtl"
                  value={activeBanner.subtitleAr || ""}
                  onChange={(e) => updateActiveBanner("subtitleAr", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-background border border-border font-arabic text-right"
                  placeholder="مثال: خصومات حصرية تصل إلى 50%"
                />
              </div>
            </div>

            {/* 4. Action Target (Destination Picker) */}
            <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-3">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                Destination du Clic (Redirection dans l'App Mobile)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Type de destination</label>
                  <select
                    value={activeBanner.target?.type || "promo"}
                    onChange={(e) =>
                      updateActiveBanner("target", {
                        ...activeBanner.target,
                        type: e.target.value as any,
                        id: "",
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl bg-background border border-border font-medium"
                  >
                    <option value="promo">Page Promotions & Offres Générales</option>
                    <option value="category">Catégorie spécifique</option>
                    <option value="product">Fiche Produit spécifique</option>
                  </select>
                </div>

                {activeBanner.target?.type === "category" && (
                  <div>
                    <label className="block text-[11px] font-bold mb-1">Choisir la Catégorie</label>
                    <select
                      value={activeBanner.target?.id || ""}
                      onChange={(e) =>
                        updateActiveBanner("target", {
                          ...activeBanner.target,
                          id: e.target.value,
                        })
                      }
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border"
                    >
                      <option value="">Sélectionner une catégorie...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug || c.id}>
                          {c.name} ({c._count?.products || 0} produits)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeBanner.target?.type === "product" && (
                  <div>
                    <label className="block text-[11px] font-bold mb-1">Choisir le Produit</label>
                    <select
                      value={activeBanner.target?.id || ""}
                      onChange={(e) =>
                        updateActiveBanner("target", {
                          ...activeBanner.target,
                          id: e.target.value,
                        })
                      }
                      className="w-full text-xs p-2.5 rounded-xl bg-background border border-border"
                    >
                      <option value="">Sélectionner un produit...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.price} MAD)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Gradient & Visual Colors */}
            <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-3">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                Dégradé & Couleurs d'ambiance
              </label>

              <div className="flex flex-wrap gap-2">
                {GRADIENT_PRESETS.map((gp) => (
                  <button
                    key={gp.name}
                    type="button"
                    onClick={() => updateActiveBanner("gradient", gp.colors)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center gap-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${gp.colors[0]}, ${gp.colors[1]})`,
                    }}
                  >
                    {gp.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeBanner.gradient?.[0] || "#0F766E"}
                    onChange={(e) =>
                      updateActiveBanner("gradient", [
                        e.target.value,
                        activeBanner.gradient?.[1] || "#042F2E",
                      ])
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono">
                    {activeBanner.gradient?.[0] || "#0F766E"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeBanner.gradient?.[1] || "#042F2E"}
                    onChange={(e) =>
                      updateActiveBanner("gradient", [
                        activeBanner.gradient?.[0] || "#0F766E",
                        e.target.value,
                      ])
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono">
                    {activeBanner.gradient?.[1] || "#042F2E"}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Mode Toggle: Image-Only vs Editable-Overlay */}
            <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-3">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <LayersIcon className="w-3.5 h-3.5 text-purple-600" />
                Mode d'affichage
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateActiveBanner("mode", "editable-overlay")}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    (activeBanner.mode || "editable-overlay") === "editable-overlay"
                      ? "bg-purple-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 mx-auto mb-1" />
                  Texte modifiable
                </button>
                <button
                  type="button"
                  onClick={() => updateActiveBanner("mode", "image-only")}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeBanner.mode === "image-only"
                      ? "bg-purple-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 mx-auto mb-1" />
                  Image seule
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {activeBanner.mode === "image-only"
                  ? "L'image contient tout le texte. Le texte CMS sera masqué."
                  : "Le texte CMS s'affiche par-dessus l'image."}
              </p>
            </div>

            {/* 7. Advanced Typography Controls */}
            {(activeBanner.mode || "editable-overlay") === "editable-overlay" && (
              <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-4">
                <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  Contrôles Typographie Avancés
                </label>

                {/* Badge Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Badge Visibility</span>
                    <button
                      type="button"
                      onClick={() => updateActiveBanner("badgeVisible", !activeBanner.badgeVisible)}
                      className={`p-1.5 rounded-lg ${
                        activeBanner.badgeVisible ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activeBanner.badgeVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {activeBanner.badgeVisible && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1">Font Size</label>
                        <input
                          type="number"
                          min="10"
                          max="24"
                          value={activeBanner.badgeFontSize || 11}
                          onChange={(e) => updateActiveBanner("badgeFontSize", parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1">Color</label>
                        <input
                          type="color"
                          value={activeBanner.badgeColor || "#FFFFFF"}
                          onChange={(e) => updateActiveBanner("badgeColor", e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Title Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Title Visibility</span>
                    <button
                      type="button"
                      onClick={() => updateActiveBanner("titleVisible", !activeBanner.titleVisible)}
                      className={`p-1.5 rounded-lg ${
                        activeBanner.titleVisible ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activeBanner.titleVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {activeBanner.titleVisible && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1">Font Size</label>
                        <input
                          type="number"
                          min="16"
                          max="48"
                          value={activeBanner.titleFontSize || 32}
                          onChange={(e) => updateActiveBanner("titleFontSize", parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1">Color</label>
                        <input
                          type="color"
                          value={activeBanner.titleColor || "#FFFFFF"}
                          onChange={(e) => updateActiveBanner("titleColor", e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitle Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Subtitle Visibility</span>
                    <button
                      type="button"
                      onClick={() => updateActiveBanner("subtitleVisible", !activeBanner.subtitleVisible)}
                      className={`p-1.5 rounded-lg ${
                        activeBanner.subtitleVisible ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activeBanner.subtitleVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {activeBanner.subtitleVisible && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1">Font Size</label>
                        <input
                          type="number"
                          min="12"
                          max="24"
                          value={activeBanner.subtitleFontSize || 13}
                          onChange={(e) => updateActiveBanner("subtitleFontSize", parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1">Color</label>
                        <input
                          type="color"
                          value={activeBanner.subtitleColor || "rgba(255, 255, 255, 0.92)"}
                          onChange={(e) => updateActiveBanner("subtitleColor", e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. CTA Advanced Controls */}
            {(activeBanner.mode || "editable-overlay") === "editable-overlay" && (
              <div className="p-4 bg-muted/10 rounded-2xl border border-border space-y-4">
                <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                  Contrôles CTA Avancés
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">CTA Visibility</span>
                    <button
                      type="button"
                      onClick={() => updateActiveBanner("ctaVisible", !activeBanner.ctaVisible)}
                      className={`p-1.5 rounded-lg ${
                        activeBanner.ctaVisible ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activeBanner.ctaVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {activeBanner.ctaVisible && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1">Background Color</label>
                        <input
                          type="color"
                          value={activeBanner.ctaBackgroundColor || "#FFFFFF"}
                          onChange={(e) => updateActiveBanner("ctaBackgroundColor", e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer border-0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1">Text Color</label>
                        <input
                          type="color"
                          value={activeBanner.ctaTextColor || "#0D5043"}
                          onChange={(e) => updateActiveBanner("ctaTextColor", e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer border-0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1">Border Radius</label>
                        <input
                          type="number"
                          min="4"
                          max="24"
                          value={activeBanner.ctaBorderRadius || 20}
                          onChange={(e) => updateActiveBanner("ctaBorderRadius", parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1">Width (px)</label>
                        <input
                          type="number"
                          min="80"
                          max="200"
                          value={activeBanner.ctaWidth || 120}
                          onChange={(e) => updateActiveBanner("ctaWidth", parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delete button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => removeBanner(selectedIdx)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer cette slide</span>
              </button>
            </div>
          </div>

          {/* Interactive Mobile Phone Mockup (Right) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Aperçu en Direct sur Mobile (iPhone 15)
            </h4>

            <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl max-w-[340px] mx-auto">
              <div className="text-[10px] text-slate-400 font-mono mb-2 text-center">
                Écran d'accueil · Slide #{selectedIdx + 1}
              </div>

              {/* Simulated Card */}
              <div
                className="h-[230px] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${
                    activeBanner.gradient?.[0] || "#0F766E"
                  }, ${activeBanner.gradient?.[1] || "#042F2E"})`,
                }}
              >
                {activeBanner.image && (
                  <img
                    src={activeBanner.image}
                    alt="Hero preview"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 pointer-events-none"
                    style={{
                      transform: `scale(${activeBanner.imageZoom || 1}) rotate(${activeBanner.imageRotation || 0}deg)`,
                    }}
                  />
                )}

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  {(activeBanner.badgeVisible !== false && activeBanner.badgeFr) ? (
                    <div
                      className="px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md"
                      style={{
                        backgroundColor: activeBanner.badgeBackgroundColor || "rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <span
                        className="text-[10px] font-bold tracking-wide"
                        style={{
                          color: activeBanner.badgeColor || "#FFFFFF",
                          fontSize: `${activeBanner.badgeFontSize || 11}px`,
                        }}
                      >
                        {activeBanner.badgeFr}
                      </span>
                    </div>
                  ) : <div />}

                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 flex items-center justify-center">
                    <span className="text-[9px] font-black text-emerald-200">TOP</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="relative z-10 space-y-1">
                  {(activeBanner.titleVisible !== false) && (
                    <h3
                      className="font-black leading-tight drop-shadow-sm line-clamp-2"
                      style={{
                        color: activeBanner.titleColor || "#FFFFFF",
                        fontSize: `${activeBanner.titleFontSize || 32}px`,
                        fontWeight: activeBanner.titleFontWeight || "900",
                      }}
                    >
                      {activeBanner.titleFr || "Titre de la slide"}
                    </h3>
                  )}
                  {(activeBanner.subtitleVisible !== false && activeBanner.subtitleFr) && (
                    <p
                      className="line-clamp-2 leading-relaxed drop-shadow-sm"
                      style={{
                        color: activeBanner.subtitleColor || "rgba(255, 255, 255, 0.92)",
                        fontSize: `${activeBanner.subtitleFontSize || 13}px`,
                      }}
                    >
                      {activeBanner.subtitleFr}
                    </p>
                  )}

                  {(activeBanner.ctaVisible !== false) && (
                    <div className="pt-2">
                      <div
                        className="inline-flex items-center gap-1.5 shadow-md font-black"
                        style={{
                          backgroundColor: activeBanner.ctaBackgroundColor || "#FFFFFF",
                          color: activeBanner.ctaTextColor || "#0D5043",
                          borderRadius: `${activeBanner.ctaBorderRadius || 20}px`,
                          width: `${activeBanner.ctaWidth || 120}px`,
                          height: `${activeBanner.ctaHeight || 38}px`,
                          padding: "0 12px",
                        }}
                      >
                        <span className="text-xs">{activeBanner.ctaFr || "Découvrir"}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-700" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === selectedIdx ? "w-6 bg-emerald-500" : "w-1.5 bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
