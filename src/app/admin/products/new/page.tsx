"use client";
// src/app/admin/products/new/page.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, ArrowLeft, Plus, Trash2, Image as ImageIcon,
  Package, Tag, DollarSign, Hash, Layers, Eye, EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

interface Variant { name: string; value: string; label: string; price: string; stock: string; sku: string; }

const emptyVariant: Variant = { name: "Size", value: "", label: "", price: "", stock: "0", sku: "" };

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", description: "", categoryId: "",
    price: "", comparePrice: "", cost: "",
    sku: "", stock: "0", lowStockAt: "5",
    weight: "", published: false, featured: false,
    images: [""], tags: "",
  });
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (d.data) setCategories(d.data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.sku || !form.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const description = (form.description || "").trim();
    const images = form.images.map((u) => u.trim()).filter(Boolean);

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (images.length < 1) {
      toast.error("Please add at least 1 valid image URL");
      return;
    }

    setSaving(true);
    try {
      // Nettoyage + validation client pour éviter NaN / valeurs vides côté API
      const description = (form.description || "").trim();
      const images = form.images.map((u) => u.trim()).filter(Boolean);
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body = {
        name: form.name.trim(),
        description,
        categoryId: form.categoryId,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        sku: form.sku.trim(),
        stock: Number.isFinite(Number(form.stock)) ? parseInt(form.stock) : 0,
        lowStockAt: Number.isFinite(Number(form.lowStockAt)) ? parseInt(form.lowStockAt) : 5,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        published: form.published,
        featured: form.featured,
        images,
        tags,
        variants: variants
          .filter((v) => v.value.trim() && v.label.trim())
          .map((v) => ({
            name: v.name,
            value: v.value.trim(),
            label: v.label.trim(),
            price: v.price ? parseFloat(v.price) : undefined,
            stock: Number.isFinite(Number(v.stock)) ? parseInt(v.stock) : 0,
            sku: v.sku?.trim() || undefined,
          })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Product created!");
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Failed to create product");
      }
    } finally {
      setSaving(false);
    }
  };

  const updateImage = (idx: number, val: string) => {
    setForm((f) => {
      const imgs = [...f.images];
      imgs[idx] = val;
      return { ...f, images: imgs };
    });
  };

  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ""] }));
  const removeImage = (idx: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addVariant = () => setVariants((v) => [...v, { ...emptyVariant }]);
  const removeVariant = (idx: number) => setVariants((v) => v.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: keyof Variant, val: string) => {
    setVariants((v) => v.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">New Product</h1>
          <p className="text-muted-foreground text-sm">Fill in the details to create a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            Basic Information
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              className="input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detailed product description..."
              rows={4}
              className="input resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="electronics, wireless, sony (comma-separated)"
              className="input"
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            Pricing & Inventory
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Compare Price</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cost</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input pl-8"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-muted-foreground" />
                SKU *
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="PROD-001"
                className="input font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                min="0"
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Low Stock Alert</label>
              <input
                type="number"
                value={form.lowStockAt}
                onChange={(e) => setForm((f) => ({ ...f, lowStockAt: e.target.value }))}
                min="0"
                className="input"
              />
            </div>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <label className="text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              placeholder="0.0"
              min="0"
              step="0.01"
              className="input"
            />
          </div>
        </section>

        {/* Images */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            Product Images
          </h2>

          <div className="space-y-3">
            {form.images.map((img, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="flex-1 relative">
                  {img && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder={`Image URL ${idx + 1}${idx === 0 ? " (main)" : ""}`}
                    className={`input ${img ? "pl-12" : ""}`}
                  />
                </div>
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(idx)} className="btn-ghost p-2.5 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {form.images.length < 8 && (
            <button type="button" onClick={addImage} className="btn-outline py-2 px-4 text-sm">
              <Plus className="w-4 h-4" />
              Add Image URL
            </button>
          )}
        </section>

        {/* Variants */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-muted-foreground" />
              Variants <span className="text-muted-foreground font-normal text-sm">(optional)</span>
            </h2>
            <button type="button" onClick={addVariant} className="btn-outline py-2 px-4 text-sm">
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 rounded-xl border border-border bg-muted/30">
                  <select
                    value={v.name}
                    onChange={(e) => updateVariant(idx, "name", e.target.value)}
                    className="input py-2 text-sm"
                  >
                    <option value="Size">Size</option>
                    <option value="Color">Color</option>
                    <option value="Material">Material</option>
                    <option value="Style">Style</option>
                  </select>
                  <input
                    type="text"
                    value={v.value}
                    onChange={(e) => updateVariant(idx, "value", e.target.value)}
                    placeholder={v.name === "Color" ? "#FF0000" : "XL"}
                    className="input py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => updateVariant(idx, "label", e.target.value)}
                    placeholder={v.name === "Color" ? "Red" : "Extra Large"}
                    className="input py-2 text-sm"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariant(idx, "price", e.target.value)}
                      placeholder="Price"
                      className="input py-2 text-sm pl-7"
                      min="0"
                    />
                  </div>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                    placeholder="Stock"
                    className="input py-2 text-sm"
                    min="0"
                  />
                  <button type="button" onClick={() => removeVariant(idx)} className="btn-ghost p-2 text-muted-foreground hover:text-red-500 justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Visibility */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold">Visibility & Status</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-border hover:border-foreground/30 transition-all flex-1">
              <div
                onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.published ? "bg-green-500" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? "translate-x-5" : ""}`} />
              </div>
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-muted-foreground">Visible in the store</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-border hover:border-foreground/30 transition-all flex-1">
              <div
                onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.featured ? "bg-brand-500" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : ""}`} />
              </div>
              <div>
                <p className="font-medium text-sm">Featured</p>
                <p className="text-xs text-muted-foreground">Shown in homepage highlights</p>
              </div>
            </label>
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
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Create Product
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
