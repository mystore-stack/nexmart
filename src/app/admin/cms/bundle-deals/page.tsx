"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Package,
  ToggleLeft, ToggleRight, Layers, Percent
} from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function BundleDealsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [bundleDeals, setBundleDeals] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, bundlesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/bundle-deals"),
      ]);

      const productsData = await productsRes.json();
      const bundlesData = await bundlesRes.json();

      if (productsData.success) {
        setProducts(productsData.products || []);
      }
      if (bundlesData.success) {
        setBundleDeals(bundlesData.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/bundle-deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setBundleDeals((prev) =>
        prev.map((bundle) => (bundle.id === id ? { ...bundle, enabled } : bundle))
      );
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle deal?")) return;

    try {
      const res = await fetch(`/api/admin/bundle-deals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setBundleDeals((prev) => prev.filter((bundle) => bundle.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleAdd = async () => {
    if (products.length < 2) {
      toast.error("Need at least 2 products to create a bundle. Please create products first.", {
        duration: 5000,
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/bundle-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Bundle",
          bundlePrice: 0,
          discountPercent: 10,
          enabled: true,
          order: bundleDeals.length,
          products: [
            { productId: products[0].id, order: 0 },
            { productId: products[1].id, order: 1 },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to create");

      const data = await res.json();
      setBundleDeals([...bundleDeals, data.data]);
      toast.success("Added successfully");
    } catch (error) {
      toast.error("Failed to add");
    }
  };

  const handleEdit = (bundle: any) => {
    setEditForm({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description || "",
      bundlePrice: bundle.bundlePrice,
      discountPercent: bundle.discountPercent,
      enabled: bundle.enabled,
      backgroundColor: bundle.backgroundColor || "#ffffff",
      gradient: bundle.gradient || "",
      buttonText: bundle.buttonText || "Buy Bundle",
      buttonUrl: bundle.buttonUrl || "",
      image: bundle.image || "",
      order: bundle.order,
    });
    setEditingId(bundle.id);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const res = await fetch(`/api/admin/bundle-deals/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setBundleDeals((prev) =>
        prev.map((bundle) => (bundle.id === editForm.id ? data.data : bundle))
      );
      setEditingId(null);
      setEditForm(null);
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Bundle Deals</h1>
          <p className="text-muted-foreground">Manage homepage bundle deals with multiple products</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Bundle Deal
        </button>
      </div>

      {/* Bundle Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundleDeals.map((bundle, index) => (
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
                <p className="text-sm text-muted-foreground">Order: {bundle.order}</p>
              </div>
              <button
                onClick={() => handleToggle(bundle.id, !bundle.enabled)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {bundle.enabled ? (
                  <ToggleRight className="w-5 h-5 text-green-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {editingId === bundle.id && editForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bundle Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Image</label>
                  <ImageUpload
                    value={editForm.image}
                    onChange={(url) => setEditForm({ ...editForm, image: url })}
                    folder="bundle-deals"
                    aspectRatio="landscape"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bundle Price</label>
                  <input
                    type="number"
                    value={editForm.bundlePrice}
                    onChange={(e) => setEditForm({ ...editForm, bundlePrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Percent</label>
                  <input
                    type="number"
                    value={editForm.discountPercent}
                    onChange={(e) => setEditForm({ ...editForm, discountPercent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <input
                    type="color"
                    value={editForm.backgroundColor}
                    onChange={(e) => setEditForm({ ...editForm, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gradient</label>
                  <input
                    type="text"
                    value={editForm.gradient}
                    onChange={(e) => setEditForm({ ...editForm, gradient: e.target.value })}
                    placeholder="linear-gradient(to right, #color1, #color2)"
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Text</label>
                  <input
                    type="text"
                    value={editForm.buttonText}
                    onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button URL</label>
                  <input
                    type="text"
                    value={editForm.buttonUrl}
                    onChange={(e) => setEditForm({ ...editForm, buttonUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 btn-primary py-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 btn-outline py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Products Preview */}
                <div className="flex items-center gap-2">
                  {bundle.products?.slice(0, 3).map((bp: any, i: number) => (
                    <div key={bp.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={bp.product?.image}
                        alt={bp.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {bundle.products?.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                      +{bundle.products.length - 3}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{bundle.products?.length || 0} products</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{bundle.discountPercent}% discount</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-primary">
                      {bundle.bundlePrice?.toFixed(2)} MAD
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(bundle)}
                    className="flex-1 btn-outline py-2 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    className="flex-1 btn-outline py-2 flex items-center justify-center gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {bundleDeals.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No bundle deals yet</p>
          <button
            onClick={handleAdd}
            className="btn-primary mt-4 px-4 py-2 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add First Bundle Deal
          </button>
        </div>
      )}
    </div>
  );
}
