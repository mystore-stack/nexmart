"use client";
// src/app/admin/cms/mystery-boxes/manage/page.tsx — Mystery Box Management (New Feature)
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Eye, EyeOff, Save, Gift, Package, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

interface MysteryItem {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  weight: number;
}

interface MysteryBox {
  id: string;
  title: string;
  description: string | null;
  image: string;
  price: number;
  oldPrice: number | null;
  isActive: boolean;
  minGuaranteedValue: number | null;
  maxProfitPercent: number | null;
  order: number;
  startDate: string | null;
  endDate: string | null;
  items: MysteryItem[];
  _count: {
    items: number;
    opens: number;
  };
}

export default function AdminMysteryBoxesManagePage() {
  const [boxes, setBoxes] = useState<MysteryBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<Partial<MysteryBox>>({});
  const [editingItem, setEditingItem] = useState<Partial<MysteryItem> & { boxId?: string }>({});
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/mystery-boxes/manage");
      const data = await res.json();
      if (data.success && Array.isArray(data.boxes)) {
        setBoxes(data.boxes);
      } else {
        setBoxes([]);
      }
    } catch {
      toast.error("Erreur de chargement");
      setBoxes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/mystery-boxes/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Masqué" : "Activé");
        fetchBoxes();
      }
    } catch {
      toast.error("Erreur mise à jour");
    }
  };

  const handleDeleteBox = async (id: string) => {
    if (!confirm("Supprimer cette boîte mystère et tous ses articles ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/mystery-boxes/manage?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Supprimé");
        fetchBoxes();
      }
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const handleSaveBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBox?.title || !editingBox?.price || !editingBox?.image) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const method = editingBox.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/mystery-boxes/manage", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBox),
      });

      if (res.ok) {
        toast.success("Boîte Mystère enregistrée");
        setIsBoxModalOpen(false);
        setEditingBox({});
        fetchBoxes();
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.image || !editingItem?.value || !selectedBoxId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const method = editingItem.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/mystery-boxes/manage/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingItem, boxId: selectedBoxId }),
      });

      if (res.ok) {
        toast.success("Article enregistré");
        setIsItemModalOpen(false);
        setEditingItem({});
        fetchBoxes();
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/mystery-boxes/manage/items?id=${itemId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Article supprimé");
        fetchBoxes();
      }
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const rarityColors = {
    COMMON: "bg-gray-100 text-gray-700 border-gray-200",
    RARE: "bg-blue-100 text-blue-700 border-blue-200",
    EPIC: "bg-purple-100 text-purple-700 border-purple-200",
    LEGENDARY: "bg-amber-100 text-amber-700 border-amber-200",
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
            <p className="text-xs text-muted-foreground">Créez et gérez vos boîtes mystères avec leurs articles.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingBox({ isActive: true, price: 199, order: 0 });
            setIsBoxModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Nouvelle Boîte
        </button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : boxes.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune Mystery Box configurée.</div>
        ) : (
          boxes.map((box) => (
            <div key={box.id} className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-surface border flex-shrink-0">
                    <img src={box.image} alt={box.title} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{box.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${box.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {box.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    {box.description && <p className="text-sm text-muted-foreground">{box.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-semibold text-foreground">{box.price.toLocaleString("fr-MA")} DH</span>
                      {box.oldPrice && (
                        <span className="text-muted-foreground line-through">{box.oldPrice.toLocaleString("fr-MA")} DH</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{box._count.items} articles</span>
                      <span>{box._count.opens} ouvertures</span>
                      {box.minGuaranteedValue && (
                        <span className="text-emerald-600">Min: {box.minGuaranteedValue.toLocaleString("fr-MA")} DH</span>
                      )}
                      {box.maxProfitPercent && (
                        <span className="text-amber-600">Max profit: +{box.maxProfitPercent}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => handleToggleActive(box.id, box.isActive)} className="btn-ghost p-1.5">
                    {box.isActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => { setEditingBox(box); setIsBoxModalOpen(true); }} className="btn-ghost p-1.5">
                    <Edit2 className="w-4 h-4 text-brand-700" />
                  </button>
                  <button onClick={() => handleDeleteBox(box.id)} className="btn-ghost p-1.5">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" /> Articles ({box.items.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedBoxId(box.id);
                      setEditingItem({ rarity: "COMMON", weight: 1.0 });
                      setIsItemModalOpen(true);
                    }}
                    className="btn-outline inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>

                {box.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun article</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {box.items.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl border border-border bg-surface flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{item.value.toLocaleString("fr-MA")} DH</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${rarityColors[item.rarity]}`}>
                              {item.rarity}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteItem(item.id)} className="btn-ghost p-1">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Box Modal */}
      {isBoxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground">{editingBox.id ? "Modifier" : "Nouvelle"} Boîte Mystère</h2>
            <form onSubmit={handleSaveBox} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Titre *</label>
                <input type="text" value={editingBox?.title || ""} onChange={(e) => setEditingBox({ ...editingBox, title: e.target.value })} className="input w-full" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea value={editingBox?.description || ""} onChange={(e) => setEditingBox({ ...editingBox, description: e.target.value })} className="input w-full" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Prix (DH) *</label>
                  <input type="number" value={editingBox?.price || 0} onChange={(e) => setEditingBox({ ...editingBox, price: parseFloat(e.target.value) })} className="input w-full" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Ancien Prix (DH)</label>
                  <input type="number" value={editingBox?.oldPrice || ""} onChange={(e) => setEditingBox({ ...editingBox, oldPrice: e.target.value ? parseFloat(e.target.value) : null })} className="input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Valeur min. garantie (DH)</label>
                  <input type="number" value={editingBox?.minGuaranteedValue || ""} onChange={(e) => setEditingBox({ ...editingBox, minGuaranteedValue: e.target.value ? parseFloat(e.target.value) : null })} className="input w-full" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Max profit (%)</label>
                  <input type="number" value={editingBox?.maxProfitPercent || ""} onChange={(e) => setEditingBox({ ...editingBox, maxProfitPercent: e.target.value ? parseFloat(e.target.value) : null })} className="input w-full" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Image URL *</label>
                <input type="text" value={editingBox?.image || ""} onChange={(e) => setEditingBox({ ...editingBox, image: e.target.value })} className="input w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Ordre</label>
                  <input type="number" value={editingBox?.order || 0} onChange={(e) => setEditingBox({ ...editingBox, order: parseInt(e.target.value) })} className="input w-full" />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="isActive" checked={editingBox?.isActive ?? true} onChange={(e) => setEditingBox({ ...editingBox, isActive: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="isActive" className="font-bold">Actif</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsBoxModalOpen(false)} className="btn-outline px-4 py-2">Annuler</button>
                <button type="submit" className="btn-primary px-5 py-2 font-bold inline-flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-luxury space-y-4">
            <h2 className="text-lg font-bold text-foreground">{editingItem.id ? "Modifier" : "Nouvel"} Article</h2>
            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom *</label>
                <input type="text" value={editingItem?.name || ""} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="input w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Valeur (DH) *</label>
                  <input type="number" value={editingItem?.value || 0} onChange={(e) => setEditingItem({ ...editingItem, value: parseFloat(e.target.value) })} className="input w-full" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Poids</label>
                  <input type="number" step="0.1" value={editingItem?.weight || 1.0} onChange={(e) => setEditingItem({ ...editingItem, weight: parseFloat(e.target.value) })} className="input w-full" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Rareté</label>
                <select value={editingItem?.rarity || "COMMON"} onChange={(e) => setEditingItem({ ...editingItem, rarity: e.target.value as any })} className="input w-full">
                  <option value="COMMON">Commun</option>
                  <option value="RARE">Rare</option>
                  <option value="EPIC">Épique</option>
                  <option value="LEGENDARY">Légendaire</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Image URL *</label>
                <input type="text" value={editingItem?.image || ""} onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })} className="input w-full" required />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="btn-outline px-4 py-2">Annuler</button>
                <button type="submit" className="btn-primary px-5 py-2 font-bold inline-flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
