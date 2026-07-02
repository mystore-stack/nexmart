"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Layers,
  ToggleLeft, ToggleRight, X, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function BuildYourOwnBundlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    heroBannerColor: "#0F766E",
    ctaText: "Build Bundle",
    ctaUrl: "",
    sectionTitle: "",
    sectionDescription: "",
    backgroundColor: "#ffffff",
    minProducts: 2,
    maxProducts: 10,
    baseDiscount: 0,
    status: "DRAFT",
    enabled: true,
    featured: false,
    startDate: "",
    endDate: "",
    displayOrder: 0,
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    categoryIds: [] as string[],
    discountTiers: [] as Array<{
      minProducts: number;
      discountPercent: number;
    }>,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, bundlesRes] = await Promise.all([
        fetch("/api/admin/categories", { credentials: "include" }),
        fetch("/api/marketing/build-your-own-bundle", { credentials: "include" }),
      ]);

      const categoriesData = await categoriesRes.json();
      const bundlesData = await bundlesRes.json();

      if (categoriesData.success) {
        setAllCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
      }
      if (bundlesData.success) {
        setBundles(Array.isArray(bundlesData) ? bundlesData : []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/marketing/build-your-own-bundle/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, enabled }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update");

      setBundles((prev: any[]) =>
        prev.map((bundle) => (bundle.id === id ? { ...bundle, enabled } : bundle))
      );
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle configuration?")) return;

    try {
      const res = await fetch(`/api/marketing/build-your-own-bundle/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setBundles((prev: any[]) => prev.filter((bundle) => bundle.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      heroTitle: "",
      heroSubtitle: "",
      heroImage: "",
      heroBannerColor: "#0F766E",
      ctaText: "Build Bundle",
      ctaUrl: "",
      sectionTitle: "",
      sectionDescription: "",
      backgroundColor: "#ffffff",
      minProducts: 2,
      maxProducts: 10,
      baseDiscount: 0,
      status: "DRAFT",
      enabled: true,
      featured: false,
      startDate: "",
      endDate: "",
      displayOrder: bundles.length,
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      categoryIds: [],
      discountTiers: [
        { minProducts: 2, discountPercent: 5 },
        { minProducts: 3, discountPercent: 10 },
        { minProducts: 5, discountPercent: 15 },
      ],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (bundle: any) => {
    const categoryIds = bundle.categories?.map((bc: any) => bc.categoryId) || [];
    const discountTiers = bundle.discountTiers || [];
    
    setFormData({
      ...bundle,
      startDate: bundle.startDate ? new Date(bundle.startDate).toISOString().split('T')[0] : "",
      endDate: bundle.endDate ? new Date(bundle.endDate).toISOString().split('T')[0] : "",
      categoryIds,
      discountTiers,
    });
    setEditingId(bundle.id);
    setShowForm(true);
  };

  const handleAddDiscountTier = () => {
    const lastTier = formData.discountTiers[formData.discountTiers.length - 1];
    const newMinProducts = lastTier ? lastTier.minProducts + 1 : 2;
    setFormData({
      ...formData,
      discountTiers: [...formData.discountTiers, { minProducts: newMinProducts, discountPercent: 5 }],
    });
  };

  const handleRemoveDiscountTier = (index: number) => {
    setFormData({
      ...formData,
      discountTiers: formData.discountTiers.filter((_, i) => i !== index),
    });
  };

  const handleDiscountTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...formData.discountTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({ ...formData, discountTiers: newTiers });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (formData.minProducts < 2) {
      toast.error("Minimum products must be at least 2");
      return;
    }
    if (formData.maxProducts < formData.minProducts) {
      toast.error("Maximum products must be greater than minimum");
      return;
    }

    setSaving(true);
    try {
      const categoriesData = formData.categoryIds.map((categoryId: string, index: number) => ({
        categoryId,
        required: false,
        displayOrder: index,
      }));

      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        categories: categoriesData,
        discountTiers: formData.discountTiers,
      };

      const url = editingId ? `/api/marketing/build-your-own-bundle/${editingId}` : "/api/marketing/build-your-own-bundle";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error(editingId ? "Failed to update" : "Failed to create");

      const data = await res.json();
      
      if (editingId) {
        setBundles((prev: any[]) => prev.map((bundle) => (bundle.id === editingId ? data : bundle)));
        toast.success("Updated successfully");
      } else {
        setBundles([...bundles, data]);
        toast.success("Created successfully");
      }
      
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error(editingId ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Build Your Own Bundle</h1>
          <p className="text-muted-foreground">Manage custom bundle configurations</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleAdd} className="btn-primary px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Configuration
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold">{editingId ? "Edit Configuration" : "Create Configuration"}</h2>
              <button type="button" onClick={handleCancelForm} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Products *</label>
                  <input
                    type="number"
                    value={formData.minProducts}
                    onChange={(e) => setFormData({ ...formData, minProducts: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                    min="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Products *</label>
                  <input
                    type="number"
                    value={formData.maxProducts}
                    onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                    min="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base Discount (%)</label>
                  <input
                    type="number"
                    value={formData.baseDiscount}
                    onChange={(e) => setFormData({ ...formData, baseDiscount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                 {allCategories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 p-2 border border-border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, categoryIds: [...formData.categoryIds, category.id] });
                          } else {
                            setFormData({ ...formData, categoryIds: formData.categoryIds.filter((id) => id !== category.id) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Discount Tiers</label>
                  <button type="button" onClick={handleAddDiscountTier} className="px-4 py-2 btn-primary text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.discountTiers.map((tier, index) => (
                    <div key={index} className="flex items-center_gap-2 p-3 border border-border rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Min Products</label>
                          <input
                            type="number"
                            value={tier.minProducts}
                            onChange={(e) => handleDiscountTierChange(index, "minProducts", parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded border border-border text-sm"
                            min="2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Discount %</label>
                          <input
                            type="number"
                            value={tier.discountPercent}
                            onChange={(e) => handleDiscountTierChange(index, "discountPercent", parseFloat(e.target.value))}
                            className="w-full px-3 py-2 rounded border border-border text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveDiscountTier(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Enabled</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <button type="button" onClick={handleCancelForm} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground">
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle: any, index: number) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{bundle.name}</h3>
                <p className="text-sm text-muted-foreground">{bundle.slug}</p>
              </div>
              <button onClick={() => handleToggle(bundle.id, !bundle.enabled)} className="p-2 hover:bg-muted rounded-lg">
                {bundle.enabled ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Min:</span>
                <span className="font-medium ml-1">{bundle.minProducts}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max:</span>
                <span className="font-medium ml-1">{bundle.maxProducts}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{bundle.categories?.length || 0} categories</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tiers:</span>
              <span className="font-medium">{bundle.discountTiers?.length || 0}</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(bundle)} className="flex-1 btn-outline py-2 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => handleDelete(bundle.id)} className="flex-1 btn-outline py-2 flex items-center justify-center gap-2 text-red-500">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {bundles.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No configurations yet</p>
          <button onClick={handleAdd} className="btn-primary mt-4 px-4 py-2 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add First Configuration
          </button>
        </div>
      )}
    </div>
  );
}
