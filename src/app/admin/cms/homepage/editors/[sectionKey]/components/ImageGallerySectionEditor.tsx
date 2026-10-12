"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ImageGalleryEditor } from "@/components/admin/cms/image-gallery/ImageGalleryEditor";
import type { ImageGalleryConfig } from "@/lib/cms/schemas/image-gallery";
import { DEFAULT_IMAGE_GALLERY_CONFIG } from "@/lib/cms/schemas/image-gallery";

interface ImageGallerySectionEditorProps {
  section: any;
  parsedConfig: any;
}

export function ImageGallerySectionEditor({
  section,
  parsedConfig,
}: ImageGallerySectionEditorProps) {
  const router = useRouter();
  const config: ImageGalleryConfig = {
    ...DEFAULT_IMAGE_GALLERY_CONFIG,
    ...parsedConfig,
    settings: {
      ...DEFAULT_IMAGE_GALLERY_CONFIG.settings,
      ...parsedConfig.settings,
    },
  };

  const handleChange = (newConfig: ImageGalleryConfig) => {
    // Update local state (handled by parent form)
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/cms/homepage/${section.sectionKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      router.refresh();
      alert('Saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save');
    }
  };

  return (
    <ImageGalleryEditor
      config={config}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
