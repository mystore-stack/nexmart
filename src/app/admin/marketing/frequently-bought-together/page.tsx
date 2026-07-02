"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Package,
  ToggleLeft, ToggleRight, X, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProductSelectorModal } from "@/components/admin/bundle/ProductSelectorModal";
import { SelectedProductsList } from "@/components/admin/bundle/SelectedProductsList";

export default function FrequentlyBoughtTogetherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bundles, setBundles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    description: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    heroBannerColor: "#0F766E",
    ctaText: "Shop Now",
    ctaUrl: "",
    sectionTitle: "",
    sectionDescription: "",
    backgroundColor: "#ffffff",
    status: "DRAFT",
    enabled: true,
    featured: false,
    startDate: "",
    endDate: "",
    displayOrder: 0,
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    productIds: [] as string[],
  });
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const bundlesRes = await fetch("/api/marketing/frequently-bought-together", { credentials: "include" });
      const bundlesData = await bundlesRes.json();

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
      const res = await fetch(`/api/marketing/frequently-bought-together/${id}`, {
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
    if (!confirm("Are you sure you want to delete this bundle?")) return;

    try {
      const res = await fetch(`/api/marketing/frequently-bought-together/${id}`, {
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
      ctaText: "Shop Now",
      ctaUrl: "",
      sectionTitle: "",
      sectionDescription: "",
      backgroundColor: "#ffffff",
      status: "DRAFT",
      enabled: true,
      featured: false,
      startDate: "",
      endDate: "",
      displayOrder: bundles.length,
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      productIds: [],
    });
    setSelectedProducts([]);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (bundle: any) => {
    const productIds = bundle.products?.map((bp: any) => bp.productId) || [];
    const selectedItems = bundle.products?.map((bp: any, index: number) => ({
      productId: bp.productId,
      product: bp.product,
      order: index,
    })) || [];
    
    setFormData({
      ...bundle,
      startDate: bundle.startDate ? new Date(bundle.startDate).toISOString().split('T')[0] : "",
      endDate: bundle.endDate ? new Date(bundle.endDate).toISOString().split('T')[0] : "",
      productIds,
    });
    setSelectedProducts(selectedItems);
    setEditingId(bundle.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (formData.productIds.length < 2) {
      toast.error("At least 2 products are required");
      return;
    }

    setSaving(true);
    try {
      const productsData = formData.productIds.map((productId: string, index: number) => ({
        productId,
        displayOrder: index,
      }));

      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        products: productsData,
      };

      const url = editingId ? `/api/marketing/frequently-bought-together/${editingId}` : "/api/marketing/frequently-bought-together";
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
      setSelectedProducts([]);
    } catch (error) {
      toast.error(editingId ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedProducts([]);
  };

  const handleProductsSelected = (products: any[]) => {
    const newSelectedProducts = products.map((product, index) => ({
      productId: product.id,
      product,
      order: index,
    }));

    setSelectedProducts(newSelectedProducts);
    setFormData({ ...formData, productIds: products.map((p) => p.id) });
    setShowProductSelector(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev: any[]) => prev.filter((item) => item.productId !== productId));
    setFormData((prev: any) => ({ ...prev, productIds: prev.productIds.filter((id: string) => id !== productId) }));
  };

  const handleReorderProducts = (fromIndex: number, toIndex: number) => {
    const newSelectedProducts = [...selectedProducts];
    const [moved] = newSelectedProducts.splice(fromIndex, 1);
    newSelectedProducts.splice(toIndex, 0, moved);
    
    newSelectedProducts.forEach((item, index) => { item.order = index; });
    
    setSelectedProducts(newSelectedProducts);
    setFormData({ ...formData, productIds: newSelectedProducts.map((item) => item.productId) });
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
          <h1 className="text-2xl font-bold">Frequently Bought Together</h1>
          <p className="text-muted-foreground">Manage product combinations</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleAdd} className="btn-primary px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Bundle
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold">{editingId ? "Edit Bundle" : "Create Bundle"}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              <button type="button" onClick={handleCancelForm} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Products *</label>
                      <button
                        type="button"
                        onClick={() => setShowProductSelector(true)}
                        className="px-4 py-2 btn-primary text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Select Products
                      </button>
                    </div>
                    <SelectedProductsList
                      products={selectedProducts}
                      onRemove={handleRemoveProduct}
                      onReorder={handleReorderProducts}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Title</label>
                    <input
                      type="text"
                      value={formData.heroTitle}
                      onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                    <input
                      type="text"
                      value={formData.heroSubtitle}
                      onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Image</label>
                    <ImageUpload
                      value={formData.heroImage}
                      onChange={(url) => setFormData({ ...formData, heroImage: url })}
                      folder="frequently-bought-together"
                      aspectRatio="landscape"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CTA Text</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CTA URL</label>
                    <input
                      type="text"
                      value={formData.ctaUrl}
                      onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
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
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <button type="button" onClick={handleCancelForm} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving || formData.productIds.length < 2} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground">
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onProductsSelected={handleProductsSelected}
        selectedProductIds={formData.productIds}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle: any, index: number) => (
          <motion.div
            key={bundle.id || index}
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

            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{bundle.products?.length || 0} products</span>
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
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No bundles yet</p>
          <button onClick={handleAdd} className="btn-primary mt-4 px-4 py-2 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add First Bundle
          </button>
        </div>
      )}
    </div>
  );
}
