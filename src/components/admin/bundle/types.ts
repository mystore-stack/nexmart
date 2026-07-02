/**
 * Bundle Deals System Types
 * Strict TypeScript types for bundle deal management
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku?: string | null;
  published: boolean;
  featured: boolean;
  rating?: number | null;
  soldCount?: number | null;
  tags?: string[];
  image?: string | null;
  images?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleProduct {
  productId: string;
  order: number;
  product?: Product;
}

export interface BundleDeal {
  id: string;
  name: string;
  description?: string | null;
  bundlePrice: number;
  discountPercent: number;
  enabled: boolean;
  order: number;
  backgroundColor?: string | null;
  gradient?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  image?: string | null;
  products?: BundleProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleFormData {
  id?: string;
  name: string;
  description?: string;
  bundlePrice: number;
  discountPercent: number;
  enabled: boolean;
  order: number;
  backgroundColor?: string;
  gradient?: string;
  buttonText?: string;
  buttonUrl?: string;
  image?: string;
  productIds: string[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsSelected: (products: Product[]) => void;
  selectedProductIds: string[];
  maxSelections?: number;
}

export interface SelectedProductItem {
  productId: string;
  product: Product;
  order: number;
}

export interface BundlePriceCalculation {
  originalTotal: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}
