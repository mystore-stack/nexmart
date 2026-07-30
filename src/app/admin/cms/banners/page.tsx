"use client";
// src/app/admin/cms/banners/page.tsx — Banner Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Plus, Search, Trash2, Edit2, Eye, EyeOff, Calendar, Save, RefreshCw, MoveUp, MoveDown, Check
} from "lucide-react";
import toast from "react-hot-toast";

interface Banner {
  id: string;
  bannerType: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  image: string;
  link: string;
  ctaText: string;
  order: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/banners");
      const data = await res.json();
      if (data.success && data.data) {
        setBanners(data.data);
      }
    } catch {
      toast.error("Erreur lors du chargement des bannières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Bannière désactivée" : "Bannière activée");
        fetchBanners();
      }
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette bannière ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Bannière supprimée");
        fetchBanners();
      }
    } catch {
      toast.error("Échec de la suppression");
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title || !editingBanner?.image) {
      toast.error("Le titre et l'image sont requis");
      return;
    }

    try {
      const method = editingBanner.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });

      if (res.ok) {
        toast.success(editingBanner.id ? "Bannière mise à jour" : "Bannière créée");
        setIsModalOpen(false);
        setEditingBanner(null);
        fetchBanners();
      }
    } catch {
      toast.error("Erreur d'enregistrement");
    }
  };

  const filteredBanners = banners.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    (b.subtitle && b.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion des Bannières (Hero & Promo)</h1>
            <p className="text-xs text-muted-foreground">Création, programmation et réordonnancement des bannières homepage.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingBanner({ bannerType: "HERO", active: true, ctaText: "Découvrir", link: "/products" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter une Bannière
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une bannière..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 h-10 w-full"
          />
        </div>
        <button onClick={fetchBanners} className="btn-ghost p-2.5 rounded-xl border border-border">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Banners List Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chargement des bannières...</div>
        ) : filteredBanners.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune bannière trouvée.</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBanners.map((banner) => (
              <div key={banner.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-surface flex-shrink-0 border">
                    <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                        {banner.bannerType}
                      </span>
                      <h3 className="text-sm font-bold text-foreground truncate">{banner.title}</h3>
                    </div>
                    {banner.subtitle && <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>}
                    <p className="text-[11px] text-muted-foreground mt-0.5">Lien: {banner.link}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(banner.id, banner.active)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      banner.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {banner.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {banner.active ? "Actif" : "Masqué"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsModalOpen(true);
                    }}
                    className="btn-ghost p-2 rounded-xl hover:bg-muted"
                  >
                    <Edit2 className="w-4 h-4 text-brand-700" />
                  </button>

                  <button onClick={() => handleDelete(banner.id)} className="btn-ghost p-2 rounded-xl hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-luxury space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              {editingBanner?.id ? "Modifier la Bannière" : "Ajouter une Bannière"}
            </h2>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Type de Bannière</label>
                <select
                  value={editingBanner?.bannerType || "HERO"}
                  onChange={(e) => setEditingBanner({ ...editingBanner, bannerType: e.target.value })}
                  className="input w-full"
                >
                  <option value="HERO">HERO Banner (Grand format)</option>
                  <option value="PROMO">PROMO Banner (Secondaire)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={editingBanner?.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Sous-titre / Description</label>
                <input
                  type="text"
                  value={editingBanner?.subtitle || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">URL de l'Image</label>
                <input
                  type="text"
                  value={editingBanner?.image || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                  className="input w-full"
                  placeholder="/images/... ou URL web"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Lien de destination</label>
                  <input
                    type="text"
                    value={editingBanner?.link || "/products"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Texte du Bouton</label>
                  <input
                    type="text"
                    value={editingBanner?.ctaText || "Découvrir"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={editingBanner?.active ?? true}
                  onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="active-check" className="font-bold text-foreground">Bannière active et visible sur le site</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline px-4 py-2 text-xs">
                  Annuler
                </button>
                <button type="submit" className="btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5">
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
