"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { DragDropList } from "@/components/admin/cms/shared/DragDropList";
import { FOOTER_COLUMN_TYPES } from "@/lib/cms/constants";

interface FooterLink { title: string; url: string }
interface FooterColumn { id: string; type: string; title: string; links: FooterLink[]; displayOrder: number }

interface FooterConfig {
  logoUrl?: string;
  description?: string;
  copyrightText?: string;
  columns: FooterColumn[];
  paymentIcons: string[];
  isActive: boolean;
}

export function FooterManager() {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/footer")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.config) {
          setConfig({
            ...d.config,
            columns: d.config.columns?.length ? d.config.columns : FOOTER_COLUMN_TYPES.map((c, i) => ({
              id: c.id,
              type: c.id,
              title: c.label,
              links: [],
              displayOrder: i,
            })),
            paymentIcons: d.config.paymentIcons ?? [],
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    const res = await fetch("/api/admin/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) toast.success("Footer saved");
    else toast.error(data.error ?? "Failed");
  };

  const addLink = (columnId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      columns: config.columns.map((col) =>
        col.id === columnId
          ? { ...col, links: [...col.links, { title: "New Link", url: "/" }] }
          : col
      ),
    });
  };

  if (loading) return <CmsShell title="Footer CMS" description="Loading..."><p className="text-sm text-muted-foreground">Loading...</p></CmsShell>;
  if (!config) return <CmsShell title="Footer CMS" description="No config"><p className="text-sm text-muted-foreground">No footer config found.</p></CmsShell>;

  return (
    <CmsShell
      title="Footer CMS"
      description="Modular columns, social links, payment icons, copyright, and multi-language support."
      actions={
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm">
          <Save className="h-4 w-4" /> Save Footer
        </button>
      }
    >
      <div className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4">
        <input className="input w-full" placeholder="Logo URL" value={config.logoUrl ?? ""} onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })} />
        <textarea className="input w-full min-h-[80px]" placeholder="Description" value={config.description ?? ""} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
        <input className="input w-full" placeholder="Copyright text" value={config.copyrightText ?? ""} onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.columns.map((col) => (
          <div key={col.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <input
                className="font-semibold bg-transparent outline-none"
                value={col.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    columns: config.columns.map((c) => (c.id === col.id ? { ...c, title: e.target.value } : c)),
                  })
                }
              />
              <button type="button" onClick={() => addLink(col.id)} className="rounded p-1 hover:bg-muted">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <DragDropList
              items={col.links.map((l, i) => ({ id: `${col.id}-${i}`, ...l, displayOrder: i }))}
              onReorder={(reordered) =>
                setConfig({
                  ...config,
                  columns: config.columns.map((c) =>
                    c.id === col.id
                      ? { ...c, links: reordered.map(({ title, url }) => ({ title, url })) }
                      : c
                  ),
                })
              }
              renderItem={(link) => (
                <div className="space-y-1 px-3 py-2">
                  <input className="input w-full text-sm" value={link.title} onChange={(e) => {
                    setConfig({
                      ...config,
                      columns: config.columns.map((c) =>
                        c.id === col.id
                          ? { ...c, links: c.links.map((l, i) => i === link.displayOrder ? { ...l, title: e.target.value } : l) }
                          : c
                      ),
                    });
                  }} />
                  <input className="input w-full text-xs" value={link.url} onChange={(e) => {
                    setConfig({
                      ...config,
                      columns: config.columns.map((c) =>
                        c.id === col.id
                          ? { ...c, links: c.links.map((l, i) => i === link.displayOrder ? { ...l, url: e.target.value } : l) }
                          : c
                      ),
                    });
                  }} />
                </div>
              )}
            />
          </div>
        ))}
      </div>
    </CmsShell>
  );
}
