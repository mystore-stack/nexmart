"use client";

import React, { useState } from "react";
import {
  Smartphone,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit3,
  Sparkles,
  Zap,
  ShoppingBag,
  Award,
  Grid,
  Search,
  ShoppingCart,
  Heart,
  User,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { MobileSection } from "@/app/admin/cms/mobile-app/page";

interface MobilePhoneCanvasProps {
  sections: MobileSection[];
  onSelectSection: (section: MobileSection) => void;
  onToggleActive: (section: MobileSection) => void;
  onMoveSection: (index: number, direction: "up" | "down") => void;
  categories: any[];
  brands: any[];
  products: any[];
}

export function MobilePhoneCanvas({
  sections,
  onSelectSection,
  onToggleActive,
  onMoveSection,
  categories = [],
  brands = [],
  products = [],
}: MobilePhoneCanvasProps) {
  const [deviceModel, setDeviceModel] = useState<"iphone" | "galaxy">("iphone");
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const brandMap = new Map(brands.map((b) => [b.id, b]));

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Device Model Switcher */}
      <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setDeviceModel("iphone")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${deviceModel === "iphone"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iPhone 15 Pro (iOS)</span>
        </button>

        <button
          type="button"
          onClick={() => setDeviceModel("galaxy")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${deviceModel === "galaxy"
              ? "bg-background text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Samsung Galaxy (Android)</span>
        </button>
      </div>

      {/* The Physical Phone Mockup Frame */}
      <div
        className={`relative bg-neutral-950 p-3 rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 transition-all duration-300 ${deviceModel === "iphone"
            ? "border-neutral-700 w-[390px] h-[810px]"
            : "border-neutral-800 w-[380px] h-[790px] rounded-[42px]"
          }`}
      >
        {/* Dynamic Island / Notch */}
        {deviceModel === "iphone" ? (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-end pr-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
          </div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40" />
        )}

        {/* Screen Bezel Inside */}
        <div className="relative w-full h-full bg-background rounded-[42px] overflow-hidden flex flex-col select-none text-foreground">
          {/* Status Bar */}
          <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-bold text-foreground shrink-0 z-30">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-foreground/80 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-foreground rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App Header Bar */}
          <div className="px-4 py-2 bg-background border-b border-border/50 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-emerald-600">
                NEXMART
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                Luxury
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <div className="p-1.5 rounded-full bg-muted/60">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div className="p-1.5 rounded-full bg-muted/60 relative">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">
                  2
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Homepage Content Body */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-20 pt-2 px-3 scrollbar-thin">
            {sections.map((sec, index) => {
              const isHovered = hoveredSectionId === sec.id;
              const isHero = sec.sectionKey === "heroCarousel" || sec.type === "hero";
              const isCategories = sec.sectionKey === "categoriesRapides" || sec.type === "categories";
              const isFlash = sec.sectionKey === "flashSale" || sec.type === "flash";
              const isBrands = sec.sectionKey === "marquesVedettes" || sec.type === "brands";
              const normalizedKey = sec.sectionKey.toLowerCase();
              const isCoupons = normalizedKey === "coupons" || sec.type === "coupons";
              const isGroupedOffers = ["offresgroupees", "groupedoffers"].includes(normalizedKey) || sec.type === "grouped-offers";
              const isWelcomeOffer = ["welcomeoffer", "offrebienvenue", "popupbienvenu"].includes(normalizedKey) || sec.type === "welcome-offer";
              const isCustomBanner = sec.type === "custom-banner" || normalizedKey.includes("custombanner") || normalizedKey.startsWith("sec_custom_banner");
              const isBanner = !isGroupedOffers && !isWelcomeOffer && !isCustomBanner && (sec.sectionKey === "bannerPromo" || sec.type === "banner" || sec.layoutType === "banner" || sec.type === "discover");
              const selectedProducts = (sec.productIds || []).map((id) => productMap.get(id)).filter(Boolean).slice(0, 3);
              const endsAtValue = sec.endAt || sec.config?.endsAt;
              const endsAt = endsAtValue ? new Date(endsAtValue) : null;
              const formatPrice = (value: number) => `${Math.round(value).toLocaleString("fr-MA")} MAD`;

              return (
                <div
                  key={sec.id}
                  onMouseEnter={() => setHoveredSectionId(sec.id)}
                  onMouseLeave={() => setHoveredSectionId(null)}
                  className={`group relative rounded-2xl transition-all duration-200 ${sec.active ? "opacity-100" : "opacity-40 grayscale"
                    } ${isHovered
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg"
                      : "hover:ring-1 hover:ring-border"
                    }`}
                >
                  {/* Floating Action Controls Overlay on Hover */}
                  <div
                    className={`absolute -top-3 right-2 z-30 flex items-center gap-1 bg-neutral-900 text-white px-2 py-1 rounded-xl shadow-xl transition-all duration-150 ${isHovered ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => onMoveSection(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:text-emerald-400 disabled:opacity-30"
                      title="Monter"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:text-emerald-400 disabled:opacity-30"
                      title="Descendre"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(sec)}
                      className="p-1 hover:text-emerald-400"
                      title={sec.active ? "Masquer" : "Afficher"}
                    >
                      {sec.active ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectSection(sec)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold ml-1 hover:bg-emerald-500"
                    >
                      <Edit3 className="w-3 h-3" />
                      Modifier
                    </button>
                  </div>

                  {/* 1. HERO CAROUSEL SECTION */}
                  {isHero && (
                    <div
                      onClick={() => onSelectSection(sec)}
                      className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gradient-to-br from-emerald-950 to-neutral-900 cursor-pointer shadow-sm"
                    >
                      {sec.config?.banners?.[0]?.image ? (
                        <img
                          src={sec.config.banners[0].image}
                          alt="Hero"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-900 to-teal-950" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 flex flex-col justify-end text-white">
                        {sec.config?.banners?.[0]?.badgeFr && (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500 text-white w-max mb-1">
                            {sec.config.banners[0].badgeFr}
                          </span>
                        )}
                        <h4 className="text-sm font-extrabold leading-tight">
                          {sec.config?.banners?.[0]?.titleFr || sec.titleFr}
                        </h4>
                        <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                          {sec.config?.banners?.[0]?.subtitleFr || sec.subtitleFr || "Sélection d'exception"}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-neutral-900 text-[10px] font-bold shadow">
                            {sec.config?.banners?.[0]?.ctaFr || "Découvrir"}
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. CATEGORIES SECTION */}
                  {isCategories && (
                    <div onClick={() => onSelectSection(sec)} className="space-y-1.5 cursor-pointer">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-foreground">{sec.titleFr}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Voir tout</span>
                      </div>
                      <div className="flex gap-2 overflow-x-hidden py-1">
                        {(categories.length > 0 ? categories.slice(0, 5) : [
                          { name: "Mode", id: "1" },
                          { name: "High-Tech", id: "2" },
                          { name: "Maison", id: "3" },
                          { name: "Beauté", id: "4" },
                        ]).map((cat: any) => (
                          <div
                            key={cat.id}
                            className="flex flex-col items-center gap-1 shrink-0 w-14"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-muted/80 border border-border/80 flex items-center justify-center overflow-hidden">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <Grid className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-[9px] text-center font-medium text-foreground truncate w-full">
                              {cat.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. FLASH SALE SECTION */}
                  {isFlash && (
                    <div
                      onClick={() => onSelectSection(sec)}
                      className="p-3 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/20 rounded-2xl space-y-2 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <span className="text-xs font-bold text-foreground">{sec.titleFr}</span>
                        </div>
                        {endsAt && Number.isFinite(endsAt.getTime()) && endsAt.getTime() > Date.now() && <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-background px-2 py-0.5 rounded-lg border border-red-500/30 text-red-500">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Fin le {endsAt.toLocaleDateString("fr-FR")}</span>
                        </div>}
                      </div>
                      {selectedProducts.length ? <div className="grid grid-cols-3 gap-1.5">
                        {selectedProducts.map((product) => (
                          <div key={product.id} className="bg-background rounded-xl p-1.5 border border-border/60">
                            <div className="aspect-square bg-muted rounded-lg mb-1 flex items-center justify-center">
                              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full rounded-lg object-cover" /> : <ShoppingBag className="w-4 h-4 text-muted-foreground/40" />}
                            </div>
                            <div className="text-[9px] font-bold text-foreground">{formatPrice(product.price)}</div>
                            {product.comparePrice > product.price ? <div className="text-[8px] text-muted-foreground line-through">{formatPrice(product.comparePrice)}</div> : null}
                          </div>
                        ))}
                      </div> : <p className="text-[10px] text-muted-foreground">Aucun produit sélectionné</p>}
                    </div>
                  )}

                  {/* 4. CANVA / PROMOTIONAL BANNER */}
                  {isBanner && (
                    <div
                      onClick={() => onSelectSection(sec)}
                      className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-neutral-900 border border-border cursor-pointer shadow-sm"
                    >
                      {sec.bannerImage || sec.config?.image || sec.config?.canvaComposition?.backgroundImage ? (
                        <img
                          src={sec.bannerImage || sec.config?.image || sec.config?.canvaComposition?.backgroundImage}
                          alt="Promo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-900 to-indigo-950" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end text-white">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
                          {sec.config?.badge || "OFFRE SPÉCIALE"}
                        </span>
                        <h5 className="text-xs font-bold leading-tight truncate">
                          {sec.titleFr}
                        </h5>
                      </div>
                    </div>
                  )}

                  {/* 4b. CUSTOM BANNER */}
                  {isCustomBanner && (
                    <div
                      onClick={() => onSelectSection(sec)}
                      style={{
                        backgroundColor: sec.config?.backgroundColor || '#1B4332',
                        color: sec.config?.textColor || '#FFFFFF',
                        borderRadius: `${sec.config?.borderRadius ?? 16}px`,
                        padding: `${sec.config?.padding ?? 12}px`,
                      }}
                      className="relative overflow-hidden cursor-pointer shadow-sm transition-transform hover:scale-[1.01]"
                    >
                      {sec.bannerImage && (
                        <img
                          src={sec.bannerImage}
                          alt="Banner"
                          className="absolute inset-0 h-full w-full object-cover opacity-20"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                            style={{
                              backgroundColor: sec.config?.accentColor || '#D4AF37',
                              color: sec.config?.backgroundColor || '#1B4332',
                            }}
                          >
                            Exclusivité
                          </span>
                          <h5 className="text-xs font-bold leading-tight line-clamp-1">
                            {sec.titleFr}
                          </h5>
                          {sec.subtitleFr && (
                            <p className="text-[9px] opacity-85 line-clamp-1">{sec.subtitleFr}</p>
                          )}
                        </div>
                        <span
                          className="shrink-0 text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm"
                          style={{
                            backgroundColor: sec.config?.accentColor || '#D4AF37',
                            color: sec.config?.backgroundColor || '#1B4332',
                          }}
                        >
                          {sec.config?.ctaLabel || 'Découvrir'}
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 5. BRANDS CAROUSEL */}
                  {isBrands && (
                    <div onClick={() => onSelectSection(sec)} className="space-y-1.5 cursor-pointer">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-foreground">{sec.titleFr}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Toutes</span>
                      </div>
                      <div className="flex gap-2 overflow-x-hidden py-1">
                        {(brands.length > 0 ? brands.slice(0, 4) : [
                          { name: "Dior", id: "b1" },
                          { name: "Tefal", id: "b2" },
                          { name: "Apple", id: "b3" },
                        ]).map((brand: any) => (
                          <div
                            key={brand.id}
                            className="h-10 px-3 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center shrink-0"
                          >
                            <span className="text-[10px] font-bold text-foreground">{brand.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. PRODUCTS SECTIONS (Bestsellers / Offers / Nouveautés) */}
                  {!isHero && !isCategories && !isFlash && !isBanner && !isBrands && (
                    <div onClick={() => onSelectSection(sec)} className="space-y-1.5 cursor-pointer">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-foreground">{sec.titleFr}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Voir tout</span>
                      </div>
                      {isCoupons ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] text-emerald-900">Les coupons actifs s’affichent ici selon l’éligibilité du client.</div> : selectedProducts.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedProducts.slice(0, 2).map((product) => (
                            <div key={product.id} className="bg-card border border-border rounded-xl p-2">
                              <div className="aspect-square bg-muted/40 rounded-lg mb-1 flex items-center justify-center overflow-hidden">
                                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />}
                              </div>
                              <div className="text-[10px] font-bold text-foreground truncate">{product.name}</div>
                              <div className="text-[10px] text-emerald-600 font-bold">{formatPrice(product.price)}</div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="rounded-xl border border-border bg-card p-3 text-[10px] text-muted-foreground">Aucun produit sélectionné</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom App Navigation Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border/60 py-2.5 px-6 flex items-center justify-between text-muted-foreground shrink-0 z-30">
            <div className="flex flex-col items-center gap-0.5 text-emerald-600">
              <Smartphone className="w-4 h-4" />
              <span className="text-[8px] font-bold">Accueil</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Grid className="w-4 h-4" />
              <span className="text-[8px]">Rayons</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Heart className="w-4 h-4" />
              <span className="text-[8px]">Favoris</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <User className="w-4 h-4" />
              <span className="text-[8px]">Compte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
