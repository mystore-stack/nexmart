"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  Layers,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

interface RevisionItem {
  id: string;
  action: string;
  createdAt: string;
  description: string;
  sectionCount: number;
  author: string;
  version?: string | null;
}

interface RevisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export function RevisionsModal({ isOpen, onClose, onRestored }: RevisionsModalProps) {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [snapshotting, setSnapshotting] = useState(false);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms/mobile-app/revisions");
      const json = await res.json();
      if (res.ok && json.success) {
        setRevisions(json.data || []);
      }
    } catch {
      toast.error("Erreur de chargement des versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRevisions();
    }
  }, [isOpen]);

  const handleRestore = async (rev: RevisionItem) => {
    if (
      !confirm(
        `Restaurer la configuration du ${new Date(rev.createdAt).toLocaleString("fr-MA")} ?\n\nCette action remplacera toutes les sections actuelles par celles de cette sauvegarde.`
      )
    ) {
      return;
    }

    try {
      setRestoringId(rev.id);
      const res = await fetch("/api/admin/cms/mobile-app/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", revisionId: rev.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de restauration");
      }
      toast.success("Version restaurée avec succès");
      onRestored();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la restauration");
    } finally {
      setRestoringId(null);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setSnapshotting(true);
      const res = await fetch("/api/admin/cms/mobile-app/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "snapshot",
          description: `Sauvegarde manuelle (${new Date().toLocaleTimeString("fr-MA")})`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de création du snapshot");
      }
      toast.success("Sauvegarde instantanée enregistrée");
      fetchRevisions();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSnapshotting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Historique des Révisions & Rollback
              </h3>
              <p className="text-xs text-slate-500">
                Consultez les sauvegardes et restaurez instantanément une version antérieure
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-white">
          <div className="text-xs text-slate-600 font-semibold">
            {revisions.length} version{revisions.length > 1 ? "s" : ""} disponible{revisions.length > 1 ? "s" : ""}
          </div>
          <button
            type="button"
            onClick={handleCreateSnapshot}
            disabled={snapshotting}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900 transition-all"
          >
            {snapshotting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            Créer un point de restauration
          </button>
        </div>

        {/* List of Revisions */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-3">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-700" />
            </div>
          ) : revisions.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <History className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aucune révision enregistrée</p>
              <p className="text-xs text-slate-500 mt-1">
                Les révisions sont automatiquement créées lors de chaque publication en direct.
              </p>
            </div>
          ) : (
            revisions.map((rev) => {
              const isPublish = rev.action === "MOBILE_CMS_PUBLISH";
              const isRestore = rev.action === "MOBILE_CMS_RESTORE";
              const isRestoring = restoringId === rev.id;

              return (
                <div
                  key={rev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isPublish
                            ? "bg-emerald-100 text-emerald-800"
                            : isRestore
                            ? "bg-amber-100 text-amber-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {isPublish ? "Publication en direct" : isRestore ? "Restauration" : "Instantané"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(rev.createdAt).toLocaleString("fr-MA")}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">{rev.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {rev.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {rev.sectionCount} sections
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestore(rev)}
                      disabled={isRestoring}
                      className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-purple-600 hover:bg-purple-50 hover:text-purple-900 transition-all disabled:opacity-50"
                    >
                      {isRestoring ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      Restaurer cette version
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
