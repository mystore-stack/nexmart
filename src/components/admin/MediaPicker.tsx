"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Trash2, Search, X, Check, Plus, RefreshCw } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  secureUrl?: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType: string;
  folder?: string;
  alt?: string;
  caption?: string;
  tags: string[];
  createdAt: string;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
  currentImage?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  folder?: string;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  allowUpload = true,
  allowDelete = true,
  folder = "media",
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, searchQuery]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("folder", folder);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/media?${params}`);
      const data = await response.json();
      if (data.success) {
        setMedia(data.media);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[MediaPicker] Upload started:", file.name, file.type, file.size);

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      console.log("[MediaPicker] Sending upload request to /api/admin/media/upload");
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      console.log("[MediaPicker] Upload response status:", response.status);
      const data = await response.json();
      console.log("[MediaPicker] Upload response data:", data);
      
      if (data.success) {
        toast.success("Media uploaded successfully");
        // Auto-refresh media library
        await fetchMedia();
        setShowUpload(false);
      } else {
        console.error("[MediaPicker] Upload failed:", data.error);
        // Show specific error message
        const errorMessage = data.error || "Upload failed";
        if (errorMessage.includes("Cloudinary")) {
          toast.error("Cloudinary error: " + errorMessage);
        } else if (errorMessage.includes("authentication") || errorMessage.includes("unauthorized")) {
          toast.error("Authentication failed. Please log in again.");
        } else if (errorMessage.includes("size")) {
          toast.error("File too large: " + errorMessage);
        } else if (errorMessage.includes("type")) {
          toast.error("Invalid file type: " + errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("[MediaPicker] Upload error:", error);
      console.error("[MediaPicker] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error(error instanceof Error ? error.message : "Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Media deleted");
        fetchMedia();
        if (selectedMedia?.id === id) setSelectedMedia(null);
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete media");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter" && selectedMedia) {
      handleSelect();
    }
  }, [selectedMedia, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background border border-border rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold">Media Library</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select an image or upload a new one
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {allowUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            )}
            <button
              onClick={fetchMedia}
              className="p-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading media...</div>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No media found</p>
                {allowUpload && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Upload Media
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {media.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedMedia?.id === item.id
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMedia(item)}
                  >
                    <div className="aspect-square bg-muted relative">
                      {item.mimeType.startsWith("image/") ? (
                        <Image
                          src={item.url}
                          alt={item.alt || item.originalName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}

                      {/* Selection Check */}
                      {selectedMedia?.id === item.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}

                      {/* Current Image Indicator */}
                      {currentImage === item.url && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/80 text-primary-foreground text-xs rounded">
                          Current
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <p className="text-sm truncate">{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {selectedMedia ? (
                <span>Selected: {selectedMedia.originalName}</span>
              ) : (
                <span>No image selected</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedMedia}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Select Image
              </button>
            </div>
          </div>

          {/* Upload Modal */}
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
                onClick={() => setShowUpload(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-background border border-border rounded-2xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Upload Media</h3>
                    <button
                      onClick={() => setShowUpload(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="mb-2">Drag and drop or click to upload</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PNG, JPG, WEBP, GIF, SVG up to 10MB
                    </p>
                    <input
                      type="file"
                      onChange={handleUpload}
                      disabled={uploading}
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Uploading..." : "Choose File"}
                    </label>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
