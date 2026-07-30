"use client";
// src/app/admin/cms/new-arrivals/page.tsx — New Arrivals Management with Product Selector
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { ProductSelector } from "@/components/admin/ProductSelector";
import { SectionSettings } from "@/components/admin/SectionSettings";

interface SelectedProduct {
  id: string;
  order: number;
  customPrice?: number;
  customBadge?: string;
  active: boolean;
  product: any;
}

export default function AdminNewArrivalsPage() {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxProducts, setMaxProducts] = useState(8);
  const [section, setSection] = useState<any>(null);

  const fetchSectionProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/homepage-sections/showcaseGrid/products");
      const data = await res.json();
      
      if (data.success && data.data) {
        setSelectedProducts(data.data);
        if (data.section?.maxProducts) {
          setMaxProducts(data.section.maxProducts);
        }
        setSection(data.section);
      }
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionProducts();
  }, []);

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
              <PackagePlus className="w-6 h-6 text-teal-600" /> Gestion des Nouveautés
            </h1>
            <p className="text-xs text-muted-foreground">Sélectionnez les produits à afficher dans la section Nouveautés.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SectionSettings sectionKey="showcaseGrid" onSettingsChange={handleSettingsChange} />
        </div>
      </div>

      {loading ? (
        <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
          <div className="w-10 h-10 border-2 border-border border-t-brand-700 rounded-full animate-spin mx-auto" />
          <p className="font-bold text-foreground">Chargement des nouveautés...</p>
        </div>
      ) : (
        <ProductSelector
          sectionKey="showcaseGrid"
          maxProducts={maxProducts}
          initialProducts={selectedProducts}
          onSelectionChange={setSelectedProducts}
        />
      )}
    </div>
  );
}
