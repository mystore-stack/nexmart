"use client";
// src/app/admin/products/[id]/edit/page.tsx
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, X, Plus, Trash2, Upload,
  Package, DollarSign, Box, AlertTriangle
} from "lucide-react";
import { formatPrice } from "@/utils/format";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockAt: number;
  category: { id: string; name: string };
  images: string[];
  published: boolean;
  soldCount: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    lowStockAt: "",
    categoryId: "",
    images: [] as string[],
    published: false,
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }
        throw new Error("Failed to fetch product");
      }

      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setProduct(p);
        setFormData({
          name: p.name,
          sku: p.sku,
          description: p.description,
          price: String(p.price),
          comparePrice: p.comparePrice ? String(p.comparePrice) : "",
          stock: String(p.stock),
          lowStockAt: String(p.lowStockAt),
          categoryId: p.category?.id || "",
          images: p.images || [],
          published: p.published,
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          description: formData.description,
          price: parseFloat(formData.price),
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
          stock: parseInt(formData.stock),
          lowStockAt: parseInt(formData.lowStockAt),
          categoryId: formData.categoryId,
          images: formData.images,
          published: formData.published,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const addImage = (url: string) => {
    if (url && !formData.images.includes(url)) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-semibold">Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground text-sm mt-1">
            SKU: {formData.sku}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full min-h-[120px]"
                  rows={4}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input pl-10 w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Compare Price (Optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                      className="input pl-10 w-full"
                      placeholder="For showing discount"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input pl-10 w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Low Stock Alert At</label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={formData.lowStockAt}
                      onChange={(e) => setFormData({ ...formData, lowStockAt: e.target.value })}
                      className="input pl-10 w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Images</h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL and press Enter"
                  className="input flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addImage(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-outline px-4"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Paste image URL"]') as HTMLInputElement;
                    if (input) {
                      addImage(input.value);
                      input.value = "";
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={img}
                          alt={`Product image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Status</h2>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm">Published</span>
              </label>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Sold: <span className="font-semibold">{product.soldCount}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full py-2.5"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </>
                )}
              </button>

              <Link
                href="/admin/products"
                className="btn-outline w-full py-2.5 block text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
