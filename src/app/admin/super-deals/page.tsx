"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Copy, Eye, EyeOff, BarChart3, Calendar, Clock, Sparkles, MoreVertical, Globe, Languages } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getSuperDeals, deleteSuperDeal, duplicateSuperDeal, reorderSuperDeals } from "@/lib/actions/super-deals";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProductSelector } from "@/components/admin/ProductSelector";

interface SuperDeal {
  id: string;
  productId: string;
  order: number;
  enabled: boolean;
  discountType: string;
  discountValue: number;
  originalPrice?: number;
  dealPrice?: number;
  startDate?: string;
  endDate?: string;
  autoStart: boolean;
  autoEnd: boolean;
  countdown: boolean;
  featured: boolean;
  flashSale: boolean;
  stockLimit?: number;
  image?: string;
  bannerImage?: string;
  backgroundColor?: string;
  gradient?: string;
  buttonText: string;
  buttonUrl?: string;
  title?: string;
  description?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    comparePrice?: number;
    published: boolean;
  };
  analytics: any[];
}

export default function SuperDealsPage() {
  const [deals, setDeals] = useState<SuperDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    console.log("[SUPER_DEALS] Loading deals...");
    setLoading(true);
    try {
      const result = await getSuperDeals();
      console.log("[SUPER_DEALS] Result:", result);
      if (result.success) {
        setDeals(result.data);
        console.log("[SUPER_DEALS] Loaded", result.data.length, "deals");
      } else {
        console.error("[SUPER_DEALS] Failed to load:", result.error);
        toast.error(result.error || "Failed to load super deals");
      }
    } catch (error) {
      console.error("[SUPER_DEALS] Error loading deals:", error);
      toast.error("Failed to load super deals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this super deal?")) return;

    const result = await deleteSuperDeal(id);
    if (result.success) {
      toast.success("Super deal deleted successfully");
      loadDeals();
    } else {
      toast.error(result.error || "Failed to delete super deal");
    }
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateSuperDeal(id);
    if (result.success) {
      toast.success("Super deal duplicated successfully");
      loadDeals();
    } else {
      toast.error(result.error || "Failed to duplicate super deal");
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    const result = await fetch(`/api/admin/super-deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });

    if (result.ok) {
      toast.success(`Super deal ${!enabled ? "enabled" : "disabled"}`);
      loadDeals();
    } else {
      toast.error("Failed to update super deal");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDeals.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedDeals.size} super deals?`)) return;

    await Promise.all(Array.from(selectedDeals).map(id => deleteSuperDeal(id)));
    toast.success(`${selectedDeals.size} super deals deleted`);
    setSelectedDeals(new Set());
    loadDeals();
  };

  const isDealActive = (deal: SuperDeal) => {
    if (!deal.enabled) return false;
    const now = new Date();
    if (deal.startDate && new Date(deal.startDate) > now) return false;
    if (deal.endDate && new Date(deal.endDate) < now) return false;
    return true;
  };

  const getDiscountDisplay = (deal: SuperDeal) => {
    if (deal.discountType === "PERCENTAGE") {
      return `${deal.discountValue}%`;
    } else if (deal.discountType === "FIXED_AMOUNT") {
      return `${deal.discountValue} MAD`;
    } else {
      return "BOGO";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Super Deals</h1>
          <p className="text-muted-foreground">Manage your flash sales and special offers</p>
        </div>
        <div className="flex gap-3">
          {selectedDeals.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete ({selectedDeals.size})
            </button>
          )}
          <button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Deals</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{deals.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active</span>
            <Eye className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{deals.filter(d => isDealActive(d)).length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Featured</span>
            <BarChart3 className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">{deals.filter(d => d.featured).length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Flash Sales</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{deals.filter(d => d.flashSale).length}</p>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="space-y-4">
        {deals.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No super deals yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-primary hover:underline"
            >
              Create your first deal
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {deals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-card border border-border rounded-xl overflow-hidden ${
                  !deal.enabled ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedDeals.has(deal.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedDeals);
                      if (e.target.checked) {
                        newSelected.add(deal.id);
                      } else {
                        newSelected.delete(deal.id);
                      }
                      setSelectedDeals(newSelected);
                    }}
                    className="w-4 h-4 rounded"
                  />

                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {deal.product.images[0] ? (
                      <Image
                        src={deal.product.images[0]}
                        alt={deal.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <span className="text-2xl font-bold">
                          {deal.product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Deal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{deal.title || deal.product.name}</h3>
                      {deal.featured && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                      {deal.flashSale && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs rounded-full">
                          Flash Sale
                        </span>
                      )}
                      {deal.countdown && (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-full">
                          Countdown
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {deal.product.name} • {getDiscountDisplay(deal)} discount
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {deal.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(deal.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {deal.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(deal.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-primary">
                      {deal.dealPrice || deal.product.price} MAD
                    </p>
                    {deal.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">
                        {deal.originalPrice} MAD
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleEnabled(deal.id, deal.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        deal.enabled
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                      }`}
                    >
                      {deal.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditId(deal.id);
                        setShowForm(true);
                      }}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(deal.id)}
                      className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editId ? "Edit Super Deal" : "Create Super Deal"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <SuperDealForm
                  editId={editId}
                  onSuccess={() => {
                    setShowForm(false);
                    setEditId(null);
                    loadDeals();
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuperDealForm({ editId, onSuccess, onCancel }: { editId: string | null; onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    order: 0,
    enabled: true,
    discountType: "PERCENTAGE",
    discountValue: 0,
    originalPrice: 0,
    dealPrice: 0,
    startDate: "",
    endDate: "",
    autoStart: false,
    autoEnd: true,
    countdown: false,
    featured: false,
    flashSale: false,
    stockLimit: 0,
    image: "",
    bannerImage: "",
    backgroundColor: "#ffffff",
    gradient: "",
    buttonText: "Buy Now",
    buttonUrl: "",
    title: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    titleAr: "",
    titleFr: "",
    descriptionAr: "",
    descriptionFr: "",
    buttonTextAr: "",
    buttonTextFr: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editId ? `/api/admin/super-deals/${editId}` : "/api/admin/super-deals";
      const method = editId ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          organizationId: "default-org-id", // You'll need to get this from context
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editId ? "Super deal updated successfully" : "Super deal created successfully");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to save super deal");
      }
    } catch (error) {
      toast.error("Failed to save super deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Product *</label>
          <ProductSelector
            value={formData.productId}
            onChange={(value) => setFormData({ ...formData, productId: value })}
            filterPublished={false}
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Discount Type</label>
          <select
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
            <option value="BUY_ONE_GET_ONE">Buy One Get One</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-sm font-medium mb-2">Discount Value</label>
          <input
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            required
          />
        </div>

        {/* Original Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Original Price</label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Deal Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Deal Price</label>
          <input
            type="number"
            value={formData.dealPrice}
            onChange={(e) => setFormData({ ...formData, dealPrice: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Toggle Options */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Enabled</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.countdown}
              onChange={(e) => setFormData({ ...formData, countdown: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Countdown</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.flashSale}
              onChange={(e) => setFormData({ ...formData, flashSale: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Flash Sale</span>
          </label>
        </div>

        {/* Button Text */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Button Text</label>
          <input
            type="text"
            value={formData.buttonText}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Button URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Button URL</label>
          <input
            type="url"
            value={formData.buttonUrl}
            onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Image */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Deal Image</label>
          <ImageUpload
            value={formData.image}
            onChange={(value) => setFormData({ ...formData, image: value })}
            folder="super-deals"
          />
        </div>

        {/* Banner Image */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Banner Image</label>
          <ImageUpload
            value={formData.bannerImage}
            onChange={(value) => setFormData({ ...formData, bannerImage: value })}
            folder="super-deals-banners"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Background Color</label>
          <input
            type="color"
            value={formData.backgroundColor}
            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
            className="w-full h-10 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Gradient */}
        <div>
          <label className="block text-sm font-medium mb-2">Gradient</label>
          <input
            type="text"
            value={formData.gradient}
            onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
            placeholder="linear-gradient(to right, #color1, #color2)"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        {/* Stock Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">Stock Limit</label>
          <input
            type="number"
            value={formData.stockLimit}
            onChange={(e) => setFormData({ ...formData, stockLimit: parseInt(e.target.value) || 0 })}
            placeholder="Unlimited"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>
      </div>

      {/* Multi-language Section */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Multi-language Support
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Arabic Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title (Arabic)</label>
            <input
              type="text"
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              placeholder="العنوان بالعربية"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              dir="rtl"
            />
          </div>

          {/* French Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title (French)</label>
            <input
              type="text"
              value={formData.titleFr}
              onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
              placeholder="Titre en français"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          {/* Arabic Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description (Arabic)</label>
            <textarea
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder="الوصف بالعربية"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background min-h-[100px]"
              dir="rtl"
            />
          </div>

          {/* French Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description (French)</label>
            <textarea
              value={formData.descriptionFr}
              onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
              placeholder="Description en français"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background min-h-[100px]"
            />
          </div>

          {/* Arabic Button Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Button Text (Arabic)</label>
            <input
              type="text"
              value={formData.buttonTextAr}
              onChange={(e) => setFormData({ ...formData, buttonTextAr: e.target.value })}
              placeholder="شراء الآن"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              dir="rtl"
            />
          </div>

          {/* French Button Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Button Text (French)</label>
            <input
              type="text"
              value={formData.buttonTextFr}
              onChange={(e) => setFormData({ ...formData, buttonTextFr: e.target.value })}
              placeholder="Acheter maintenant"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          SEO & Open Graph
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SEO Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">SEO Title</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="Super Deal - Product Name"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          {/* SEO Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">SEO Description</label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              placeholder="Meta description for search engines"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background min-h-[100px]"
            />
          </div>

          {/* Open Graph Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Open Graph Image</label>
            <ImageUpload
              value={formData.ogImage}
              onChange={(value) => setFormData({ ...formData, ogImage: value })}
              folder="super-deals-og"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : editId ? "Update Deal" : "Create Deal"}
        </button>
      </div>
    </form>
  );
}
