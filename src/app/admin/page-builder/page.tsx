"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, ArrowLeft, Layout,
  ToggleLeft, ToggleRight, X, Eye, BarChart3, Settings,
  Layers, Megaphone, Gift, Tag, Zap, Package, GripVertical, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { SECTION_DEFINITIONS } from "@/components/page-builder/library/section-library";

const PAGE_TYPE_CONFIG = {
  HOME: { label: "Home Page", icon: Layout },
  FLASH_DEALS: { label: "Flash Deals", icon: Zap },
  BUNDLE_DEALS: { label: "Bundle Deals", icon: Package },
  FREQUENTLY_BOUGHT_TOGETHER: { label: "Frequently Bought Together", icon: Layers },
  BUY_MORE_SAVE_MORE: { label: "Buy More Save More", icon: Tag },
  MYSTERY_BOX: { label: "Mystery Boxes", icon: Gift },
  BUILD_YOUR_OWN_BUNDLE: { label: "Build Your Own Bundle", icon: Layout },
};

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  PUBLISHED: { label: "Published", color: "bg-green-100 text-green-700" },
  ARCHIVED: { label: "Archived", color: "bg-red-100 text-red-700" },
};

export default function PageBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "sections" | "banners" | "seo" | "theme" | "analytics">("content");
  const [showSectionLibrary, setShowSectionLibrary] = useState(false);
  const [pageSections, setPageSections] = useState<any[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    pageType: "FLASH_DEALS",
    name: "",
    slug: "",
    status: "DRAFT",
    enabled: true,
    featured: false,
    publishDate: "",
    unpublishDate: "",
    displayOrder: 0,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    twitterImage: "",
    accentColor: "#0F766E",
    sectionBackground: "#ffffff",
    buttonStyle: "default",
    cardStyle: "default",
    borderRadius: "medium",
    shadow: "medium",
    gradient: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/page-builder/pages", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/page-builder/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, enabled }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update");

      setPages((prev) =>
        prev.map((page) => (page.id === id ? { ...page, enabled } : page))
      );
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const res = await fetch(`/api/admin/page-builder/pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setPages((prev) => prev.filter((page) => page.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleAdd = () => {
    setFormData({
      pageType: "FLASH_DEALS",
      name: "",
      slug: "",
      status: "DRAFT",
      enabled: true,
      featured: false,
      publishDate: "",
      unpublishDate: "",
      displayOrder: pages.length,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      canonicalUrl: "",
      ogImage: "",
      twitterImage: "",
      accentColor: "#0F766E",
      sectionBackground: "#ffffff",
      buttonStyle: "default",
      cardStyle: "default",
      borderRadius: "medium",
      shadow: "medium",
      gradient: "",
    });
    setEditingId(null);
    setShowForm(true);
    setActiveTab("content");
  };

  const handleEdit = (page: any) => {
    setFormData({
      ...page,
      publishDate: page.publishDate ? new Date(page.publishDate).toISOString().split('T')[0] : "",
      unpublishDate: page.unpublishDate ? new Date(page.unpublishDate).toISOString().split('T')[0] : "",
    });
    setEditingId(page.id);
    setCurrentPageId(page.id);
    setShowForm(true);
    setActiveTab("content");
    setPageSections(page.sections || []);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Page name is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/page-builder/pages/${editingId}`
        : "/api/admin/page-builder/pages";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success(editingId ? "Page updated" : "Page created");
      setShowForm(false);
      setEditingId(null);
      setCurrentPageId(null);
      setPageSections([]);
      fetchPages();
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSection = async (sectionId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/page-builder/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setPageSections(sections =>
          sections.map(s => s.id === sectionId ? { ...s, enabled } : s)
        );
        toast.success(enabled ? "Section enabled" : "Section disabled");
      }
    } catch (error) {
      toast.error("Failed to update section");
    }
  };

  const handleEditSection = (section: any) => {
    // TODO: Implement section edit modal
    (toast as any).info("Section editing coming soon");
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const response = await fetch(`/api/admin/page-builder/sections/${sectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPageSections(sections => sections.filter(s => s.id !== sectionId));
        toast.success("Section deleted");
      }
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  const handleAddSection = async (sectionType: string) => {
    if (!currentPageId) {
      toast.error("Please save the page first");
      return;
    }

    try {
      const sectionDef = SECTION_DEFINITIONS.find(s => s.id === sectionType);
      if (!sectionDef) {
        toast.error("Section definition not found");
        return;
      }

      const response = await fetch("/api/admin/page-builder/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: currentPageId,
          sectionType,
          config: sectionDef.defaultConfig,
          enabled: true,
          displayOrder: pageSections.length,
        }),
      });

      if (response.ok) {
        const newSection = await response.json();
        setPageSections([...pageSections, newSection]);
        setShowSectionLibrary(false);
        toast.success("Section added successfully");
      } else {
        toast.error("Failed to add section");
      }
    } catch (error) {
      toast.error("Failed to add section");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCurrentPageId(null);
    setPageSections([]);
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
          <h1 className="text-2xl font-bold">Page Builder</h1>
          <p className="text-muted-foreground">Build and customize marketing pages</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleAdd} className="btn-primary px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold">{editingId ? "Edit Page" : "Create Page"}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.name || "Untitled Page"}
                </p>
              </div>
              <button type="button" onClick={handleCancelForm} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: "content", label: "Content", icon: Layout },
                { id: "sections", label: "Sections", icon: Layers },
                { id: "banners", label: "Banners", icon: Megaphone },
                { id: "seo", label: "SEO", icon: Settings },
                { id: "theme", label: "Theme", icon: BarChart3 },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Page Type</label>
                      <select
                        value={formData.pageType}
                        onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                        disabled={!!editingId}
                      >
                        {Object.entries(PAGE_TYPE_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Publish Date</label>
                      <input
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unpublish Date</label>
                      <input
                        type="date"
                        value={formData.unpublishDate}
                        onChange={(e) => setFormData({ ...formData, unpublishDate: e.target.value })}
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
              )}

              {activeTab === "sections" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Page Sections</h3>
                    <div className="flex gap-2">
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/page-builder/${editingId}`)}
                          className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Sparkles className="w-4 h-4" />
                          Open Visual Builder
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowSectionLibrary(true)}
                        className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                    </div>
                  </div>

                  {pageSections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                      <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No sections added yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click "Add Section" to start building your page
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pageSections.map((section, index) => (
                        <div
                          key={section.id}
                          className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2 cursor-move">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{section.sectionType}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>Order: {section.displayOrder}</span>
                              <span className={section.enabled ? "text-green-600" : "text-red-600"}>
                                {section.enabled ? "Enabled" : "Disabled"}
                              </span>
                              {section.startDate && <span>From: {new Date(section.startDate).toLocaleDateString()}</span>}
                              {section.endDate && <span>To: {new Date(section.endDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSection(section.id, !section.enabled)}
                              className="p-2 hover:bg-background rounded-lg"
                              title={section.enabled ? "Disable" : "Enable"}
                            >
                              {section.enabled ? (
                                <ToggleRight className="w-5 h-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditSection(section)}
                              className="p-2 hover:bg-background rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/page-builder/${editingId}`)}
                              className="p-2 hover:bg-background rounded-lg text-primary"
                              title="Open Visual Builder"
                            >
                              <Sparkles className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(section.id)}
                              className="p-2 hover:bg-background rounded-lg text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "banners" && (
                <div className="text-center py-12">
                  <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Banner management coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save the page first to manage banners
                  </p>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Description</label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Keywords</label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                      placeholder="Comma separated keywords"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Canonical URL</label>
                    <input
                      type="text"
                      value={formData.canonicalUrl}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">OG Image</label>
                      <input
                        type="text"
                        value={formData.ogImage}
                        onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Twitter Image</label>
                      <input
                        type="text"
                        value={formData.twitterImage}
                        onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "theme" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="w-12 h-10 rounded-lg border border-border"
                        />
                        <input
                          type="text"
                          value={formData.accentColor}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="flex-1 px-4 py-2 rounded-lg border border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Background</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.sectionBackground}
                          onChange={(e) => setFormData({ ...formData, sectionBackground: e.target.value })}
                          className="w-12 h-10 rounded-lg border border-border"
                        />
                        <input
                          type="text"
                          value={formData.sectionBackground}
                          onChange={(e) => setFormData({ ...formData, sectionBackground: e.target.value })}
                          className="flex-1 px-4 py-2 rounded-lg border border-border"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Button Style</label>
                      <select
                        value={formData.buttonStyle}
                        onChange={(e) => setFormData({ ...formData, buttonStyle: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      >
                        <option value="default">Default</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Style</label>
                      <select
                        value={formData.cardStyle}
                        onChange={(e) => setFormData({ ...formData, cardStyle: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      >
                        <option value="default">Default</option>
                        <option value="minimal">Minimal</option>
                        <option value="elevated">Elevated</option>
                        <option value="bordered">Bordered</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Border Radius</label>
                      <select
                        value={formData.borderRadius}
                        onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="full">Full</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Shadow</label>
                      <select
                        value={formData.shadow}
                        onChange={(e) => setFormData({ ...formData, shadow: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border"
                      >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Gradient</label>
                    <input
                      type="text"
                      value={formData.gradient}
                      onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border"
                      placeholder="linear-gradient(to right, #color1, #color2)"
                    />
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Analytics coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save and publish the page first to view analytics
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <button type="button" onClick={handleCancelForm} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground">
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => {
          const config = PAGE_TYPE_CONFIG[page.pageType as keyof typeof PAGE_TYPE_CONFIG];
          const statusConfig = STATUS_CONFIG[page.status as keyof typeof STATUS_CONFIG];
          const Icon = config?.icon || Layout;

          return (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{page.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{page.slug}</p>
                </div>
                <button onClick={() => handleToggle(page.id, !page.enabled)} className="p-2 hover:bg-muted rounded-lg">
                  {page.enabled ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                {page.featured && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(page)} className="flex-1 btn-outline py-2 flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button onClick={() => router.push(`/admin/page-builder/${page.id}/preview`)} className="flex-1 btn-outline py-2 flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button onClick={() => handleDelete(page.id)} className="flex-1 btn-outline py-2 flex items-center justify-center gap-2 text-red-500">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No pages yet</p>
          <button onClick={handleAdd} className="btn-primary mt-4 px-4 py-2 flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Create First Page
          </button>
        </div>
      )}

      {/* Section Library Modal */}
      {showSectionLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-semibold">Add Section</h2>
              <button
                onClick={() => setShowSectionLibrary(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTION_DEFINITIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleAddSection(section.id)}
                    className="p-4 border border-border rounded-lg hover:border-primary hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <span className="text-2xl">{section.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{section.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {section.categories.map((category) => (
                            <span
                              key={category}
                              className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
