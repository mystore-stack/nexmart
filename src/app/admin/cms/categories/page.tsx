"use client";
// src/app/admin/cms/categories/page.tsx — Category Grid Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Grid, Search, Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: { products: number };
}

export default function AdminCategoriesCmsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch {
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Grid className="w-6 h-6 text-amber-600" /> Gestion de la Grille des Catégories
            </h1>
            <p className="text-xs text-muted-foreground">Ordre d'affichage, illustrations et masquage des catégories.</p>
          </div>
        </div>

        <Link href="/admin/categories" className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl">
          Gérer les Catégories Produits
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 h-10 w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chargement des catégories...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune catégorie trouvée.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center border border-amber-200">
                    {cat.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">Slug: /{cat.slug} · {cat._count?.products || 0} produits</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Visible Homepage
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
