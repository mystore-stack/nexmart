"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Check, Image as ImageIcon, Upload, Eye, EyeOff, Monitor, Smartphone, Copy, ArrowUp, ArrowDown, Video, Calendar, Palette } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalAbsoluteUrl = (message: string) =>
  z.preprocess(emptyToUndefined, z.string().url(message).optional());

const optionalNullableAbsoluteUrl = (message: string) =>
  z.preprocess(emptyToUndefined, z.string().url(message).optional().nullable());

const optionalHeroLink = (message: string) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => {
        if (value.startsWith("/") && !value.startsWith("//")) return true;

        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      }, message)
      .optional()
  );

const heroBannerSchema = z.object({
  badgeText: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  highlightedText: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  desktopImageUrl: optionalAbsoluteUrl("Invalid desktop image URL"),
  mobileImageUrl: optionalNullableAbsoluteUrl("Invalid mobile image URL"),
  videoUrl: optionalAbsoluteUrl("Invalid video URL"),
  primaryButtonText: z.string().optional(),
  primaryButtonLink: optionalHeroLink("Invalid primary button link"),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: optionalHeroLink("Invalid secondary button link"),
  backgroundColor: z.string().optional(),
  backgroundOverlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).default(0.5),
  textColor: z.string().optional(),
  primaryButtonColor: z.string().optional(),
  secondaryButtonColor: z.string().optional(),
  heroHeight: z.string().default("90vh"),
  heroPosition: z.string().default("center"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  publishDate: z.string().optional(),
  expireDate: z.string().optional(),
});

type HeroBannerFormData = z.infer<typeof heroBannerSchema>;

interface HeroBanner {
  id: string;
  badgeText?: string;
  title: string;
  highlightedText?: string;
  subtitle?: string;
  description?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  backgroundOverlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  heroHeight?: string;
  heroPosition?: string;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
  isActive: boolean;
  publishDate?: string;
  expireDate?: string;
  impressions?: number;
  primaryButtonClicks?: number;
  secondaryButtonClicks?: number;
  createdAt: string;
  updatedAt: string;
}

const defaultValues: HeroBannerFormData = {
  badgeText: "",
  title: "",
  highlightedText: "",
  subtitle: "",
  description: "",
  desktopImageUrl: "",
  mobileImageUrl: "",
  videoUrl: "",
  primaryButtonText: "",
  primaryButtonLink: "",
  secondaryButtonText: "",
  secondaryButtonLink: "",
  backgroundColor: "",
  backgroundOverlayColor: "",
  overlayOpacity: 0.5,
  textColor: "",
  primaryButtonColor: "",
  secondaryButtonColor: "",
  heroHeight: "90vh",
  heroPosition: "center",
  seoTitle: "",
  seoDescription: "",
  displayOrder: 0,
  isActive: true,
  publishDate: "",
  expireDate: "",
};

