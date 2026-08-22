// src/lib/data-validation.ts — Data validation utilities for product data

import type { Product } from "@/types";

/**
 * Validates if a product object has all required fields
 */
export function isValidProduct(product: any): product is Product {
  if (!product || typeof product !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'slug', 'price'];
  for (const field of requiredFields) {
    if (!product[field]) return false;
  }
  
  return true;
}

/**
 * Sanitizes product data by adding defaults for missing fields
 */
export function sanitizeProduct(product: any): Product {
  if (!product) {
    throw new Error('Product is null or undefined');
  }
  
  return {
    id: product.id || '',
    name: product.name || 'Unknown Product',
    slug: product.slug || `product-${product.id || 'unknown'}`,
    description: product.description || '',
    price: Number(product.price) || 0,
    comparePrice: product.comparePrice != null ? Number(product.comparePrice) : undefined,
    cost: product.cost != null ? Number(product.cost) : undefined,
    category: product.category || { id: '', name: 'Uncategorized', slug: 'uncategorized' },
    categoryId: product.categoryId || '',
    images: Array.isArray(product.images) ? product.images : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    sku: product.sku || '',
    stock: Number(product.stock) || 0,
    lowStockAt: Number(product.lowStockAt) || 5,
    weight: product.weight != null ? Number(product.weight) : undefined,
    published: Boolean(product.published),
    featured: Boolean(product.featured),
    isVisible: Boolean(product.isVisible),
    displayOrder: Number(product.displayOrder) || 0,
    rating: Number(product.rating) || 0,
    reviewCount: Number(product.reviewCount) || 0,
    soldCount: Number(product.soldCount) || 0,
    variants: Array.isArray(product.variants) ? product.variants : [],
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

/**
 * Filters and sanitizes an array of products
 */
export function sanitizeProducts(products: any[]): Product[] {
  if (!Array.isArray(products)) return [];
  
  return products
    .filter(product => product && product.id)
    .map(product => sanitizeProduct(product));
}

/**
 * Validates image array and ensures it's not empty
 */
export function validateImages(images: any[]): string[] {
  if (!Array.isArray(images) || images.length === 0) {
    return ['/placeholder.jpg'];
  }
  
  const validImages = images.filter(img => {
    if (typeof img !== 'string') return false;
    if (!img.trim()) return false;
    if (img.startsWith('![')) return false; // Markdown image
    return true;
  });
  
  return validImages.length > 0 ? validImages : ['/placeholder.jpg'];
}
