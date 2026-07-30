"use client";
// src/app/admin/cms/why-nexmart/page.tsx — Why NexMart Values Management
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Eye, EyeOff, Save, RefreshCw, MoveUp, MoveDown, Award } from "lucide-react";
import toast from "react-hot-toast";

interface WhyNexMartValue {
  id: string;
  iconName: string;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
  color: string;
  order: number;
  active: boolean;
}

export default function AdminWhyNexMartPage() {
  const [values, setValues] = useState<WhyNexMartValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<Partial<WhyNexMartValue> | null>(null);

  const fetchValues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/why-nexmart");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setValues(data.data);
      } else {
        setValues([]);
      }
    } catch {
      toast.error("Erreur de chargement");
      setValues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/cms/why-nexmart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Valeur masquée" : "Valeur activée");
        fetchValues();
      }
    } catch {
      toast.error("Mise à jour échouée");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette valeur ?")) return;
    try {
      const res = await fetch(`/api/admin/cms/why-nexmart?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Valeur supprimée");
        fetchValues();
      }
    } catch {
      toast.error("Suppression échouée");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newValues = [...values];
    [newValues[index - 1], newValues[index]] = [newValues[index], newValues[index - 1]];
    await reorderValues(newValues);
  };

  const handleMoveDown = async (index: number) => {
    if (index === values.length - 1) return;
    const newValues = [...values];
    [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];
    await reorderValues(newValues);
  };

  const reorderValues = async (newValues: WhyNexMartValue[]) => {
    try {
      const res = await fetch("/api/admin/cms/why-nexmart/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newValues.map((s, i) => ({ id: s.id, order: i })) }),
      });
      if (res.ok) {
        setValues(newValues);
        toast.success("Ordre mis à jour");
      }
    } catch {
      toast.error("Erreur lors du réordonnancement");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValue?.title || !editingValue?.description) {
      toast.error("Le titre et la description sont requis");
      return;
    }

    try {
      const method = editingValue.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/cms/why-nexmart", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingValue),
      });

      if (res.ok) {
        toast.success("Valeur enregistrée");
        setIsModalOpen(false);
        setEditingValue(null);
        fetchValues();
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
              <Award className="w-6 h-6 text-violet-600" /> Gestion des Valeurs NexMart
            </h1>
            <p className="text-xs text-muted-foreground">Points forts et avantages de la plateforme.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingValue({ iconName: "Award", active: true, color: "from-brand-700 to-brand-600" });
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Ajouter une Valeur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : values.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-sm text-muted-foreground">Aucune valeur configurée.</div>
        ) : (
          values.map((value, index) => (
            <div key={value.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="btn-ghost p-1 rounded hover:bg-muted disabled:opacity-30">
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === values.length - 1} className="btn-ghost p-1 rounded hover:bg-muted disabled:opacity-30">
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-200">
                      #{value.order + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{value.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{value.description}</p>
                  {value.stat && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60">
                      <span className="font-display text-lg font-bold gradient-gold">{value.stat}</span>
                      <span className="text-xs text-muted-foreground">{value.statLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <button
                  onClick={() => handleToggleActive(value.id, value.active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    value.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {value.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {value.active ? "Actif" : "Masqué"}
                </button>

                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingValue(value); setIsModalOpen(true); }} className="btn-ghost p-1.5">
                    <Edit2 className="w-4 h-4 text-brand-700" />
                  </button>
                  <button onClick={() => handleDelete(value.id)} className="btn-ghost p-1.5">
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
              {editingValue?.id ? "Modifier la Valeur" : "Ajouter une Valeur"}
            </h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom de l'icône (Lucide)</label>
                <input
                  type="text"
                  value={editingValue?.iconName || "Award"}
                  onChange={(e) => setEditingValue({ ...editingValue, iconName: e.target.value })}
                  className="input w-full"
                  placeholder="Award, Truck, ShieldCheck, Sparkles, Users, Star"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Titre</label>
                <input
                  type="text"
                  value={editingValue?.title || ""}
                  onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  value={editingValue?.description || ""}
                  onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Stat (ex: 500+)</label>
                  <input
                    type="text"
                    value={editingValue?.stat || ""}
                    onChange={(e) => setEditingValue({ ...editingValue, stat: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Label du stat</label>
                  <input
                    type="text"
                    value={editingValue?.statLabel || ""}
                    onChange={(e) => setEditingValue({ ...editingValue, statLabel: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Gradient CSS</label>
                <input
                  type="text"
                  value={editingValue?.color || "from-brand-700 to-brand-600"}
                  onChange={(e) => setEditingValue({ ...editingValue, color: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={editingValue?.active ?? true}
                  onChange={(e) => setEditingValue({ ...editingValue, active: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="active-check" className="font-bold text-foreground">Valeur active</label>
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
