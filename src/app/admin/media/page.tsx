"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Trash2, Search, Filter, X, Download, Copy, Check } from "lucide-react";
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

const CATEGORIES = ["hero", "product", "brand", "testimonial", "other"];

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [selectedCategory, searchQuery]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("folder", selectedCategory);
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

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", selectedCategory || "media");

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Media uploaded successfully");
        // Auto-refresh media library
        await fetchMedia();
        setShowUpload(false);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload media");
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
        if (previewMedia?.id === id) setPreviewMedia(null);
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete media");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMedia.size === 0) return;
    if (!confirm(`Delete ${selectedMedia.size} selected items?`)) return;

    try {
      await Promise.all(
        Array.from(selectedMedia).map(id =>
          fetch(`/api/admin/media?id=${id}`, { method: "DELETE" })
        )
      );
      toast.success(`${selectedMedia.size} items deleted`);
      setSelectedMedia(new Set());
      fetchMedia();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete items");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMedia(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedMedia.size === media.length) {
      setSelectedMedia(new Set());
    } else {
      setSelectedMedia(new Set(media.map(m => m.id)));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
        <p className="text-white/60">Manage your images, videos, and other media assets</p>
      </div>

      {/* Toolbar */}
      <div className="bg-surface/80 rounded-xl p-4 mb-6 border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-400/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold-400/50"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Upload Button */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg hover:bg-gold-400 transition-colors font-medium"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>

          {/* Bulk Delete */}
          {selectedMedia.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedMedia.size})
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white/40">Loading media...</div>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">No media found</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-gold-500 text-black rounded-lg hover:bg-gold-400 transition-colors"
          >
            Upload Media
          </button>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectedMedia.size === media.length && media.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-white/20 bg-black/30"
            />
            <span className="text-white/60 text-sm">Select all ({media.length} items)</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedMedia.has(item.id)
                    ? "border-gold-400"
                    : "border-transparent hover:border-white/20"
                }`}
                onClick={() => toggleSelection(item.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-black/50 relative">
                  {item.mimeType.startsWith("image/") ? (
                    <Image
                      src={item.url}
                      alt={item.alt || item.originalName}
                      fill
                      className="object-cover"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewMedia(item);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-white/20" />
                    </div>
                  )}

                  {/* Selection Check */}
                  {selectedMedia.has(item.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-gold-400 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewMedia(item);
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.url);
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Copy className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-surface/80">
                  <p className="text-white text-sm truncate">{item.originalName}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {formatFileSize(item.size)}
                    {item.width && item.height && ` • ${item.width}x${item.height}`}
                  </p>
                  {item.folder && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gold-500/20 text-gold-300 text-xs rounded">
                      {item.folder}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Media</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-gold-400/50 transition-colors">
                <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white mb-2">Drag and drop or click to upload</p>
                <p className="text-white/40 text-sm mb-4">Images, videos, documents</p>
                <input
                  type="file"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-gold-500 text-black rounded-lg cursor-pointer hover:bg-gold-400 transition-colors"
                >
                  Choose File
                </label>
              </div>

              {uploading && (
                <div className="mt-4 text-center text-white/60">
                  Uploading...
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setPreviewMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {previewMedia.mimeType.startsWith("image/") ? (
                <Image
                  src={previewMedia.url}
                  alt={previewMedia.alt || previewMedia.originalName}
                  width={previewMedia.width || 800}
                  height={previewMedia.height || 600}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-black/50 rounded-xl">
                  <ImageIcon className="h-24 w-24 text-white/20" />
                </div>
              )}

              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur rounded-lg p-4">
                <p className="text-white font-medium">{previewMedia.originalName}</p>
                <p className="text-white/60 text-sm mt-1">
                  {formatFileSize(previewMedia.size)}
                  {previewMedia.width && previewMedia.height && ` • ${previewMedia.width}x${previewMedia.height}`}
                </p>
                <button
                  onClick={() => copyToClipboard(previewMedia.url)}
                  className="mt-2 flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
