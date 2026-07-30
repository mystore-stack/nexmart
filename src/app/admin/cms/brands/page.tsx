"use client";
// src/app/admin/cms/brands/page.tsx — Brands Partner Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Trash2, Edit2, Eye, EyeOff, Save, Building2 } from "lucide-react";
import toast from "react-hot-toast";

interface BrandPartner {
  id: string;
  name: string;
  logo?: string;
  fontStyle?: string;
  iconText?: string;
  link: string;
  order: number;
  active: boolean;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<BrandPartner> | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/brands");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBrands(data.data);
      } else {
        setBrands([]);
      }
    } catch {
      toast.error("Erreur de chargement");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Marque masquée" : "Marque activée");
        fetchBrands();
      }
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/brands?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Marque supprimée");
        fetchBrands();
      }
    } catch {
      toast.error("Suppression échouée");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?.name) {
      toast.error("Nom de la marque obligatoire");
      return;
    }

    try {
      const method = editingBrand.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/brands", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBrand),
      });

      if (res.ok) {
        toast.success("Marque enregistrée");
        setIsModalOpen(false);
        setEditingBrand(null);
        fetchBrands();
      }
    } catch {
      toast.error("Erreur d'enregistrement");
    }
  };

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-slate-700" /> Gestion des Marques Partenaires
            </h1>
            <p className="text-xs text-muted-foreground">Logos, ordre et liens des marques sur la homepage.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingBrand({ active: true, link: "/products" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter une Marque
        </button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une marque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 h-10 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 p-8 text-center text-sm text-muted-foreground">Chargement des marques...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-4 p-8 text-center text-sm text-muted-foreground">Aucune marque trouvée.</div>
        ) : (
          filtered.map((brand) => (
            <div key={brand.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col justify-between space-y-3 shadow-sm">
              <div className="text-center py-2">
                <span className="font-display text-xl font-bold text-foreground">{brand.name}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{brand.link}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <button
                  onClick={() => handleToggleActive(brand.id, brand.active)}
                  className={`p-1.5 rounded-lg text-xs ${brand.active ? "text-emerald-600 bg-emerald-50" : "text-gray-400 bg-gray-100"}`}
                >
                  {brand.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingBrand(brand); setIsModalOpen(true); }} className="btn-ghost p-1.5">
                    <Edit2 className="w-4 h-4 text-brand-700" />
                  </button>
                  <button onClick={() => handleDelete(brand.id)} className="btn-ghost p-1.5">
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
            <h2 className="text-lg font-bold text-foreground">Marque Partenaire</h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom de la Marque</label>
                <input
                  type="text"
                  value={editingBrand?.name || ""}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Logo URL / Image (optionnel)</label>
                <input
                  type="text"
                  value={editingBrand?.logo || ""}
                  onChange={(e) => setEditingBrand({ ...editingBrand, logo: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Lien de destination</label>
                <input
                  type="text"
                  value={editingBrand?.link || "/products"}
                  onChange={(e) => setEditingBrand({ ...editingBrand, link: e.target.value })}
                  className="input w-full"
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
