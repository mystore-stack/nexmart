"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, X, Upload, Link as LinkIcon, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import toast from "react-hot-toast";

const footerConfigSchema = z.object({
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string(),
  })),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  quickLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })),
  legalLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })),
  isActive: z.boolean().default(true),
});

type FooterConfigFormData = z.infer<typeof footerConfigSchema>;

const SOCIAL_PLATFORMS = [
  { name: "facebook", icon: "Facebook" },
  { name: "twitter", icon: "Twitter" },
  { name: "instagram", icon: "Instagram" },
  { name: "linkedin", icon: "Linkedin" },
];

const defaultValues: FooterConfigFormData = {
  logoUrl: "",
  description: "",
  socialLinks: [],
  contactInfo: { email: "", phone: "", address: "" },
  quickLinks: [],
  legalLinks: [],
  isActive: true,
};

export default function FooterCMSPage() {
  const [config, setConfig] = useState<FooterConfigFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FooterConfigFormData>({
    resolver: zodResolver(footerConfigSchema),
    defaultValues,
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/footer");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        reset(data.config);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setValue("logoUrl", data.url);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload logo");
    }
  };

  const handleSave = async (data: FooterConfigFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: config ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (responseData.success) {
        setConfig(responseData.config);
        toast.success("Footer configuration saved!");
      } else {
        toast.error(responseData.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    const current = watchedValues.socialLinks || [];
    setValue("socialLinks", [...current, { platform: "facebook", url: "", icon: "Facebook" }]);
  };

  const updateSocialLink = (index: number, field: string, value: any) => {
    const current = watchedValues.socialLinks || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("socialLinks", updated);
  };

  const removeSocialLink = (index: number) => {
    const current = watchedValues.socialLinks || [];
    setValue("socialLinks", current.filter((_, i) => i !== index));
  };

  const addQuickLink = () => {
    const current = watchedValues.quickLinks || [];
    setValue("quickLinks", [...current, { title: "", url: "" }]);
  };

  const updateQuickLink = (index: number, field: string, value: any) => {
    const current = watchedValues.quickLinks || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("quickLinks", updated);
  };

  const removeQuickLink = (index: number) => {
    const current = watchedValues.quickLinks || [];
    setValue("quickLinks", current.filter((_, i) => i !== index));
  };

  const addLegalLink = () => {
    const current = watchedValues.legalLinks || [];
    setValue("legalLinks", [...current, { title: "", url: "" }]);
  };

  const updateLegalLink = (index: number, field: string, value: any) => {
    const current = watchedValues.legalLinks || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("legalLinks", updated);
  };

  const removeLegalLink = (index: number) => {
    const current = watchedValues.legalLinks || [];
    setValue("legalLinks", current.filter((_, i) => i !== index));
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
          <h1 className="text-2xl font-bold">Footer Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage footer content and links</p>
        </div>
        <button
          onClick={handleSubmit(handleSave)}
          disabled={saving}
          className="btn-primary py-2 px-4"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        {/* Logo */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Logo</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-4">
            {watchedValues.logoUrl ? (
              <div className="relative w-32 h-32 mx-auto">
                <img src={watchedValues.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setValue("logoUrl", "")}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Upload logo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="btn-secondary py-2 px-4 cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <textarea
            {...register("description")}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            placeholder="Footer description..."
          />
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("contactInfo.email")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="contact@nexmart.ma"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("contactInfo.phone")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+212 600 000 000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("contactInfo.address")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Casablanca, Morocco"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Social Links</h2>
            <button
              type="button"
              onClick={addSocialLink}
              className="btn-secondary py-2 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </button>
          </div>
          <div className="space-y-3">
            {watchedValues.socialLinks?.map((link, index) => (
              <div key={index} className="flex gap-3">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.name} value={platform.name}>{platform.icon}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Links</h2>
            <button
              type="button"
              onClick={addQuickLink}
              className="btn-secondary py-2 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </button>
          </div>
          <div className="space-y-3">
            {watchedValues.quickLinks?.map((link, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateQuickLink(index, "title", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Link title"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateQuickLink(index, "url", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/path"
                />
                <button
                  type="button"
                  onClick={() => removeQuickLink(index)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Links */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Legal Links</h2>
            <button
              type="button"
              onClick={addLegalLink}
              className="btn-secondary py-2 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </button>
          </div>
          <div className="space-y-3">
            {watchedValues.legalLinks?.map((link, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateLegalLink(index, "title", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Link title"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLegalLink(index, "url", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/path"
                />
                <button
                  type="button"
                  onClick={() => removeLegalLink(index)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
