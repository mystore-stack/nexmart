"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Layers,
  Settings2,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
  ImageGalleryConfig,
  ImageGalleryItem,
} from "@/lib/cms/schemas/image-gallery";
import {
  DEFAULT_IMAGE_GALLERY_CONFIG,
  createGalleryItem,
} from "@/lib/cms/schemas/image-gallery";

interface ImageGalleryEditorProps {
  config: ImageGalleryConfig;
  onChange: (config: ImageGalleryConfig) => void;
  onSave?: () => Promise<void>;
}

export function ImageGalleryEditor({
  config,
  onChange,
  onSave,
}: ImageGalleryEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleAddImage = (imageUrl: string) => {
    const newImage = createGalleryItem(imageUrl, config.images.length);
    onChange({
      ...config,
      images: [...config.images, newImage],
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...config.images];
    [newImages[index], newImages[index - 1]] = [
      newImages[index - 1],
      newImages[index],
    ];
    onChange({ ...config, images: newImages });
  };

  const handleMoveDown = (index: number) => {
    if (index === config.images.length - 1) return;
    const newImages = [...config.images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    onChange({ ...config, images: newImages });
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave();
        toast.success("Saved successfully!");
      } catch (error) {
        toast.error("Failed to save");
        console.error(error);
      }
    }
  };

  const enabledImages = config.images.filter((img) => img.enabled);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offres de Moments</h2>
          <p className="text-muted-foreground">Image Gallery Editor</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              showPreview
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            {showPreview ? "Edit" : "Preview"}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save
          </button>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
        <div className="flex items-center gap-2">
          {config.enabled ? (
            <Eye className="w-5 h-5 text-emerald-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="font-semibold">
            {config.enabled ? "Section Enabled" : "Section Disabled"}
          </span>
        </div>
        <button
          onClick={() => onChange({ ...config, enabled: !config.enabled })}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {config.enabled ? "Disable" : "Enable"}
        </button>
      </div>

      {/* Layout Settings */}
      <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
        <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-purple-600" />
          Layout Settings
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] mb-1">Layout Type</label>
            <select
              value={config.layout}
              onChange={(e) =>
                onChange({ ...config, layout: e.target.value as any })
              }
              className="w-full text-xs p-2 rounded-lg bg-background border border-border"
            >
              <option value="grid">Grid</option>
              <option value="carousel">Horizontal Carousel</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] mb-1">Image Fit</label>
            <select
              value={config.settings.imageFit || "cover"}
              onChange={(e) =>
                onChange({
                  ...config,
                  settings: { ...config.settings, imageFit: e.target.value as any },
                })
              }
              className="w-full text-xs p-2 rounded-lg bg-background border border-border"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] mb-1">Spacing (px)</label>
            <input
              type="number"
              min="0"
              max="32"
              value={config.settings.spacing || 12}
              onChange={(e) =>
                onChange({
                  ...config,
                  settings: {
                    ...config.settings,
                    spacing: parseInt(e.target.value),
                  },
                })
              }
              className="w-full text-xs p-2 rounded-lg bg-background border border-border"
            />
          </div>

          <div>
            <label className="block text-[10px] mb-1">Border Radius (px)</label>
            <input
              type="number"
              min="0"
              max="32"
              value={config.settings.borderRadius || 12}
              onChange={(e) =>
                onChange({
                  ...config,
                  settings: {
                    ...config.settings,
                    borderRadius: parseInt(e.target.value),
                  },
                })
              }
              className="w-full text-xs p-2 rounded-lg bg-background border border-border"
            />
          </div>

          {config.layout === "carousel" && (
            <>
              <div>
                <label className="block text-[10px] mb-1">Visible Count</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={config.settings.visibleCount || 4}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      settings: {
                        ...config.settings,
                        visibleCount: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                />
              </div>

              <div>
                <label className="block text-[10px] mb-1">Auto Scroll</label>
                <select
                  value={config.settings.autoScroll ? "true" : "false"}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      settings: {
                        ...config.settings,
                        autoScroll: e.target.value === "true",
                      },
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg bg-background border border-border"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </>
          )}

          <div className="col-span-2">
            <label className="block text-[10px] mb-1">Section Background</label>
            <input
              type="color"
              value={config.settings.sectionBackground || "#FFFFFF"}
              onChange={(e) =>
                onChange({
                  ...config,
                  settings: {
                    ...config.settings,
                    sectionBackground: e.target.value,
                  },
                })
              }
              className="w-full h-8 rounded-lg cursor-pointer border-0"
            />
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
        <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          Add Images
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter image URL"
            className="flex-1 text-xs p-2 rounded-lg bg-background border border-border"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                handleAddImage(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  handleAddImage(url);
                }
              };
              input.click();
            }}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Upload
          </button>
        </div>
      </div>

      {/* Images List */}
      <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Images ({config.images.length})
          </label>
        </div>

        {config.images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No images added yet. Add images to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {config.images.map((image, index) => (
              <div
                key={image.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />

                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Image #{index + 1}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {image.enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === config.images.length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newImages = config.images.map((img) =>
                        img.id === image.id ? { ...img, enabled: !img.enabled } : img
                      );
                      onChange({ ...config, images: newImages });
                    }}
                    className={`p-1 rounded ${
                      image.enabled
                        ? "bg-emerald-500/20 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {image.enabled ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const newImages = config.images.filter((img) => img.id !== image.id);
                      onChange({ ...config, images: newImages });
                    }}
                    className="p-1 rounded bg-rose-500/20 text-rose-600 hover:bg-rose-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
          <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Preview
          </label>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: config.settings.sectionBackground || "#FFFFFF",
              padding: config.settings.spacing || 12,
            }}
          >
            {config.layout === "grid" ? (
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: config.settings.spacing || 12,
                }}
              >
                {enabledImages.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square rounded-lg overflow-hidden"
                    style={{
                      borderRadius: config.settings.borderRadius || 12,
                    }}
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        objectFit: config.settings.imageFit || "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {enabledImages
                  .slice(0, config.settings.visibleCount || 4)
                  .map((image) => (
                    <div
                      key={image.id}
                      className="flex-shrink-0 aspect-[4/3] rounded-lg overflow-hidden"
                      style={{
                        borderRadius: config.settings.borderRadius || 12,
                        width: "calc(100% / 4 - 12px)",
                      }}
                    >
                      <img
                        src={image.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          objectFit: config.settings.imageFit || "cover",
                        }}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
