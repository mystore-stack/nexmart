"use client";
// src/app/admin/cms/hero/page.tsx — Hero Slides Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Search, Trash2, Edit2, Eye, EyeOff, Save, RefreshCw, MoveUp, MoveDown, Play, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface HeroSlide {
  id: string;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  cta: string;
  ctaSecondary?: string;
  href: string;
  hrefSecondary?: string;
  badge?: string;
  stat?: string;
  statLabel?: string;
  image: string;
  accentColor?: string;
  order: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/hero");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSlides(data.data);
      } else {
        setSlides([]);
      }
    } catch {
      toast.error("Erreur lors du chargement des slides");
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Slide désactivée" : "Slide activée");
        fetchSlides();
      }
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce slide ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/hero?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Slide supprimée");
        fetchSlides();
      }
    } catch {
      toast.error("Échec de la suppression");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    await reorderSlides(newSlides);
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    await reorderSlides(newSlides);
  };

  const reorderSlides = async (newSlides: HeroSlide[]) => {
    try {
      const res = await fetch("/api/admin/cms/hero/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newSlides.map((s, i) => ({ id: s.id, order: i })) }),
      });
      if (res.ok) {
        setSlides(newSlides);
        toast.success("Ordre mis à jour");
      }
    } catch {
      toast.error("Erreur lors du réordonnancement");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.title || !editingSlide?.image) {
      toast.error("Le titre et l'image sont requis");
      return;
    }

    try {
      const method = editingSlide.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/hero", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });

      if (res.ok) {
        toast.success(editingSlide.id ? "Slide mise à jour" : "Slide créée");
        setIsModalOpen(false);
        setEditingSlide(null);
        fetchSlides();
      }
    } catch {
      toast.error("Erreur d'enregistrement");
    }
  };

  const filteredSlides = slides.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    (s.subtitle && s.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const currentPreview = filteredSlides[previewIndex] || filteredSlides[0];

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion des Slides Hero</h1>
            <p className="text-xs text-muted-foreground">Carrousel principal de la homepage avec animations.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingSlide({ active: true, cta: "Explorer la boutique", href: "/products", accentColor: "#0F766E" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter un Slide
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un slide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 h-10 w-full"
          />
        </div>
        <button onClick={fetchSlides} className="btn-ghost p-2.5 rounded-xl border border-border">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Section */}
      {currentPreview && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Aperçu du Carrousel</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))} className="btn-ghost p-2 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground">{previewIndex + 1} / {filteredSlides.length}</span>
              <button onClick={() => setPreviewIndex(Math.min(filteredSlides.length - 1, previewIndex + 1))} className="btn-ghost p-2 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="btn-ghost p-2 rounded-lg border border-border">
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative min-h-[400px] bg-gradient-to-br from-slate-900 to-slate-800">
            <Image src={currentPreview.image} alt={currentPreview.title} fill className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/50" />
            <div className="relative z-10 p-8 max-w-2xl">
              {currentPreview.badge && (
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold-300 mb-4">
                  {currentPreview.badge}
                </span>
              )}
              <h2 className="font-display text-4xl font-light text-white leading-tight mb-2">
                {currentPreview.title}
                {currentPreview.titleAccent && (
                  <span className="block" style={{ background: `linear-gradient(135deg, #D4AF37 0%, #f0d060 50%, #D4AF37 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {currentPreview.titleAccent}
                  </span>
                )}
              </h2>
              {currentPreview.subtitle && <p className="text-white/70 mb-6">{currentPreview.subtitle}</p>}
              <div className="flex gap-3">
                <Link href={currentPreview.href} className="btn btn-primary">
                  {currentPreview.cta}
                </Link>
                {currentPreview.ctaSecondary && (
                  <Link href={currentPreview.hrefSecondary || "#"} className="btn btn-outline border-white/20 text-white hover:bg-white/10">
                    {currentPreview.ctaSecondary}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chargement des slides...</div>
        ) : filteredSlides.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucun slide trouvé.</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSlides.map((slide, index) => (
              <div key={slide.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="btn-ghost p-1 rounded hover:bg-muted disabled:opacity-30">
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === filteredSlides.length - 1} className="btn-ghost p-1 rounded hover:bg-muted disabled:opacity-30">
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-surface flex-shrink-0 border">
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                        #{slide.order + 1}
                      </span>
                      <h3 className="text-sm font-bold text-foreground truncate">{slide.title}</h3>
                    </div>
                    {slide.subtitle && <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>}
                    <p className="text-[11px] text-muted-foreground mt-0.5">Lien: {slide.href}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(slide.id, slide.active)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      slide.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {slide.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {slide.active ? "Actif" : "Masqué"}
                  </button>

                  <button
                    onClick={() => { setEditingSlide(slide); setIsModalOpen(true); }}
                    className="btn-ghost p-2 rounded-xl hover:bg-muted"
                  >
                    <Edit2 className="w-4 h-4 text-brand-700" />
                  </button>

                  <button onClick={() => handleDelete(slide.id)} className="btn-ghost p-2 rounded-xl hover:bg-destructive/10">
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
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-2xl shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground">
              {editingSlide?.id ? "Modifier le Slide" : "Ajouter un Slide"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Eyebrow (Badge)</label>
                  <input
                    type="text"
                    value={editingSlide?.eyebrow || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, eyebrow: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingSlide?.badge || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={editingSlide?.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Titre accent (en or)</label>
                <input
                  type="text"
                  value={editingSlide?.titleAccent || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, titleAccent: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Sous-titre / Description</label>
                <textarea
                  value={editingSlide?.subtitle || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="input w-full"
                  rows={2}
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">URL de l'Image</label>
                <input
                  type="text"
                  value={editingSlide?.image || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                  className="input w-full"
                  placeholder="/images/... ou URL web"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Lien principal</label>
                  <input
                    type="text"
                    value={editingSlide?.href || "/products"}
                    onChange={(e) => setEditingSlide({ ...editingSlide, href: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Texte CTA principal</label>
                  <input
                    type="text"
                    value={editingSlide?.cta || "Explorer la boutique"}
                    onChange={(e) => setEditingSlide({ ...editingSlide, cta: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Lien secondaire</label>
                  <input
                    type="text"
                    value={editingSlide?.hrefSecondary || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, hrefSecondary: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Texte CTA secondaire</label>
                  <input
                    type="text"
                    value={editingSlide?.ctaSecondary || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaSecondary: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Stat (ex: 2.4M+)</label>
                  <input
                    type="text"
                    value={editingSlide?.stat || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, stat: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Label du stat</label>
                  <input
                    type="text"
                    value={editingSlide?.statLabel || ""}
                    onChange={(e) => setEditingSlide({ ...editingSlide, statLabel: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Couleur d'accent</label>
                <input
                  type="color"
                  value={editingSlide?.accentColor || "#0F766E"}
                  onChange={(e) => setEditingSlide({ ...editingSlide, accentColor: e.target.value })}
                  className="input w-full h-10"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={editingSlide?.active ?? true}
                  onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="active-check" className="font-bold text-foreground">Slide active et visible sur le site</label>
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
