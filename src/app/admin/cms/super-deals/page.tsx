"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Clock,
  ToggleLeft, ToggleRight, Tag, Calendar, X
} from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProductSelector } from "@/components/admin/ProductSelector";

export default function SuperDealsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [superDeals, setSuperDeals] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, dealsRes] = await Promise.all([
        fetch("/api/admin/products", {
          credentials: "include",
        }),
        fetch("/api/admin/super-deals", {
          credentials: "include",
        }),
      ]);

      const productsData = await productsRes.json();
      const dealsData = await dealsRes.json();

      if (productsData.success) {
        setProducts(Array.isArray(productsData.products) ? productsData.products : []);
      }
      if (dealsData.success) {
        setSuperDeals(dealsData.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/super-deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setSuperDeals((prev) =>
        prev.map((deal) => (deal.id === id ? { ...deal, enabled } : deal))
      );
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this super deal?")) return;

    try {
      const res = await fetch(`/api/admin/super-deals/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setSuperDeals((prev) => prev.filter((deal) => deal.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleAdd = () => {
    setShowProductSelector(true);
  };

  const handleProductSelect = (productId: string) => {
    // If editing, update the edit form with the selected product
    if (editingId && editForm) {
      const product = Array.isArray(products) ? products.find(p => p.id === productId) : null;
      if (product) {
        setEditForm({ ...editForm, productId: productId });
      }
      setShowProductSelector(false);
      return;
    }

    // If adding, create a new super deal
    const product = Array.isArray(products) ? products.find(p => p.id === productId) : null;
    if (!product) {
      toast.error("Product not found in the admin products response. Refresh products and try again.");
      setShowProductSelector(false);
      return;
    }

    try {
      fetch("/api/admin/super-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId,
          order: superDeals.length,
          enabled: true,
          countdown: true,
        }),
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create");
        return res.json();
      })
      .then(data => {
        setSuperDeals([...superDeals, data.data]);
        toast.success("Added successfully");
        setShowProductSelector(false);
      })
      .catch(error => {
        toast.error("Failed to add");
        setShowProductSelector(false);
      });
    } catch (error) {
      toast.error("Failed to add");
      setShowProductSelector(false);
    }
  };

  const handleEdit = (deal: any) => {
    setEditForm({
      id: deal.id,
      productId: deal.productId,
      order: deal.order,
      enabled: deal.enabled,
      startDate: deal.startDate || "",
      endDate: deal.endDate || "",
      countdown: deal.countdown,
      image: deal.image || "",
    });
    setEditingId(deal.id);
    setShowProductSelector(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const res = await fetch(`/api/admin/super-deals/${editForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setSuperDeals((prev) =>
        prev.map((deal) => (deal.id === editForm.id ? data.data : deal))
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
          <h1 className="text-2xl font-bold">Super Deals</h1>
          <p className="text-muted-foreground">Manage homepage super deals with countdown timers</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Super Deal
        </button>
      </div>

      {/* Super Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {superDeals.map((deal, index) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{deal.product?.name}</h3>
                <p className="text-sm text-muted-foreground">Order: {deal.order}</p>
              </div>
              <button
                onClick={() => handleToggle(deal.id, !deal.enabled)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {deal.enabled ? (
                  <ToggleRight className="w-5 h-5 text-green-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {editingId === deal.id && editForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product</label>
                  <button
                    type="button"
                    onClick={() => setShowProductSelector(true)}
                    className="w-full px-3 py-2 rounded-lg border border-border text-left flex items-center gap-2 hover:bg-muted transition-colors"
                  >
                    {editForm.productId ? (
                      <>
                        <span className="flex-1">
                          {products.find(p => p.id === editForm.productId)?.name || 'Selected Product'}
                        </span>
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select a product</span>
                    )}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Image</label>
                  <ImageUpload
                    value={editForm.image}
                    onChange={(url) => setEditForm({ ...editForm, image: url })}
                    folder="super-deals"
                    aspectRatio="square"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.startDate ? new Date(editForm.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.endDate ? new Date(editForm.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="countdown"
                    checked={editForm.countdown}
                    onChange={(e) => setEditForm({ ...editForm, countdown: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="countdown" className="text-sm font-medium">Enable Countdown</label>
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
                {deal.image ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={deal.image}
                      alt={deal.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : deal.product?.images?.[0] && (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={deal.product.images[0]}
                      alt={deal.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {deal.product?.price?.toFixed(2)} MAD
                    </span>
                    {deal.product?.comparePrice && (
                      <span className="text-muted-foreground line-through">
                        {deal.product.comparePrice.toFixed(2)} MAD
                      </span>
                    )}
                  </div>

                  {deal.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Ends: {new Date(deal.endDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {deal.countdown && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="text-red-500 font-medium">Countdown enabled</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(deal)}
                    className="flex-1 btn-outline py-2 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(deal.id)}
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

      {superDeals.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No super deals yet</p>
          <button
            onClick={handleAdd}
            className="btn-primary mt-4 px-4 py-2 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add First Super Deal
          </button>
        </div>
      )}

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select a Product</h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductSelector
              onChange={handleProductSelect}
              filterPublished={undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
