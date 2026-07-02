"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Package,
  ToggleLeft, ToggleRight, Layers, Percent, X
} from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProductSelectorModal } from "@/components/admin/bundle/ProductSelectorModal";
import { SelectedProductsList } from "@/components/admin/bundle/SelectedProductsList";
import { BundlePriceCalculator } from "@/components/admin/bundle/BundlePriceCalculator";
import type { Product, SelectedProductItem, BundleFormData } from "@/components/admin/bundle/types";

export default function BundleDealsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bundleDeals, setBundleDeals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [formData, setFormData] = useState<BundleFormData>({
    name: "",
    description: "",
    bundlePrice: 0,
    discountPercent: 10,
    enabled: true,
    order: 0,
    backgroundColor: "#ffffff",
    gradient: "",
    buttonText: "Buy Bundle",
    buttonUrl: "",
    image: "",
    productIds: [],
  });
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductItem[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const bundlesRes = await fetch("/api/admin/bundle-deals", {
        credentials: "include",
      });

      const bundlesData = await bundlesRes.json();

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

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      bundlePrice: 0,
      discountPercent: 10,
      enabled: true,
      order: bundleDeals.length,
      backgroundColor: "#ffffff",
      gradient: "",
      buttonText: "Buy Bundle",
      buttonUrl: "",
      image: "",
      productIds: [],
    });
    setSelectedProducts([]);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (bundle: any) => {
    const productIds = bundle.products?.map((bp: any) => bp.productId) || [];
    const selectedItems: SelectedProductItem[] = bundle.products?.map((bp: any, index: number) => ({
      productId: bp.productId,
      product: bp.product,
      order: index,
    })) || [];
    
    setFormData({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description || "",
      bundlePrice: bundle.bundlePrice,
      discountPercent: bundle.discountPercent,
      enabled: bundle.enabled,
      order: bundle.order,
      backgroundColor: bundle.backgroundColor || "#ffffff",
      gradient: bundle.gradient || "",
      buttonText: bundle.buttonText || "Buy Bundle",
      buttonUrl: bundle.buttonUrl || "",
      image: bundle.image || "",
      productIds,
    });
    setSelectedProducts(selectedItems);
    setEditingId(bundle.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (formData.productIds.length < 2) {
      toast.error("At least 2 products are required for a bundle");
      return;
    }
    if (new Set(formData.productIds).size !== formData.productIds.length) {
      toast.error("Duplicate products detected");
      return;
    }

    setSaving(true);
    try {
      const productsData = formData.productIds.map((productId, index) => ({
        productId,
        order: index,
      }));

      const payload = {
        ...formData,
        products: productsData,
      };

      const url = editingId ? `/api/admin/bundle-deals/${editingId}` : "/api/admin/bundle-deals";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(editingId ? "Failed to update" : "Failed to create");

      const data = await res.json();
      
      if (editingId) {
        setBundleDeals((prev) =>
          prev.map((bundle) => (bundle.id === editingId ? data.data : bundle))
        );
        toast.success("Updated successfully");
      } else {
        setBundleDeals([...bundleDeals, data.data]);
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

  const handleProductsSelected = (products: Product[]) => {
    const newSelectedProducts: SelectedProductItem[] = products.map((product, index) => ({
      productId: product.id,
      product,
      order: index,
    }));
    
    setSelectedProducts(newSelectedProducts);
    setFormData({ ...formData, productIds: products.map((p) => p.id) });
    setShowProductSelector(false);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.productId !== productId));
    setFormData((prev) => ({ ...prev, productIds: prev.productIds.filter((id) => id !== productId) }));
  };

  const handleReorderProducts = (fromIndex: number, toIndex: number) => {
    const newSelectedProducts = [...selectedProducts];
    const [moved] = newSelectedProducts.splice(fromIndex, 1);
    newSelectedProducts.splice(toIndex, 0, moved);
    
    // Update order values
    newSelectedProducts.forEach((item, index) => {
      item.order = index;
    });
    
    setSelectedProducts(newSelectedProducts);
    setFormData({ ...formData, productIds: newSelectedProducts.map((item) => item.productId) });
  };

  const handleDiscountChange = (discount: number) => {
    setFormData({ ...formData, discountPercent: discount });
  };

  const handlePriceChange = (price: number) => {
    setFormData({ ...formData, bundlePrice: price });
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold">{editingId ? "Edit Bundle Deal" : "Create Bundle Deal"}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelForm}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Product Selection */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bundle Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter bundle name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Enter bundle description"
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
                    {formData.productIds.length < 2 && (
                      <p className="text-sm text-red-500 mt-2">At least 2 products required</p>
                    )}
                  </div>
                </div>

                {/* Right Column - Pricing & Styling */}
                <div className="space-y-6">
                  <BundlePriceCalculator
                    products={selectedProducts.map((item) => ({ price: item.product.price }))}
                    discountPercent={formData.discountPercent}
                    onDiscountChange={handleDiscountChange}
                    onPriceChange={handlePriceChange}
                    disabled={saving}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Image</label>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      folder="bundle-deals"
                      aspectRatio="landscape"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-full h-10 rounded-lg border border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Gradient</label>
                    <input
                      type="text"
                      value={formData.gradient}
                      onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                      placeholder="linear-gradient(to right, #color1, #color2)"
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Button URL</label>
                    <input
                      type="text"
                      value={formData.buttonUrl}
                      onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={handleCancelForm}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || formData.productIds.length < 2}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onProductsSelected={handleProductsSelected}
        selectedProductIds={formData.productIds}
      />

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

                {/* Products Preview */}
                <div className="flex items-center gap-2">
                  {bundle.products?.slice(0, 3).map((bp: any, i: number) => (
                    <div key={bp.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={bp.product?.images?.[0] || "/placeholder.png"}
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
