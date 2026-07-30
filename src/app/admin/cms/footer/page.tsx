"use client";
// src/app/admin/cms/footer/page.tsx — Footer Configuration Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, LayoutTemplate } from "lucide-react";
import toast from "react-hot-toast";

interface FooterConfig {
  id?: string;
  brandName: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  copyrightText: string;
  active: boolean;
}

export default function AdminFooterPage() {
  const [config, setConfig] = useState<FooterConfig>({
    brandName: "NexMart",
    tagline: "Maroc · Premium",
    description: "La marketplace premium du Maroc — shopping intelligent, artisanat authentique et expérience d'achat d'exception.",
    address: "Casablanca, Maroc",
    phone: "+212 5XX-XXXXXX",
    email: "contact@nexmart.ma",
    copyrightText: "© 2026 NexMart Maroc. Tous droits réservés.",
    active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cms/footer")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConfig(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/cms/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        toast.success("Paramètres Pied de Page sauvegardés avec succès !");
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-gray-700" /> Gestion du Pied de Page (Footer)
          </h1>
          <p className="text-xs text-muted-foreground">Coordonnées, descriptions, droits d'auteur et mentions légales.</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Chargement...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Nom du Site / Marque</label>
                <input
                  type="text"
                  value={config.brandName}
                  onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Description de la Marque</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold block mb-1">Adresse Physiques</label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Téléphone Support</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Email Contact</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Texte de Copyright (Droits d'auteur)</label>
              <input
                type="text"
                value={config.copyrightText}
                onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button type="submit" className="btn-primary px-6 py-2.5 font-bold text-xs inline-flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
