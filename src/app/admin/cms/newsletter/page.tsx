"use client";
// src/app/admin/cms/newsletter/page.tsx — Newsletter Configuration Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Mail } from "lucide-react";
import toast from "react-hot-toast";

interface NewsletterConfig {
  id?: string;
  eyebrow: string;
  title: string;
  highlightTitle?: string;
  description: string;
  placeholder: string;
  buttonText: string;
  active: boolean;
}

export default function AdminNewsletterPage() {
  const [config, setConfig] = useState<NewsletterConfig>({
    eyebrow: "Newsletter exclusive",
    title: "Les meilleures offres,",
    highlightTitle: "avant tout le monde.",
    description: "Offres personnalisées, alertes de prix, tendances et promotions exclusives de NexMart Maroc.",
    placeholder: "Votre adresse email",
    buttonText: "S'abonner",
    active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cms/newsletter")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConfig(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/cms/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        toast.success("Paramètres Newsletter mis à jour avec succès !");
      }
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/cms" className="btn-ghost p-2 rounded-xl border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-violet-600" /> Configuration de la Newsletter
          </h1>
          <p className="text-xs text-muted-foreground">Textes, bannières et accroches de la newsletter footer.</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Chargement...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Badge d'accroche (Eyebrow)</label>
              <input
                type="text"
                value={config.eyebrow}
                onChange={(e) => setConfig({ ...config, eyebrow: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Titre principal</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Texte en surbrillance dorée</label>
              <input
                type="text"
                value={config.highlightTitle || ""}
                onChange={(e) => setConfig({ ...config, highlightTitle: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Description / Paragraphe</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Placeholder du champ Email</label>
                <input
                  type="text"
                  value={config.placeholder}
                  onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Texte du Bouton</label>
                <input
                  type="text"
                  value={config.buttonText}
                  onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button type="submit" className="btn-primary px-6 py-2.5 font-bold text-xs inline-flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Sauvegarder les modifications
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
