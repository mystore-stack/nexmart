"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Image as ImageIcon,
  ToggleLeft, ToggleRight, Palette, Layout, X
} from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function FeaturedCategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, featuredRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/admin/featured-categories"),
      ]);

      const categoriesData = await categoriesRes.json();
      const featuredData = await featuredRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.data || []);
      }
      if (featuredData.success) {
        setFeaturedCategories(featuredData.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/featured-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setFeaturedCategories((prev) =>
        prev.map((fc) => (fc.id === id ? { ...fc, enabled } : fc))
      );
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this featured category?")) return;

    try {
      const res = await fetch(`/api/admin/featured-categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setFeaturedCategories((prev) => prev.filter((fc) => fc.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleAdd = async () => {
    if (categories.length === 0) {
      toast.error("No categories available");
      return;
    }

    const categoryId = categories[0].id;

    try {
      const res = await fetch("/api/admin/featured-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          order: featuredCategories.length,
          enabled: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to create");

      const data = await res.json();
      setFeaturedCategories([...featuredCategories, data.data]);
      toast.success("Added successfully");
    } catch (error) {
      toast.error("Failed to add");
    }
  };

  const handleEdit = (fc: any) => {
    setEditForm({
      id: fc.id,
      categoryId: fc.categoryId,
      order: fc.order,
      enabled: fc.enabled,
      backgroundColor: fc.backgroundColor || "#ffffff",
      gradient: fc.gradient || "",
      buttonText: fc.buttonText || "Shop Now",
      buttonUrl: fc.buttonUrl || "",
      description: fc.description || "",
      image: fc.image || "",
    });
    setEditingId(fc.id);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const res = await fetch(`/api/admin/featured-categories/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setFeaturedCategories((prev) =>
        prev.map((fc) => (fc.id === editForm.id ? data.data : fc))
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
          <h1 className="text-2xl font-bold">Featured Categories</h1>
          <p className="text-muted-foreground">Manage homepage featured categories</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Featured Category
        </button>
      </div>

      {/* Featured Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCategories.map((fc, index) => (
          <motion.div
            key={fc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{fc.category?.name}</h3>
                <p className="text-sm text-muted-foreground">Order: {fc.order}</p>
              </div>
              <button
                onClick={() => handleToggle(fc.id, !fc.enabled)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {fc.enabled ? (
                  <ToggleRight className="w-5 h-5 text-green-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {editingId === fc.id && editForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Image</label>
                  <ImageUpload
                    value={editForm.image}
                    onChange={(url) => setEditForm({ ...editForm, image: url })}
                    folder="featured-categories"
                    aspectRatio="landscape"
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
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                    rows={3}
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
                {fc.image ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={fc.image}
                      alt={fc.category?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : fc.category?.image && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={fc.category.image}
                      alt={fc.category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(fc)}
                    className="flex-1 btn-outline py-2 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(fc.id)}
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

      {featuredCategories.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No featured categories yet</p>
          <button
            onClick={handleAdd}
            className="btn-primary mt-4 px-4 py-2 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add First Featured Category
          </button>
        </div>
      )}
    </div>
  );
}
