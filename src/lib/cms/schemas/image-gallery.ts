// Image Gallery Schema for Offres de Moments
// Simple image-only promotional gallery

export interface ImageGalleryItem {
  id: string;
  imageUrl: string;
  order: number;
  enabled: boolean;
  altText?: string;
}

export interface ImageGalleryConfig {
  layout: 'grid' | 'carousel';
  images: ImageGalleryItem[];
  settings: {
    visibleCount?: number; // Number of images to show (for carousel)
    spacing?: number; // Spacing between images (px)
    imageFit?: 'contain' | 'cover' | 'auto';
    borderRadius?: number; // Border radius (px)
    sectionBackground?: string; // Section background color
    autoScroll?: boolean; // Auto-scroll for carousel
    autoScrollInterval?: number; // Auto-scroll interval (ms)
  };
  enabled: boolean;
}

export const DEFAULT_IMAGE_GALLERY_CONFIG: ImageGalleryConfig = {
  layout: 'grid',
  images: [],
  settings: {
    visibleCount: 4,
    spacing: 12,
    imageFit: 'cover',
    borderRadius: 12,
    sectionBackground: '#FFFFFF',
    autoScroll: false,
    autoScrollInterval: 3000,
  },
  enabled: true,
};

export function createGalleryItem(imageUrl: string, order: number): ImageGalleryItem {
  return {
    id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    imageUrl,
    order,
    enabled: true,
  };
}
