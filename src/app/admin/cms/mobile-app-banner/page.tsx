"use client";
// src/app/admin/cms/mobile-app-banner/page.tsx — Mobile App Banner Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RefreshCw, Smartphone, QrCode } from "lucide-react";
import toast from "react-hot-toast";

interface MobileAppBanner {
  id?: string;
  title: string;
  subtitle?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
  qrCodeImage?: string;
  features?: any[];
  active: boolean;
}

export default function AdminMobileAppBannerPage() {
  const [banner, setBanner] = useState<MobileAppBanner>({
    title: "Toute la marketplace premium directement sur votre smartphone.",
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/mobile-app-banner");
      const data = await res.json();
      if (data.success && data.data) {
        setBanner(data.data);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = banner.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/mobile-app-banner", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Bannière mobile enregistrée");
        if (data.data) setBanner(data.data);
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const newFeatures = banner.features || [];
    newFeatures.push({ icon: "Zap", text: "Nouvelle fonctionnalité" });
    setBanner({ ...banner, features: newFeatures });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...(banner.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setBanner({ ...banner, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(banner.features || [])];
    newFeatures.splice(index, 1);
    setBanner({ ...banner, features: newFeatures });
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
              <Smartphone className="w-6 h-6 text-brand-600" /> Gestion de la Bannière App Mobile
            </h1>
            <p className="text-xs text-muted-foreground">Configuration de la section de téléchargement de l'application.</p>
          </div>
        </div>

        <button onClick={fetchBanner} className="btn-ghost p-2.5 rounded-xl border border-border">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground">Contenu Principal</h3>

            <div>
              <label className="font-bold text-foreground block mb-1 text-xs">Titre principal</label>
              <input
                type="text"
                value={banner.title || ""}
                onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1 text-xs">Sous-titre</label>
              <textarea
                value={banner.subtitle || ""}
                onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                className="input w-full"
                rows={2}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground">Liens de Téléchargement</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-foreground block mb-1 text-xs">URL App Store</label>
                <input
                  type="text"
                  value={banner.appStoreUrl || ""}
                  onChange={(e) => setBanner({ ...banner, appStoreUrl: e.target.value })}
                  className="input w-full"
                  placeholder="https://apps.apple.com/..."
                />
              </div>
              <div>
                <label className="font-bold text-foreground block mb-1 text-xs">URL Google Play</label>
                <input
                  type="text"
                  value={banner.googlePlayUrl || ""}
                  onChange={(e) => setBanner({ ...banner, googlePlayUrl: e.target.value })}
                  className="input w-full"
                  placeholder="https://play.google.com/..."
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1 text-xs">URL Image QR Code</label>
              <input
                type="text"
                value={banner.qrCodeImage || ""}
                onChange={(e) => setBanner({ ...banner, qrCodeImage: e.target.value })}
                className="input w-full"
                placeholder="/images/qr-code.png"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Fonctionnalités de l'App
              </h3>
              <button type="button" onClick={addFeature} className="btn-ghost text-xs px-3 py-1.5 rounded-lg border border-border">
                + Ajouter
              </button>
            </div>

            {banner.features && banner.features.length > 0 ? (
              <div className="space-y-3">
                {banner.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Icône</label>
                        <input
                          type="text"
                          value={feature.icon || ""}
                          onChange={(e) => updateFeature(index, "icon", e.target.value)}
                          className="input w-full text-xs"
                          placeholder="Zap, Bell, ShieldCheck, QrCode"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Texte</label>
                        <input
                          type="text"
                          value={feature.text || ""}
                          onChange={(e) => updateFeature(index, "text", e.target.value)}
                          className="input w-full text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="btn-ghost p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Aucune fonctionnalité configurée.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active-check"
                checked={banner.active ?? true}
                onChange={(e) => setBanner({ ...banner, active: e.target.checked })}
                className="rounded border-border w-5 h-5"
              />
              <label htmlFor="active-check" className="font-bold text-foreground">Bannière active sur le site</label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
