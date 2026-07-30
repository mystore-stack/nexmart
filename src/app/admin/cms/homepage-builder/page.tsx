"use client";
// src/app/admin/cms/homepage-builder/page.tsx — Homepage Builder Hub
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LayoutTemplate,
  Plus,
  Save,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";

interface HomepageSection {
  id: string;
  sectionKey: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

const TEMPLATE_SECTIONS = [
  { sectionKey: "hero", title: "Hero", description: "Bannière principale et CTA" },
  { sectionKey: "categories", title: "Catégories", description: "Ordre, visibilité et images des catégories homepage" },
  { sectionKey: "promotionalCards", title: "Cartes Promo", description: "Bannières promotionnelles et collections spéciales" },
  { sectionKey: "flashDeals", title: "Ventes Flash", description: "Articles en promotion avec compte à rebours" },
  { sectionKey: "flashSale", title: "Flash Sale", description: "Offres flash dans la section vente du jour" },
  { sectionKey: "serviceBanners", title: "Bannières Service", description: "Livraison express et paiement à la livraison" },
  { sectionKey: "showcaseGrid", title: "Showcase Grid", description: "Meilleures ventes, nouveautés, mystery boxes" },
  { sectionKey: "bundleBuilder", title: "Bundle Builder", description: "Création de packs et réductions packagées" },
  { sectionKey: "brandCarousel", title: "Marques Partenaires", description: "Carousel des partenaires et marques premium" },
  { sectionKey: "featuredProducts", title: "Produits en Vedette", description: "Sélection premium de produits mis en avant" },
  { sectionKey: "promoBanner", title: "Promo Banner", description: "Bannière marketing secondaire" },
  { sectionKey: "trendingProducts", title: "Tendances", description: "Produits populaires et tendances du moment" },
  { sectionKey: "recentlyViewed", title: "Historique de Navigation", description: "Produits récemment consultés" },
  { sectionKey: "whyNexMart", title: "Pourquoi NexMart", description: "Section de confiance et différenciation de marque" },
  { sectionKey: "featuresBar", title: "Barre d'Avantages", description: "Livraison, paiement sécurisé, support client" },
  { sectionKey: "mobileAppBanner", title: "Promotion Mobile", description: "Encourager le téléchargement de l'app mobile" },
  { sectionKey: "newsletter", title: "Newsletter", description: "Inscription à la newsletter premium" },
];

function buildDefaultSections() {
  return TEMPLATE_SECTIONS.map((section, index) => ({
    id: `${section.sectionKey}-${index}`,
    sectionKey: section.sectionKey,
    title: section.title,
    description: section.description,
    order: index + 1,
    active: true,
  }));
}

export default function AdminHomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/homepage-sections");
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("API Response:", JSON.stringify(data, null, 2));
      console.log("data.success:", data.success);
      console.log("data.data:", data.data);
      console.log("Array.isArray(data.data):", Array.isArray(data.data));
      console.log("typeof data.data:", typeof data.data);
      
      if (data.success && Array.isArray(data.data)) {
        const sorted = [...data.data].sort((a: HomepageSection, b: HomepageSection) => a.order - b.order);
        console.log("Setting sections:", sorted);
        setSections(sorted);
      } else {
        console.log("Invalid response, setting empty array");
        console.log("Reason:", !data.success ? "success is false" : "data.data is not an array");
        setSections([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Erreur de chargement");
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleInitializeDefaults = async () => {
    setSaving(true);
    try {
      // Create all default sections regardless of existing ones
      await Promise.all(
        TEMPLATE_SECTIONS.map((template, index) =>
          fetch("/api/admin/cms/homepage-sections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionKey: template.sectionKey,
              title: template.title,
              description: template.description,
              order: index + 1,
              active: true,
            }),
          })
        )
      );
      toast.success("Sections par défaut initialisées");
      fetchSections();
    } catch (error) {
      console.error("Initialization error:", error);
      toast.error("Échec de l'initialisation");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (section: HomepageSection) => {
    // Only allow toggling if section has a real UUID from database
    if (!section.id || !section.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      toast.error("Section must be saved first");
      return;
    }
    
    try {
      const res = await fetch("/api/admin/cms/homepage-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: section.id, active: !section.active }),
      });
      if (res.ok) {
        toast.success(section.active ? "Section masquée" : "Section activée");
        fetchSections();
      }
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const handleSaveOrder = async () => {
    if (!sections.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/homepage-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: sections.map(({ id, order }) => ({ id, order })) }),
      });
      if (res.ok) {
        toast.success("Ordre sauvegardé");
      } else {
        toast.error("Impossible de sauvegarder l'ordre");
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
      fetchSections();
    }
  };

