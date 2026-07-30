"use client";
// src/app/admin/cms/promotions/page.tsx — Promotional Cards Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Search, Trash2, Edit2, Eye, EyeOff, Save, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface PromoCard {
  id: string;
  cardKey: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  ctaText: string;
  badgeText?: string;
  active: boolean;
}

export default function AdminPromotionsPage() {
  const [cards, setCards] = useState<PromoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Partial<PromoCard> | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/promotions");
      const data = await res.json();
      if (data.success && data.data) {
        setCards(data.data);
      }
    } catch {
      toast.error("Erreur lors du chargement des cartes promo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Carte masquée" : "Carte activée");
        fetchCards();
      }
    } catch {
      toast.error("Mise à jour échouée");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard?.cardKey || !editingCard?.title || !editingCard?.image) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      const method = editingCard.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/promotions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCard),
      });

      if (res.ok) {
        toast.success("Carte promotionnelle enregistrée");
        setIsModalOpen(false);
        setEditingCard(null);
        fetchCards();
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
              <Sparkles className="w-6 h-6 text-purple-600" /> Gestion des 4 Cartes Promotionnelles
            </h1>
            <p className="text-xs text-muted-foreground">Flash Sale, Mystery Boxes, Buy More Save More, Build Your Bundle.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCard({ cardKey: "CUSTOM_CARD", active: true, ctaText: "Découvrir", link: "/deals" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter / Configurer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : cards.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-sm text-muted-foreground">Aucune carte personnalisée enregistrée.</div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="p-5 rounded-3xl border border-border bg-card flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                    Key: {card.cardKey}
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-1">{card.title}</h3>
                  {card.subtitle && <p className="text-xs text-muted-foreground leading-relaxed">{card.subtitle}</p>}
                </div>

                <div className="relative h-16 w-20 rounded-xl overflow-hidden bg-surface border flex-shrink-0">
                  <Image src={card.image} alt={card.title} fill className="object-cover" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <button
                  onClick={() => handleToggleActive(card.id, card.active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    card.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {card.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {card.active ? "Actif sur Homepage" : "Masqué"}
                </button>

                <button onClick={() => { setEditingCard(card); setIsModalOpen(true); }} className="btn-outline px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1">
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
            <h2 className="text-lg font-bold text-foreground">Éditer la Carte Promotionnelle</h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Clé Identifiante (Key)</label>
                <input
                  type="text"
                  value={editingCard?.cardKey || ""}
                  onChange={(e) => setEditingCard({ ...editingCard, cardKey: e.target.value })}
                  className="input w-full"
                  placeholder="FLASH_SALE, MYSTERY_BOX..."
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Titre principal</label>
                <input
                  type="text"
                  value={editingCard?.title || ""}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Sous-titre / Description</label>
                <input
                  type="text"
                  value={editingCard?.subtitle || ""}
                  onChange={(e) => setEditingCard({ ...editingCard, subtitle: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingCard?.image || ""}
                  onChange={(e) => setEditingCard({ ...editingCard, image: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Lien Destination</label>
                  <input
                    type="text"
                    value={editingCard?.link || "/deals"}
                    onChange={(e) => setEditingCard({ ...editingCard, link: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Texte Bouton CTA</label>
                  <input
                    type="text"
                    value={editingCard?.ctaText || "Voir les offres"}
                    onChange={(e) => setEditingCard({ ...editingCard, ctaText: e.target.value })}
                    className="input w-full"
                  />
                </div>
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
