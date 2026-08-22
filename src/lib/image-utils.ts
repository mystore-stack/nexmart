// src/lib/image-utils.ts — Image URL validation and utilities

/**
 * Validates if a string is a proper image URL
 * Returns false for markdown images, empty strings, or invalid URLs
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for markdown image syntax
  if (url.startsWith('![') || url.includes('](')) return false;
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Check for valid URL patterns
  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:', 'data:'];
    if (!validProtocols.includes(urlObj.protocol)) return false;
    
    return hasImageExtension || urlObj.protocol === 'data:';
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Returns a valid image URL or a fallback
 */
export function getValidImageUrl(url: string | null | undefined, fallback: string = '/placeholder.jpg'): string {
  return isValidImageUrl(url) ? url : fallback;
}

/**
 * Extracts image URLs from markdown text
 */
export function extractImagesFromMarkdown(text: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: string[] = [];
  let match;
  
  while ((match = imageRegex.exec(text)) !== null) {
    images.push(match[2]);
  }
  
  return images;
}

/**
 * Converts markdown image to direct URL if needed
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.jpg';
  
  // If it's markdown, extract the URL
  if (url.startsWith('![')) {
    const images = extractImagesFromMarkdown(url);
    if (images.length > 0) {
      return getValidImageUrl(images[0]);
    }
  }
  
  return getValidImageUrl(url);
}