  const handleEdit = (section: HomepageSection) => {
    // Only allow editing if section has a real UUID from database
    if (!section.id || !section.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      toast.error("Section must be saved first");
      return;
    }
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSaveSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSection) return;

    if (!editingSection.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    try {
      const res = await fetch("/api/admin/cms/homepage-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSection),
      });
      if (res.ok) {
        toast.success("Section mise à jour");
        setIsModalOpen(false);
        setEditingSection(null);
        fetchSections();
      } else {
        toast.error("Échec de la mise à jour");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  const currentSections = sections;

  console.log("Rendering with sections:", sections.length);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Shuffle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <LayoutTemplate className="w-8 h-8 text-cyan-700" /> Homepage Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Organisez l’ordre et l’activation des sections de la page d’accueil.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleInitializeDefaults}
            disabled={saving}
            className="btn-outline inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Réinitialiser les sections
          </button>
          <button
            onClick={handleSaveOrder}
            disabled={saving || loading}
            className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
          >
            <Save className="w-4 h-4" /> Sauvegarder l’ordre
          </button>
          <Link href="/admin/cms" className="btn-ghost inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl border border-border">
            <ArrowLeft className="w-4 h-4" /> Retour au CMS
          </Link>
          <Link href="/" target="_blank" className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl">
            <Eye className="w-4 h-4" /> Aperçu de la Homepage
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Editeur de flux</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Réordonnez et masquez les sections</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {currentSections.length} sections
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : (
              <div className="space-y-3">
                {currentSections.map((section, index) => (
                  <div key={section.sectionKey} className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                          Section {index + 1}
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                          <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-600">
                            {section.sectionKey}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="btn-ghost inline-flex items-center gap-2"
                        >
                          <ChevronUp className="w-4 h-4" /> Haut
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === currentSections.length - 1}
                          className="btn-ghost inline-flex items-center gap-2"
                        >
                          <ChevronDown className="w-4 h-4" /> Bas
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(section)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                            section.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {section.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {section.active ? "Activé" : "Masqué"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(section)}
                          className="btn-ghost inline-flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Conseil</p>
            <h3 className="mt-3 text-lg font-bold text-foreground">Comment l’utiliser</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Les sections sont automatiquement initialisées avec la structure de la homepage.</li>
              <li>2. Déplacez les lignes vers le haut/bas pour ajuster l’ordre.</li>
              <li>3. Sauvegardez l’ordre pour le rendre actif en frontend.</li>
              <li>4. Masquez les sections non désirées pour les retirer sans supprimer le contenu.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Liens rapides</p>
            <div className="mt-3 space-y-3 text-sm">
              {TEMPLATE_SECTIONS.slice(0, 5).map((item) => (
                <Link key={item.sectionKey} href={`/admin/cms/${item.sectionKey === "promotionalCards" ? "promotions" : item.sectionKey}`} className="block rounded-2xl border border-border px-4 py-3 hover:border-cyan-200 hover:bg-slate-50">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {isModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Modifier la section</h2>
                <p className="text-sm text-muted-foreground">Ajustez le titre, la description ou l’état actif.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900">Fermer</button>
            </div>

            <form className="space-y-4" onSubmit={handleSaveSection}>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Titre</label>
                <input
                  className="input w-full"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  className="input h-24 w-full resize-none"
                  value={editingSection.description || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={editingSection.active}
                    onChange={(e) => setEditingSection({ ...editingSection, active: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-cyan-600"
                  />
                  Activer la section
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline px-4 py-2">
                  Annuler
                </button>
                <button type="submit" className="btn-primary inline-flex items-center gap-2 px-4 py-2">
                  <Save className="w-4 h-4" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

