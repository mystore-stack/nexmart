"use client";

import { useState } from "react";
import { FileText, Save } from "lucide-react";
import toast from "react-hot-toast";

const SECTIONS = [
  { id: "hero", label: "Bannière accueil", value: "Marketplace premium du Maroc" },
  { id: "promo", label: "Bandeau promo", value: "Livraison gratuite dès 500 MAD" },
  { id: "footer", label: "Texte footer", value: "NexMart — Votre marketplace de confiance." },
];

export default function AdminCmsPage() {
  const [sections, setSections] = useState(SECTIONS);

  const save = () => {
    toast.success("Contenu enregistré (aperçu local — branchez une table CMS pour la persistance)");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" /> CMS
        </h1>
        <p className="text-sm text-muted-foreground">Blocs de contenu éditoriaux (aperçu)</p>
      </div>
      {sections.map((s, i) => (
        <div key={s.id} className="p-4 border border-border rounded-xl bg-card space-y-2">
          <label className="text-sm font-medium">{s.label}</label>
          <textarea
            className="input w-full min-h-[80px]"
            value={s.value}
            onChange={(e) => {
              const next = [...sections];
              next[i] = { ...s, value: e.target.value };
              setSections(next);
            }}
          />
        </div>
      ))}
      <button type="button" onClick={save} className="btn-primary inline-flex items-center gap-2">
        <Save className="w-4 h-4" /> Enregistrer
      </button>
    </div>
  );
}
