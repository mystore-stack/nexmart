"use client";
// src/app/admin/cms/service-banners/page.tsx — Service Banners Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Edit2, Eye, EyeOff, Save, Truck } from "lucide-react";
import toast from "react-hot-toast";

interface ServiceBanner {
  id: string;
  bannerKey: string;
  title: string;
  highlightText?: string;
  subtitle?: string;
  image: string;
  link: string;
  ctaText: string;
  active: boolean;
}

export default function AdminServiceBannersPage() {
  const [banners, setBanners] = useState<ServiceBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<ServiceBanner> | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/service-banners");
      const data = await res.json();
      if (data.success && data.data) {
        setBanners(data.data);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/service-banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Bannière masquée" : "Bannière activée");
        fetchBanners();
      }
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.bannerKey || !editingBanner?.title || !editingBanner?.image) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      const method = editingBanner.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/service-banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });

      if (res.ok) {
        toast.success("Bannière de service enregistrée");
        setIsModalOpen(false);
        setEditingBanner(null);
        fetchBanners();
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
              <Truck className="w-6 h-6 text-emerald-600" /> Bannières de Service (Livraison & Cash On Delivery)
            </h1>
            <p className="text-xs text-muted-foreground">Gestion des deux grandes bannières promotionnelles de services.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingBanner({ bannerKey: "FAST_DELIVERY", active: true, ctaText: "En savoir plus", link: "/shipping" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Configurer une Bannière
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Aucune bannière de service enregistrée.</div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="p-6 rounded-3xl border border-border bg-card flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-200">
                    {banner.bannerKey}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{banner.title}</h3>
                  {banner.subtitle && <p className="text-xs text-muted-foreground leading-relaxed">{banner.subtitle}</p>}
                </div>

                <div className="relative h-20 w-24 rounded-2xl overflow-hidden bg-surface border flex-shrink-0">
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <button
                  onClick={() => handleToggleActive(banner.id, banner.active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    banner.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {banner.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {banner.active ? "Actif" : "Masqué"}
                </button>

                <button onClick={() => { setEditingBanner(banner); setIsModalOpen(true); }} className="btn-outline px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" /> Éditer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-luxury space-y-4">
            <h2 className="text-lg font-bold text-foreground">Bannière de Service</h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Clé Identifiante (FAST_DELIVERY / CASH_ON_DELIVERY)</label>
                <input
                  type="text"
                  value={editingBanner?.bannerKey || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, bannerKey: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={editingBanner?.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Texte en surbrillance (highlight)</label>
                <input
                  type="text"
                  value={editingBanner?.highlightText || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, highlightText: e.target.value })}
                  className="input w-full"
                  placeholder="24H - 48H / 100% sécurisé"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sous-titre</label>
                <input
                  type="text"
                  value={editingBanner?.subtitle || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingBanner?.image || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                  className="input w-full"
                  required
                />
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
