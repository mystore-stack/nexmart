"use client";
// src/app/admin/cms/promo-banners/page.tsx — Promo Banners Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Eye, EyeOff, Save, RefreshCw, MoveUp, MoveDown, Zap } from "lucide-react";
import toast from "react-hot-toast";

interface PromoBannerItem {
  id: string;
  iconName: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
  gradient: string;
  accentColor?: string;
  order: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export default function AdminPromoBannersPage() {
  const [items, setItems] = useState<PromoBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PromoBannerItem> | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/promo-banners");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        setItems([]);
      }
    } catch {
      toast.error("Erreur de chargement");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/promo-banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Bannière masquée" : "Bannière activée");
        fetchItems();
      }
    } catch {
      toast.error("Mise à jour échouée");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette bannière promo ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/promo-banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Bannière supprimée");
        fetchItems();
      }
    } catch {
      toast.error("Suppression échouée");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    await reorderItems(newItems);
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    await reorderItems(newItems);
  };

  const reorderItems = async (newItems: PromoBannerItem[]) => {
    try {
      const res = await fetch("/api/admin/cms/promo-banners/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newItems.map((s, i) => ({ id: s.id, order: i })) }),
      });
      if (res.ok) {
        setItems(newItems);
        toast.success("Ordre mis à jour");
      }
    } catch {
      toast.error("Erreur lors du réordonnancement");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title) {
      toast.error("Le titre est requis");
      return;
    }

    try {
      const method = editingItem.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/promo-banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        toast.success("Bannière promo enregistrée");
        setIsModalOpen(false);
        setEditingItem(null);
        fetchItems();
      }
    } catch {
      toast.error("Erreur de sauvegarde");
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
              <Zap className="w-6 h-6 text-amber-600" /> Gestion des Bannières Promo
            </h1>
            <p className="text-xs text-muted-foreground">Bannières d'avantages exclusifs (Livraison, VIP, Nouveautés).</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItem({ iconName: "Zap", active: true, cta: "Profiter", href: "/products", gradient: "from-brand-800 via-brand-700 to-brand-600" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter une Bannière
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-sm text-muted-foreground">Aucune bannière promo configurée.</div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="p-5 rounded-3xl border border-border bg-card flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="btn-ghost p-1 rounded hover:bg-muted disabled:opacity-30">
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="btn-ghost p-1 rounded hover:bg-muted disabled:opacity-30">
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                      #{item.order + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  {item.subtitle && <p className="text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">Lien: {item.href}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <button
                  onClick={() => handleToggleActive(item.id, item.active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    item.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {item.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {item.active ? "Actif" : "Masqué"}
                </button>

                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="btn-ghost p-1.5">
                    <Edit2 className="w-4 h-4 text-brand-700" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-ghost p-1.5">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-luxury space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              {editingItem?.id ? "Modifier la Bannière" : "Ajouter une Bannière"}
            </h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom de l'icône (Lucide)</label>
                <input
                  type="text"
                  value={editingItem?.iconName || "Zap"}
                  onChange={(e) => setEditingItem({ ...editingItem, iconName: e.target.value })}
                  className="input w-full"
                  placeholder="Zap, Crown, Gift, etc."
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={editingItem?.eyebrow || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, eyebrow: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={editingItem?.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sous-titre / Description</label>
                <input
                  type="text"
                  value={editingItem?.subtitle || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Lien Destination</label>
                  <input
                    type="text"
                    value={editingItem?.href || "/products"}
                    onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Texte CTA</label>
                  <input
                    type="text"
                    value={editingItem?.cta || "Profiter"}
                    onChange={(e) => setEditingItem({ ...editingItem, cta: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Gradient CSS</label>
                <input
                  type="text"
                  value={editingItem?.gradient || "from-brand-800 via-brand-700 to-brand-600"}
                  onChange={(e) => setEditingItem({ ...editingItem, gradient: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Couleur d'accent</label>
                <input
                  type="color"
                  value={editingItem?.accentColor || "#0F766E"}
                  onChange={(e) => setEditingItem({ ...editingItem, accentColor: e.target.value })}
                  className="input w-full h-10"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={editingItem?.active ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="active-check" className="font-bold text-foreground">Bannière active</label>
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