export default function AdminHeroPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HeroBannerFormData>({
    resolver: zodResolver(heroBannerSchema),
    defaultValues,
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/hero", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, field: 'desktopImageUrl' | 'mobileImageUrl') => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setValue(field, data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleSave = async (data: HeroBannerFormData) => {
    setSaving(true);
    try {
      const url = editId ? `/api/admin/hero/${editId}` : "/api/admin/hero";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (responseData.success) {
        if (editId) {
          setBanners((prev) => prev.map((b) => b.id === editId ? responseData.banner : b));
          toast.success("Banner updated!");
        } else {
          setBanners((prev) => [...prev, responseData.banner]);
          toast.success("Banner created!");
        }
        setShowForm(false);
        setShowPreview(false);
        reset(defaultValues);
        setEditId(null);
      } else {
        toast.error(responseData.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/hero/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        toast.success("Banner deleted");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const duplicateBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/hero/${id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => [...prev, data.banner]);
        toast.success("Banner duplicated");
      } else {
        toast.error(data.error || "Failed to duplicate");
      }
    } catch (error) {
      toast.error("Failed to duplicate banner");
    }
  };

  const reorderBanner = async (id: string, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((b) => b.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const newBanners = [...banners];
    const [movedBanner] = newBanners.splice(currentIndex, 1);
    newBanners.splice(newIndex, 0, movedBanner);

    // Update display orders
    const updates = newBanners.map((banner, index) => ({
      id: banner.id,
      displayOrder: index,
    }));

    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/hero/${update.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ displayOrder: update.displayOrder }),
          })
        )
      );
      setBanners(newBanners);
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/hero/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.map((b) => b.id === id ? data.banner : b));
        toast.success(isActive ? "Banner deactivated" : "Banner activated");
      }
    } catch (error) {
      toast.error("Failed to update banner");
    }
  };

  const editBanner = (banner: HeroBanner) => {
    reset({
      badgeText: banner.badgeText || "",
      title: banner.title,
      highlightedText: banner.highlightedText || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      desktopImageUrl: banner.desktopImageUrl || "",
      mobileImageUrl: banner.mobileImageUrl || "",
      videoUrl: banner.videoUrl || "",
      primaryButtonText: banner.primaryButtonText || "",
      primaryButtonLink: banner.primaryButtonLink || "",
      secondaryButtonText: banner.secondaryButtonText || "",
      secondaryButtonLink: banner.secondaryButtonLink || "",
      backgroundColor: banner.backgroundColor || "",
      backgroundOverlayColor: banner.backgroundOverlayColor || "",
      overlayOpacity: banner.overlayOpacity || 0.5,
      textColor: banner.textColor || "",
      primaryButtonColor: banner.primaryButtonColor || "",
      secondaryButtonColor: banner.secondaryButtonColor || "",
      heroHeight: banner.heroHeight || "90vh",
      heroPosition: banner.heroPosition || "center",
      seoTitle: banner.seoTitle || "",
      seoDescription: banner.seoDescription || "",
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive,
      publishDate: banner.publishDate || "",
      expireDate: banner.expireDate || "",
    });
    setEditId(banner.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hero Banners</h1>
          <p className="text-muted-foreground text-sm mt-1">{banners.length} banners</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            reset(defaultValues);
            setShowPreview(false);
          }}
          className="btn-primary py-2.5 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="aspect-video relative">
              <Image
                src={banner.desktopImageUrl || "/placeholder-hero.jpg"}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => toggleActive(banner.id, banner.isActive)}
                  className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                    banner.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                  title={banner.isActive ? "Active" : "Inactive"}
                >
                  {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold truncate">{banner.title}</h3>
                  {banner.badgeText && (
                    <p className="text-sm text-muted-foreground truncate">{banner.badgeText}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Order: {banner.displayOrder}</p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    onClick={() => reorderBanner(banner.id, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => reorderBanner(banner.id, "down")}
                    disabled={index === banners.length - 1}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Analytics Stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="text-sm font-semibold">{banner.impressions || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Primary</p>
                  <p className="text-sm font-semibold">{banner.primaryButtonClicks || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Secondary</p>
                  <p className="text-sm font-semibold">{banner.secondaryButtonClicks || 0}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => editBanner(banner)}
                  className="flex-1 btn-secondary py-2 text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => duplicateBanner(banner.id)}
                  className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {banner.isActive && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                Active
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !saving && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">{editId ? "Edit Banner" : "New Banner"}</h2>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-secondary py-1.5 px-3 text-sm"
                  >
                    {showPreview ? "Hide Preview" : "Live Preview"}
                  </button>
                </div>
                <button
                  onClick={() => !saving && setShowForm(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Form */}
                <div className="flex-1 space-y-4">
                {/* Desktop Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Desktop Image</label>
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload(file, 'desktopImageUrl');
                      }
                    }}
                  >
                    {watchedValues.desktopImageUrl ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image src={watchedValues.desktopImageUrl} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setValue('desktopImageUrl', '')}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Monitor className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Drop image or click to upload</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'desktopImageUrl')}
                          className="hidden"
                          id="desktop-image"
                        />
                        <label
                          htmlFor="desktop-image"
                          className="btn-secondary py-2 px-4 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Desktop Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Image (Optional)</label>
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload(file, 'mobileImageUrl');
                      }
                    }}
                  >
                    {watchedValues.mobileImageUrl ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image src={watchedValues.mobileImageUrl} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setValue('mobileImageUrl', null)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Smartphone className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Drop image or click to upload</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'mobileImageUrl')}
                          className="hidden"
                          id="mobile-image"
                        />
                        <label
                          htmlFor="mobile-image"
                          className="btn-secondary py-2 px-4 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Mobile Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL (Optional)</label>
                  <input
                    {...register('videoUrl')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., https://youtube.com/watch?v=..."
                  />
                  {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message}</p>}
                </div>

                {/* Badge Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Badge Text (Optional)</label>
                  <input
                    {...register('badgeText')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., ÉLECTRONIQUE • CURATED"
                  />
                  {errors.badgeText && <p className="text-red-500 text-sm mt-1">{errors.badgeText.message}</p>}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    {...register('title')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Équipez-vous avec"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                {/* Highlighted Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Highlighted Text (Optional)</label>
                  <input
                    {...register('highlightedText')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., le meilleur."
                  />
                  {errors.highlightedText && <p className="text-red-500 text-sm mt-1">{errors.highlightedText.message}</p>}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle (Optional)</label>
                  <input
                    {...register('subtitle')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Additional subtitle text"
                  />
                  {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Banner description..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                {/* Primary Button Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Button Text (Optional)</label>
                  <input
                    {...register('primaryButtonText')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Découvrir la tech"
                  />
                  {errors.primaryButtonText && <p className="text-red-500 text-sm mt-1">{errors.primaryButtonText.message}</p>}
                </div>

                {/* Primary Button Link */}
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Button Link (Optional)</label>
                  <input
                    {...register('primaryButtonLink')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., /products?category=electronics"
                  />
                  {errors.primaryButtonLink && <p className="text-red-500 text-sm mt-1">{errors.primaryButtonLink.message}</p>}
                </div>

                {/* Secondary Button Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Button Text (Optional)</label>
                  <input
                    {...register('secondaryButtonText')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Meilleures ventes"
                  />
                  {errors.secondaryButtonText && <p className="text-red-500 text-sm mt-1">{errors.secondaryButtonText.message}</p>}
                </div>

                {/* Secondary Button Link */}
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Button Link (Optional)</label>
                  <input
                    {...register('secondaryButtonLink')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., /products?sort=bestselling"
                  />
                  {errors.secondaryButtonLink && <p className="text-red-500 text-sm mt-1">{errors.secondaryButtonLink.message}</p>}
                </div>

                {/* Background Overlay Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Background Overlay Color (Optional)</label>
                  <input
                    {...register('backgroundOverlayColor')}
                    type="color"
                    className="w-full h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.backgroundOverlayColor && <p className="text-red-500 text-sm mt-1">{errors.backgroundOverlayColor.message}</p>}
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color (Optional)</label>
                  <input
                    {...register('backgroundColor')}
                    type="color"
                    className="w-full h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.backgroundColor && <p className="text-red-500 text-sm mt-1">{errors.backgroundColor.message}</p>}
                </div>

                {/* Overlay Opacity */}
                <div>
                  <label className="block text-sm font-medium mb-2">Overlay Opacity: {watchedValues.overlayOpacity}</label>
                  <input
                    {...register('overlayOpacity', { valueAsNumber: true })}
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full"
                  />
                  {errors.overlayOpacity && <p className="text-red-500 text-sm mt-1">{errors.overlayOpacity.message}</p>}
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color (Optional)</label>
                  <input
                    {...register('textColor')}
                    type="color"
                    className="w-full h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.textColor && <p className="text-red-500 text-sm mt-1">{errors.textColor.message}</p>}
                </div>

                {/* Primary Button Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Button Color (Optional)</label>
                  <input
                    {...register('primaryButtonColor')}
                    type="color"
                    className="w-full h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.primaryButtonColor && <p className="text-red-500 text-sm mt-1">{errors.primaryButtonColor.message}</p>}
                </div>

                {/* Secondary Button Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Button Color (Optional)</label>
                  <input
                    {...register('secondaryButtonColor')}
                    type="color"
                    className="w-full h-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.secondaryButtonColor && <p className="text-red-500 text-sm mt-1">{errors.secondaryButtonColor.message}</p>}
                </div>

                {/* Hero Height */}
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Height</label>
                  <select
                    {...register('heroHeight')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="70vh">70vh</option>
                    <option value="80vh">80vh</option>
                    <option value="90vh">90vh</option>
                    <option value="100vh">100vh</option>
                    <option value="600px">600px</option>
                    <option value="700px">700px</option>
                    <option value="800px">800px</option>
                  </select>
                  {errors.heroHeight && <p className="text-red-500 text-sm mt-1">{errors.heroHeight.message}</p>}
                </div>

                {/* Hero Position */}
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Position</label>
                  <select
                    {...register('heroPosition')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                  {errors.heroPosition && <p className="text-red-500 text-sm mt-1">{errors.heroPosition.message}</p>}
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <input
                    {...register('displayOrder', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                  {errors.displayOrder && <p className="text-red-500 text-sm mt-1">{errors.displayOrder.message}</p>}
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Publish Date (Optional)</label>
                  <input
                    {...register('publishDate')}
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.publishDate && <p className="text-red-500 text-sm mt-1">{errors.publishDate.message}</p>}
                </div>

                {/* Expire Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Expire Date (Optional)</label>
                  <input
                    {...register('expireDate')}
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.expireDate && <p className="text-red-500 text-sm mt-1">{errors.expireDate.message}</p>}
                </div>

                {/* SEO Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Title (Optional)</label>
                  <input
                    {...register('seoTitle')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="SEO title for search engines"
                  />
                  {errors.seoTitle && <p className="text-red-500 text-sm mt-1">{errors.seoTitle.message}</p>}
                </div>

                {/* SEO Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Description (Optional)</label>
                  <textarea
                    {...register('seoDescription')}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    placeholder="SEO description for search engines"
                  />
                  {errors.seoDescription && <p className="text-red-500 text-sm mt-1">{errors.seoDescription.message}</p>}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </label>
                </div>
                </div>

                {/* Live Preview */}
                {showPreview && (
                  <div className="w-full lg:w-[400px] bg-slate-900 rounded-xl overflow-hidden">
                    <div className="p-3 bg-slate-800 text-white text-sm font-medium border-b border-slate-700">
                      Live Preview
                    </div>
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-[#0a192f] via-[#020c1b] to-[#000000]">
                      {watchedValues.desktopImageUrl && (
                        <Image
                          src={watchedValues.desktopImageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      )}
                      {watchedValues.backgroundOverlayColor && (
                        <div 
                          className="absolute inset-0"
                          style={{ backgroundColor: watchedValues.backgroundOverlayColor + '80' }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="text-center">
                          {watchedValues.badgeText && (
                            <div className="inline-block mb-4 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider">
                              {watchedValues.badgeText}
                            </div>
                          )}
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {watchedValues.title}
                          </h2>
                          {watchedValues.highlightedText && (
                            <p className="text-xl text-amber-400 mb-2">
                              {watchedValues.highlightedText}
                            </p>
                          )}
                          {watchedValues.description && (
                            <p className="text-white/70 text-sm mb-4">
                              {watchedValues.description}
                            </p>
                          )}
                          <div className="flex gap-2 justify-center">
                            {watchedValues.primaryButtonText && (
                              <button className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">
                                {watchedValues.primaryButtonText}
                              </button>
                            )}
                            {watchedValues.secondaryButtonText && (
                              <button className="px-4 py-2 border border-white/30 text-white rounded-lg text-sm">
                                {watchedValues.secondaryButtonText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => !saving && setShowForm(false)}
                  className="btn-secondary py-2 px-4"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(handleSave)}
                  disabled={saving}
                  className="btn-primary py-2 px-4"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editId ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
