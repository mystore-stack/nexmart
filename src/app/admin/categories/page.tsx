"use client";
// src/app/admin/categories/page.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, FolderOpen, Edit, Trash2, X, Check, Image as ImageIcon, Layout as LayoutIcon, Upload, Loader2, GripVertical } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order?: number;
  _count?: { products: number };
}

function SortableCategoryItem({ category, onEdit, onDelete }: { category: Category; onEdit: (cat: Category) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-2xl overflow-hidden group">
      {/* Image / placeholder */}
      <div className="relative h-24 bg-muted">
        {category.image ? (
          <Image src={category.image} alt={category.name} fill className="object-cover" sizes="300px" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{category.name}</p>
                  {category.parentId && (
                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">Sub</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{category.slug}</p>
                {category._count && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {category._count.products} products
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(category)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Modifier nom/image">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(category.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500" title="Supprimer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prominent Visual Builder Button */}
        <div className="mt-3 pt-3 border-t border-border/60">
          <Link
            href={`/admin/cms/categories/${category.id}`}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all"
          >
            <LayoutIcon className="w-3.5 h-3.5" />
            <span>🎨 Éditer avec Visual Builder</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const emptyForm = { name: "", description: "", image: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetch("/api/admin/categories/list", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { 
        if (d.data) {
          setCategories(d.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Category name required"); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        if (editId) {
          setCategories((prev) => prev.map((c) => c.id === editId ? data.data : c));
          toast.success("Category updated!");
        } else {
          setCategories((prev) => [...prev, data.data]);
          toast.success("Category created!");
        }
        setShowForm(false);
        setForm({ ...emptyForm });
        setEditId(null);
      } else {
        toast.error(data.error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Products won't be deleted.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { 
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    }
  };

  const editCategory = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description || "", image: cat.image || "" });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });

      // Save new order to server
      setReordering(true);
      try {
        const newOrder = categories.map(cat => cat.id);
        const res = await fetch('/api/admin/categories/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ categoryIds: newOrder }),
        });
        if (res.ok) {
          toast.success('Order updated successfully');
        } else {
          toast.error('Failed to update order');
          // Revert the order on error
          const oldIndex = categories.findIndex((item) => item.id === active.id);
          const newIndex = categories.findIndex((item) => item.id === over.id);
          setCategories((items) => arrayMove(items, newIndex, oldIndex));
        }
      } catch (error) {
        toast.error('Failed to update order');
        // Revert the order on error
        const oldIndex = categories.findIndex((item) => item.id === active.id);
        const newIndex = categories.findIndex((item) => item.id === over.id);
        setCategories((items) => arrayMove(items, newIndex, oldIndex));
      } finally {
        setReordering(false);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'nexmart/categories');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.data.url) {
        setForm((f) => ({ ...f, image: data.data.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories.length} categories • Drag to reorder</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }}
          className="btn-primary py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          Add Category
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
              <h2 className="font-bold text-lg">{editId ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Electronics"
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Image</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="input"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploading}
                      className="hidden"
                      id="category-image-upload"
                    />
                    <label
                      htmlFor="category-image-upload"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-dashed rounded-xl border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer text-sm font-medium text-amber-700 dark:text-amber-400"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  rows={2}
                  className="input resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-border justify-end">
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline py-2.5 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-5 text-sm">
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">No categories yet</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ opacity: reordering ? 0.5 : 1 }}
                >
                  <SortableCategoryItem
                    category={cat}
                    onEdit={editCategory}
                    onDelete={deleteCategory}
                  />
                </motion.div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
