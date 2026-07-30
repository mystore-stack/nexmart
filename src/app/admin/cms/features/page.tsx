"use client";
// src/app/admin/cms/features/page.tsx — Features Bar Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Eye, EyeOff, Save, Sliders } from "lucide-react";
import toast from "react-hot-toast";

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  order: number;
  active: boolean;
}

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Partial<FeatureItem> | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/features");
      const data = await res.json();
      if (data.success && data.data) {
        setFeatures(data.data);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Avantage masqué" : "Avantage activé");
        fetchFeatures();
      }
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet avantage ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/features?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Avantage supprimé");
        fetchFeatures();
      }
    } catch {
      toast.error("Suppression échouée");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature?.title || !editingFeature?.subtitle) {
      toast.error("Titre et sous-titre obligatoires");
      return;
    }

    try {
      const method = editingFeature.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/features", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFeature),
      });

      if (res.ok) {
        toast.success("Avantage enregistré");
        setIsModalOpen(false);
        setEditingFeature(null);
        fetchFeatures();
      }
    } catch {
      toast.error("Erreur d'enregistrement");
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
              <Sliders className="w-6 h-6 text-rose-600" /> Gestion des Avantages (Features Bar)
            </h1>
            <p className="text-xs text-muted-foreground">Livraison Rapide, Paiement Sécurisé, Retours, Support 24/7.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingFeature({ active: true, iconName: "Truck" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter un Avantage
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : features.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Aucun avantage configuré.</div>
        ) : (
          features.map((feat) => (
            <div key={feat.id} className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                  Icon: {feat.iconName}
                </span>
                <h3 className="text-base font-bold text-foreground mt-1">{feat.title}</h3>
                <p className="text-xs text-muted-foreground">{feat.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(feat.id, feat.active)}
                  className={`p-2 rounded-xl border ${feat.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                >
                  {feat.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditingFeature(feat); setIsModalOpen(true); }} className="btn-ghost p-2">
                  <Edit2 className="w-4 h-4 text-brand-700" />
                </button>
                <button onClick={() => handleDelete(feat.id)} className="btn-ghost p-2">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-luxury space-y-4">
            <h2 className="text-lg font-bold text-foreground">Avantage Client</h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={editingFeature?.title || ""}
                  onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sous-titre / Description</label>
                <input
                  type="text"
                  value={editingFeature?.subtitle || ""}
                  onChange={(e) => setEditingFeature({ ...editingFeature, subtitle: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Icône (Truck, ShieldCheck, RefreshCw, Headphones)</label>
                <select
                  value={editingFeature?.iconName || "Truck"}
                  onChange={(e) => setEditingFeature({ ...editingFeature, iconName: e.target.value })}
                  className="input w-full"
                >
                  <option value="Truck">Truck (Livraison)</option>
                  <option value="ShieldCheck">ShieldCheck (Paiement Sécurisé)</option>
                  <option value="RefreshCw">RefreshCw (Retours)</option>
                  <option value="Headphones">Headphones (Support 24/7)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline px-4 py-2">
                  Annuler
                </button>
                <button type="submit" className="btn-primary px-5 py-2 font-bold inline-flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
