"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, Trash2, Search, Grid3x3, List, Copy, Check } from "lucide-react";
import { CmsShell } from "@/components/admin/cms/shell/CmsShell";
import { MetricCard } from "@/components/admin/cms/shared/MetricCard";

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  webpUrl?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  category?: string | null;
  tags: string[];
  usageCount?: number;
  createdAt: string;
}

const CATEGORIES = ["hero", "product", "brand", "testimonial", "other"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryEnterprise() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/media?${params}`);
    const data = await res.json();
    if (data.success) setMedia(data.media ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, [category, search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category || "other");
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.success) { toast.success("Uploaded"); fetchMedia(); }
    else toast.error(data.error ?? "Upload failed");
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} files?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/admin/media/${id}`, { method: "DELETE" })));
    toast.success("Deleted");
    setSelected(new Set());
    fetchMedia();
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalSize = media.reduce((s, m) => s + m.size, 0);

  return (
    <CmsShell
      title="Media Library"
      description="Shopify-level media manager with grid/list views, bulk actions, and usage tracking."
      actions={
        <label className="btn-primary inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total Assets" value={media.length} />
        <MetricCard title="Storage Used" value={formatSize(totalSize)} />
        <MetricCard title="Selected" value={selected.size} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="input w-full pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex rounded-lg border border-border p-1">
          <button type="button" onClick={() => setView("grid")} className={`rounded p-1.5 ${view === "grid" ? "bg-primary text-primary-foreground" : ""}`}><Grid3x3 className="h-4 w-4" /></button>
          <button type="button" onClick={() => setView("list")} className={`rounded p-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : ""}`}><List className="h-4 w-4" /></button>
        </div>
        {selected.size > 0 && (
          <button type="button" onClick={handleBulkDelete} className="btn-secondary inline-flex items-center gap-1 px-3 py-2 text-sm text-red-500">
            <Trash2 className="h-4 w-4" /> Delete ({selected.size})
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No media files. Upload your first asset.
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item) => (
            <div key={item.id} className={`group relative overflow-hidden rounded-xl border bg-card ${selected.has(item.id) ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
              <input
                type="checkbox"
                className="absolute left-2 top-2 z-10"
                checked={selected.has(item.id)}
                onChange={(e) => {
                  const next = new Set(selected);
                  e.target.checked ? next.add(item.id) : next.delete(item.id);
                  setSelected(next);
                }}
              />
              <div className="relative aspect-square bg-muted">
                {item.mimeType.startsWith("image/") ? (
                  <Image src={item.url} alt={item.alt ?? item.originalName} fill className="object-cover" sizes="200px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs">{item.mimeType}</div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{item.originalName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}{formatSize(item.size)}
                </p>
                <button type="button" onClick={() => copyUrl(item.url, item.id)} className="mt-1 text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                  {copied === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {media.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <input type="checkbox" checked={selected.has(item.id)} onChange={(e) => {
                const next = new Set(selected);
                e.target.checked ? next.add(item.id) : next.delete(item.id);
                setSelected(next);
              }} />
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                {item.mimeType.startsWith("image/") && <Image src={item.url} alt="" fill className="object-cover" sizes="40px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatSize(item.size)} · {item.category ?? "other"} · Used {item.usageCount ?? 0}×</p>
              </div>
              <button type="button" onClick={() => copyUrl(item.url, item.id)} className="rounded p-1.5 hover:bg-muted">
                {copied === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </CmsShell>
  );
}
