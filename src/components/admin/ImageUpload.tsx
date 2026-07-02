"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { MediaPicker } from "./MediaPicker";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  width?: number;
  height?: number;
  aspectRatio?: "square" | "landscape" | "portrait" | "free";
  maxSizeMB?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "media",
  width,
  height,
  aspectRatio = "free",
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleMediaSelect = useCallback(
    (media: any) => {
      setPreview(media.url);
      onChange(media.url);
      toast.success("Image selected successfully");
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onChange("");
  }, [onChange]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "landscape":
        return "aspect-video";
      case "portrait":
        return "aspect-[3/4]";
      default:
        return "aspect-video";
    }
  };

  return (
    <div className="w-full">
      {preview ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className={`relative ${getAspectRatioClass()} w-full`}>
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              {!disabled && (
                <>
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    onClick={handleRemove}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-0">
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              disabled={disabled}
              className={`w-full flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-muted/50 transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Click to select from Media Library
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, WEBP, GIF, SVG up to {maxSizeMB}MB
              </p>
            </button>
          </CardContent>
        </Card>
      )}

      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        currentImage={preview || undefined}
        folder={folder}
        allowUpload={true}
        allowDelete={true}
      />
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  width?: number;
  height?: number;
  aspectRatio?: "square" | "landscape" | "portrait" | "free";
  maxSizeMB?: number;
  maxImages?: number;
  disabled?: boolean;
}

export function MultiImageUpload({
  values,
  onChange,
  folder = "general",
  width,
  height,
  aspectRatio = "square",
  maxSizeMB = 5,
  maxImages = 10,
  disabled = false,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (values.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        if (width) formData.append("width", width.toString());
        if (height) formData.append("height", height.toString());

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Upload failed");
        }

        const imageUrl = data.url;
        onChange([...values, imageUrl]);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [folder, width, height, onChange, maxSizeMB, maxImages, values]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newValues = values.filter((_, i) => i !== index);
      onChange(newValues);
    },
    [values, onChange]
  );

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "landscape":
        return "aspect-video";
      case "portrait":
        return "aspect-[3/4]";
      default:
        return "aspect-video";
    }
  };

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        id="multi-image-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading || values.length >= maxImages}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {values.map((url, index) => (
          <Card key={index} className="overflow-hidden relative">
            <CardContent className="p-0">
              <div className={`relative ${getAspectRatioClass()} w-full`}>
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {!disabled && (
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {values.length < maxImages && (
          <Card className="border-dashed border-2">
            <CardContent className="p-0">
              <label
                htmlFor="multi-image-upload"
                className={`flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50 transition-colors ${getAspectRatioClass()} ${
                  disabled || uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </label>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {values.length} / {maxImages} images
      </p>
    </div>
  );
}
