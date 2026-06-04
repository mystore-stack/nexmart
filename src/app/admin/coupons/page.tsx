"use client";
// src/app/admin/coupons/page.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Tag, Trash2, Edit, Check, X, Calendar, Users, TrendingUp } from "lucide-react";
import { formatDate, formatPrice } from "@/utils/format";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit: number;
  endDate?: string;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  value: 10,
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  userLimit: 1,
  endDate: "",
  active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm } as typeof emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => { if (d.data) setCoupons(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error("Coupon code required"); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase(),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        endDate: form.endDate || undefined,
      };

      const url = editId ? `/api/admin/coupons/${editId}` : "/api/admin/coupons";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        if (editId) {
          setCoupons((prev) => prev.map((c) => c.id === editId ? data.data : c));
          toast.success("Coupon updated!");
        } else {
          setCoupons((prev) => [data.data, ...prev]);
          toast.success("Coupon created!");
        }
        setShowForm(false);
        setForm({ ...emptyForm });
        setEditId(null);
      } else {
        toast.error(data.error || "Failed to save coupon");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, active: !c.active } : c));
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    }
  };

  const editCoupon = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      userLimit: coupon.userLimit,
      endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
      active: coupon.active,
    });
    setEditId(coupon.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-1">{coupons.length} coupons</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }} className="btn-primary py-2.5 px-5">
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">{editId ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                  className="input font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="20% off summer collection"
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  className="input"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Value *</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                  min={0}
                  max={form.type === "PERCENTAGE" ? 100 : undefined}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Min Order ($)</label>
                <input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                  placeholder="0"
                  min={0}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Discount ($)</label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                  placeholder="No limit"
                  min={0}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Usage Limit</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  placeholder="Unlimited"
                  min={1}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Per-User Limit</label>
                <input
                  type="number"
                  value={form.userLimit}
                  onChange={(e) => setForm((f) => ({ ...f, userLimit: Number(e.target.value) }))}
                  min={1}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="input"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? "bg-foreground" : "bg-muted-foreground/30"} cursor-pointer`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm font-medium">Active</span>
              </label>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowForm(false)} className="btn-outline py-2.5 px-5 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-5 text-sm">
                  {saving ? "Saving..." : editId ? "Update" : "Create Coupon"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">No coupons yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon, i) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-card border-2 rounded-2xl p-5 relative ${coupon.active ? "border-border" : "border-border/50 opacity-60"}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono font-bold text-lg tracking-wider">{coupon.code}</span>
                  {coupon.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editCoupon(coupon)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Value badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-foreground text-background text-sm font-bold mb-4">
                <Tag className="w-3.5 h-3.5" />
                {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
              </div>

              {/* Meta */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {coupon.minOrder && (
                  <p>Min order: <span className="font-medium text-foreground">{formatPrice(coupon.minOrder)}</span></p>
                )}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Used {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""} times</span>
                </div>
                {coupon.endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Expires {formatDate(coupon.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleActive(coupon)}
                className={`absolute top-4 right-16 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  coupon.active
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                    : "bg-muted text-muted-foreground"
                }`}
                title={coupon.active ? "Active — click to deactivate" : "Inactive — click to activate"}
              >
                {coupon.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
