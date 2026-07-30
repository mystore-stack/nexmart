"use client";
// src/app/admin/cms/mystery-boxes/page.tsx — Mystery Boxes Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Edit2, Eye, EyeOff, Save, Gift } from "lucide-react";
import toast from "react-hot-toast";

interface MysteryBoxConfig {
  id: string;
  title: string;
  subtitle?: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  link: string;
  ctaText: string;
  active: boolean;
}

export default function AdminMysteryBoxesPage() {
  const [items, setItems] = useState<MysteryBoxConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MysteryBoxConfig>>({});

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/mystery-boxes");
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
      const res = await fetch("/api/admin/cms/mystery-boxes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Masqué" : "Activé");
        fetchItems();
      }
    } catch {
      toast.error("Erreur mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette boîte mystère ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/mystery-boxes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Supprimé");
        fetchItems();
      }
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.startingPrice || !editingItem?.image) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const method = editingItem.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/mystery-boxes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        toast.success("Boîte Mystère enregistrée");
        setIsModalOpen(false);
        setEditingItem({});
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
              <Gift className="w-6 h-6 text-pink-600" /> Gestion des Mystery Boxes
            </h1>
            <p className="text-xs text-muted-foreground">Configuration de la carte 3D Mystery Box et des tarifs de départ.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItem({ active: true, startingPrice: 199, rating: 4.9, reviewCount: 4502, ctaText: "Découvrir", link: "/products?tag=mystery-box", image: "/images/promo_mystery_box.jpg" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter une Mystery Box
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Aucune Mystery Box configurée.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-5 rounded-3xl border border-border bg-card flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-200">
                    À partir de {item.startingPrice} DH
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-1">{item.title}</h3>
                  {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                </div>

                <div className="relative h-16 w-20 rounded-xl overflow-hidden bg-surface border flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-contain" />
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
            <h2 className="text-lg font-bold text-foreground">Boîte Mystère</h2>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Titre principal</label>
                <input type="text" value={editingItem?.title || ""} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className="input w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Prix à partir de (DH)</label>
                  <input type="number" value={editingItem?.startingPrice || 199} onChange={(e) => setEditingItem({ ...editingItem, startingPrice: parseFloat(e.target.value) })} className="input w-full" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Note (étoiles)</label>
                  <input type="number" step="0.1" value={editingItem?.rating || 4.9} onChange={(e) => setEditingItem({ ...editingItem, rating: parseFloat(e.target.value) })} className="input w-full" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Image URL</label>
                <input type="text" value={editingItem?.image || ""} onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })} className="input w-full" required />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline px-4 py-2">Annuler</button>
                <button type="submit" className="btn-primary px-5 py-2 font-bold inline-flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
