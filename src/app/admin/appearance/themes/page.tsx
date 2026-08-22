"use client";

import React, { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';

import {
  Layout,
  Palette,
  Type,
  Layers,
  Settings,
  Eye,
  Copy,
  Trash2,
  Plus,
  Check,
  Sparkles,
  X,
  Save
} from "lucide-react";
import { defaultThemes } from "@/lib/themes/default-themes";
import { ThemeVersion } from "@/types/theme";

interface Theme {
  id: string;
  version: ThemeVersion;
  name: string;
  description?: string;
  isActive: boolean;
  previewImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/admin/themes");
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error("Authentication required for theme management");
          // Redirect to login if not authenticated
          window.location.href = "/login?from=/admin/appearance/themes";
          return;
        }
        if (res.status === 403) {
          console.error("Insufficient permissions for theme management");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error("Failed to fetch themes:", error);
    } finally {
      setLoading(false);
    }
  };

  const activateTheme = async (themeId: string) => {
    setActivating(themeId);
    try {
      const res = await fetch(`/api/admin/themes/${themeId}/activate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await fetchThemes();
      }
    } catch (error) {
      console.error("Failed to activate theme:", error);
    } finally {
      setActivating(null);
    }
  };

  const handlePreviewTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsPreviewing(true);
  };

  const deleteTheme = async (themeId: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return;
    
    try {
      const res = await fetch(`/api/admin/themes/${themeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await fetchThemes();
      }
    } catch (error) {
      console.error("Failed to delete theme:", error);
    }
  };

  const duplicateTheme = async (theme: Theme) => {
    try {
      const res = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: theme.version,
          name: `${theme.name} (Copy)`,
          description: theme.description,
          isActive: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchThemes();
      }
    } catch (error) {
      console.error("Failed to duplicate theme:", error);
    }
  };

  const exportTheme = async (theme: Theme) => {
    try {
      const res = await fetch(`/api/admin/themes/${theme.id}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${theme.name.replace(/\s+/g, "_")}_theme.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export theme:", error);
    }
  };

  const importTheme = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const res = await fetch("/api/admin/themes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      if (result.success) {
        await fetchThemes();
      } else {
        alert(result.error || "Failed to import theme");
      }
    } catch (error) {
      console.error("Failed to import theme:", error);
      alert("Failed to import theme. Please check the file format.");
    }
  };

  const createThemeFromVersion = async (version: ThemeVersion) => {
    const defaultTheme = defaultThemes[version];
    try {
      const res = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          name: defaultTheme.name,
          description: defaultTheme.description,
          isActive: false,
          config: defaultTheme,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchThemes();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create theme:", error);
    }
  };

  const getThemeIcon = (version: ThemeVersion) => {
    switch (version) {
      case "V1_CLASSIC":
        return <Layout className="w-5 h-5" />;
      case "V2_MODERN":
        return <Sparkles className="w-5 h-5" />;
      case "V3_PREMIUM":
        return <Palette className="w-5 h-5" />;
      case "V4_MINIMAL":
        return <Layers className="w-5 h-5" />;
      case "V5_LUXURY":
        return <Settings className="w-5 h-5" />;
    }
  };

  const getThemeColor = (version: ThemeVersion) => {
    switch (version) {
      case "V1_CLASSIC":
        return "bg-blue-500";
      case "V2_MODERN":
        return "bg-gray-900";
      case "V3_PREMIUM":
        return "bg-amber-500";
      case "V4_MINIMAL":
        return "bg-gray-400";
      case "V5_LUXURY":
        return "bg-yellow-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isPreviewing && (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-900 dark:text-amber-100">
              Mode prévisualisation activé
            </span>
          </div>
          <button
            onClick={() => setIsPreviewing(false)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Quitter la prévisualisation
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Themes</h1>
          <p className="text-muted-foreground">
            Manage your store's appearance with theme versions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="theme-import"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importTheme(file);
            }}
          />
          <button
            onClick={() => document.getElementById("theme-import")?.click()}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Theme
          </button>
        </div>
      </div>

      {/* Available Theme Versions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(defaultThemes).map(([version, theme]) => (
          <div
            key={version}
            className="border rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => createThemeFromVersion(version as ThemeVersion)}
          >
            <div className={`w-12 h-12 rounded-lg ${getThemeColor(version as ThemeVersion)} flex items-center justify-center text-white mb-3`}>
              {getThemeIcon(version as ThemeVersion)}
            </div>
            <h3 className="font-semibold">{theme.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {theme.description}
            </p>
          </div>
        ))}
      </div>

      {/* Installed Themes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Installed Themes</h2>
        {themes.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No themes installed</h3>
            <p className="text-muted-foreground mb-4">
              Create a theme from one of the available versions above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`border rounded-lg p-4 transition-all ${
                  theme.isActive ? "border-primary ring-2 ring-primary/20bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${getThemeColor(theme.version)} flex items-center justify-center text-white`}>
                    {getThemeIcon(theme.version)}
                  </div>
                  {theme.isActive && (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-semibold">{theme.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {theme.description}
                </p>
                <div className="flex items-center gap-2">
                  {!theme.isActive && (
                    <button
                      onClick={() => activateTheme(theme.id)}
                      disabled={activating === theme.id}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      {activating === theme.id ? "Activating..." : "Activate"}
                    </button>
                  )}
                  <button
                    onClick={() => handlePreviewTheme(theme)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportTheme(theme)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Export"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateTheme(theme)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {!theme.isActive && (
                    <button
                      onClick={() => deleteTheme(theme.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Theme</h2>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(defaultThemes).map(([version, theme]) => (
                <button
                  key={version}
                  onClick={() => createThemeFromVersion(version as ThemeVersion)}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${getThemeColor(version as ThemeVersion)} flex items-center justify-center text-white`}>
                    {getThemeIcon(version as ThemeVersion)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full mt-4 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
