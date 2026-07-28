"use client";
// src/app/admin/ads/[id]/edit/page.tsx
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Loader2, DollarSign, Calendar, Target } from "lucide-react";
import toast from "react-hot-toast";

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    productId: "",
    budget: "",
    bidAmount: "",
    startsAt: "",
    endsAt: "",
    status: "DRAFT",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/ads").then((r) => r.json()),
      fetch(`/api/admin/ads/${adId}`).then((r) => r.json())
    ]).then(([adsRes, adRes]) => {
      if (adsRes.success && adsRes.data) {
        // Extract unique products from ads
        const uniqueProducts = new Map();
        adsRes.data.forEach((ad: any) => {
          if (ad.productId && !uniqueProducts.has(ad.productId)) {
            uniqueProducts.set(ad.productId, {
              id: ad.productId,
              name: ad.title,
              imageUrl: ad.imageUrl,
            });
          }
        });
        setProducts(Array.from(uniqueProducts.values()));
      }
      
      if (adRes.success && adRes.data) {
        const ad = adRes.data;
        setForm({
          name: ad.name || "",
          productId: ad.productId || "",
          budget: ad.budget?.toString() || "",
          bidAmount: ad.bidAmount?.toString() || "",
          startsAt: ad.startsAt ? new Date(ad.startsAt).toISOString().split('T')[0] : "",
          endsAt: ad.endsAt ? new Date(ad.endsAt).toISOString().split('T')[0] : "",
          status: ad.status?.toUpperCase() || "DRAFT",
        });
      } else {
        toast.error("Failed to load ad");
        router.push("/admin/ads");
      }
    }).catch((err) => {
      console.error("Error loading ad:", err);
      toast.error("Failed to load ad");
      router.push("/admin/ads");
    }).finally(() => {
      setLoading(false);
    });
  }, [adId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.productId || !form.budget || !form.startsAt) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          productId: form.productId,
          budget: parseFloat(form.budget),
          bidAmount: form.bidAmount ? parseFloat(form.bidAmount) : undefined,
          startsAt: form.startsAt,
          endsAt: form.endsAt || undefined,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Ad updated!");
        router.push("/admin/ads");
      } else {
        toast.error(data.error || "Failed to update ad");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Edit Advertisement</h1>
          <p className="text-muted-foreground text-sm">Update ad details and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-muted-foreground" />
            Basic Information
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ad Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Summer Sale Banner"
              className="input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Product *</label>
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="input"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="ENDED">Ended</option>
            </select>
          </div>
        </section>

        {/* Budget & Bidding */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            Budget & Bidding
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Budget *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  placeholder="1000.00"
                  min="0"
                  step="0.01"
                  className="input pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bid Amount (optional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={form.bidAmount}
                  onChange={(e) => setForm((f) => ({ ...f, bidAmount: e.target.value }))}
                  placeholder="0.50"
                  min="0"
                  step="0.01"
                  className="input pl-8"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Schedule
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">End Date (optional)</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => router.back()} className="btn-outline py-3 px-6">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary py-3 px-8 flex-1 sm:flex-none justify-center">
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
