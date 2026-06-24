"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, Eye, EyeOff, Bell, Clock } from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { DragDropList } from "@/components/admin/cms/shared/DragDropList";
import { StatusBadge } from "@/components/admin/cms/shared/StatusBadge";
import { MetricCard } from "@/components/admin/cms/shared/MetricCard";

interface Announcement {
  id: string;
  text: string;
  icon?: string | null;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  displayOrder: number;
  status?: string;
  ctaText?: string | null;
  ctaLink?: string | null;
  stickyMode?: boolean;
  countdownEnd?: string | null;
  impressions?: number;
  clicks?: number;
  startDate?: string | null;
  endDate?: string | null;
}

const emptyForm = {
  text: "",
  icon: "🔥",
  backgroundColor: "#0f766e",
  textColor: "#ffffff",
  isActive: true,
  displayOrder: 0,
  ctaText: "",
  ctaLink: "",
  stickyMode: true,
};

export function AnnouncementManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    const res = await fetch("/api/admin/announcement-bar");
    const data = await res.json();
    if (data.success) setItems(data.announcements ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const totalImpressions = items.reduce((s, i) => s + (i.impressions ?? 0), 0);
  const totalClicks = items.reduce((s, i) => s + (i.clicks ?? 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  const handleSave = async () => {
    if (!form.text.trim()) return toast.error("Text is required");
    setSaving(true);
    const url = editId ? `/api/admin/announcement-bar/${editId}` : "/api/admin/announcement-bar";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      toast.success(editId ? "Updated" : "Created");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchItems();
    } else toast.error(data.error ?? "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/admin/announcement-bar/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Deleted");
      fetchItems();
    }
  };

  const startEdit = (item: Announcement) => {
    setEditId(item.id);
    setForm({
      text: item.text,
      icon: item.icon ?? "",
      backgroundColor: item.backgroundColor,
      textColor: item.textColor,
      isActive: item.isActive,
      displayOrder: item.displayOrder,
      ctaText: item.ctaText ?? "",
      ctaLink: item.ctaLink ?? "",
      stickyMode: item.stickyMode ?? true,
    });
    setShowForm(true);
  };

  return (
    <CmsShell
      title="Announcement Bar"
      description="Multiple bars, scheduling, CTA buttons, countdown timers, and performance analytics."
      actions={
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Impressions" value={totalImpressions.toLocaleString()} icon={Eye} />
        <MetricCard title="Clicks" value={totalClicks.toLocaleString()} icon={Bell} />
        <MetricCard title="CTR" value={`${ctr}%`} icon={Clock} />
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold">{editId ? "Edit" : "New"} Announcement</h3>
          <textarea
            className="input w-full min-h-[60px]"
            placeholder="Announcement text..."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="CTA text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
            <input className="input" placeholder="CTA link" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
            <input className="input" type="color" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} />
            <input className="input" type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.stickyMode} onChange={(e) => setForm({ ...form, stickyMode: e.target.checked })} />
            Sticky mode
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Live preview */}
      {form.text && showForm && (
        <div
          className="mb-6 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
          style={{ backgroundColor: form.backgroundColor, color: form.textColor }}
        >
          {form.icon && <span>{form.icon}</span>}
          <span>{form.text}</span>
          {form.ctaText && (
            <span className="ml-2 underline underline-offset-2">{form.ctaText}</span>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No announcements yet.</p>
      ) : (
        <DragDropList
          items={items}
          onReorder={setItems}
          renderItem={(item) => (
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <p className="truncate font-medium">{item.text}</p>
                  {item.status && <StatusBadge status={item.status} />}
                  {!item.isActive && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(item.impressions ?? 0).toLocaleString()} impressions · {(item.clicks ?? 0)} clicks
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => startEdit(item)} className="rounded p-1.5 hover:bg-muted"><Edit className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleDelete(item.id)} className="rounded p-1.5 text-red-500 hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        />
      )}
    </CmsShell>
  );
}
