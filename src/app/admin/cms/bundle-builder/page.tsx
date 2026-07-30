"use client";
// src/app/admin/cms/bundle-builder/page.tsx — Bundle Builder Configuration Management with Product Selector
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { ProductSelector } from "@/components/admin/ProductSelector";
import { SectionSettings } from "@/components/admin/SectionSettings";

interface BundleConfig {
  id?: string;
  title: string;
  subtitle: string;
  maxDiscountPercent: number;
  ctaText: string;
  active: boolean;
}

interface SelectedProduct {
  id: string;
  order: number;
  customPrice?: number;
  customBadge?: string;
  active: boolean;
  product: any;
}

export default function AdminBundleBuilderPage() {
  const [config, setConfig] = useState<BundleConfig>({
    title: "CRÉEZ VOTRE BUNDLE",
    subtitle: "Choisissez vos produits préférés et économisez jusqu'à 30%",
    maxDiscountPercent: 30,
    ctaText: "Créer mon bundle",
    active: true,
  });
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxProducts, setMaxProducts] = useState(12);
  const [section, setSection] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/cms/bundle-builder").then((res) => res.json()),
      fetch("/api/admin/cms/homepage-sections/bundleBuilder/products").then((res) => res.json()),
    ])
      .then(([configData, productsData]) => {
        if (configData.success && configData.data) {
          setConfig(configData.data);
        }
        if (productsData.success && productsData.data) {
          setSelectedProducts(productsData.data);
          if (productsData.section?.maxProducts) {
            setMaxProducts(productsData.section.maxProducts);
          }
          setSection(productsData.section);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/cms/bundle-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        toast.success("Configuration du Bundle Builder enregistrée !");
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  const handleSettingsChange = (newSettings: any) => {
    setSection(newSettings);
    if (newSettings.maxProducts) {
      setMaxProducts(newSettings.maxProducts);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-700" /> Constructeur de Packs (Bundle Builder)
            </h1>
            <p className="text-xs text-muted-foreground">Configuration et sélection de produits pour la section bundle.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SectionSettings sectionKey="bundleBuilder" onSettingsChange={handleSettingsChange} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground">Configuration</h2>
          {loading ? (
            <div className="text-center text-sm text-muted-foreground">Chargement...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Titre de la Section Bundle</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sous-titre / Explication</label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Remise Maximale (%)</label>
                  <input
                    type="number"
                    value={config.maxDiscountPercent}
                    onChange={(e) => setConfig({ ...config, maxDiscountPercent: parseInt(e.target.value) })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Texte Bouton CTA</label>
                  <input
                    type="text"
                    value={config.ctaText}
                    onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button type="submit" className="btn-primary px-6 py-2.5 font-bold text-xs inline-flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Sauvegarder
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
              <div className="w-10 h-10 border-2 border-border border-t-brand-700 rounded-full animate-spin mx-auto" />
              <p className="font-bold text-foreground">Chargement des produits...</p>
            </div>
          ) : (
            <ProductSelector
              sectionKey="bundleBuilder"
              maxProducts={maxProducts}
              initialProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
