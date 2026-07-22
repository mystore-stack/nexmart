// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  label: string;
  price?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  cost?: number;
  category: Category;
  categoryId: string;
  images: string[];
  tags: string[];
  sku: string;
  stock: number;
  lowStockAt: number;
  weight?: number;
  published: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: Pick<User, "id" | "name" | "avatar">;
  rating: number;
  title?: string;
  body: string;
  images: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  address: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "STRIPE" | "CASH_ON_DELIVERY";
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon?: Coupon;
  stripePaymentId?: string;
  notes?: string;
  trackingNumber?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit: number;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "ORDER_UPDATE" | "PRICE_DROP" | "BACK_IN_STOCK" | "PROMO" | "SYSTEM";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter & Sort types
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  tags?: string[];
  search?: string;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
}

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular"
  | "relevance"
  | "discount";

// Analytics types
export interface AnalyticsSummary {
  revenue: { total: number; change: number };
  orders: { total: number; change: number };
  users: { total: number; change: number };
  products: { total: number; lowStock: number };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  soldCount: number;
  revenue: number;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: User["role"];
  iat: number;
  exp: number;
}

/** Authenticated user context (API routes, server actions) */
export type AuthSession = Pick<JwtPayload, "userId" | "email" | "role">;

// Cart store (Zustand)
export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  coupon: Coupon | null;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  syncWithServer: (userId: string) => Promise<void>;
}

// Wishlist store
export interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  syncWithServer: (userId: string) => Promise<void>;
}

// UI store
export interface UIStore {
  theme: "light" | "dark";
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  toggleTheme: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileMenu: () => void;
}

// ─── Deals, Bundles, MysteryBox ──────────────────────────────────────────────

/** Super Deal — time-limited product offer with stock tracking */
export interface Deal {
  id: string;
  productId: string;
  product: Product;
  discountPercentage: number;
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  stockLimit: number;
  stockRemaining: number;
  active: boolean;
  createdAt: string;
}

/** Bundle Deal — grouped products sold together at a discount */
export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  products: Product[];
  productIds: string[];
  totalPrice: number;    // Sum of individual prices
  bundlePrice: number;   // Discounted total
  discount: number;      // Amount saved
  discountPercentage: number;
  active: boolean;
  createdAt: string;
}

/** Mystery Box — surprise product bundle */
export interface MysteryBox {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  valueLabel: string; // e.g., "Worth up to 500 MAD"
  image?: string | null;
  possibleRewards: Product[];
  stock: number;
  active: boolean;
  createdAt: string;
}

// CMS & Admin Types
export type Deal = {
  id: string;
  productId: string;
  product?: Product;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  stockLimit: number;
  stockRemaining: number;
  active: boolean;
  createdAt: string;
};

export type Bundle = {
  id: string;
  name: string;
  slug: string;
  products: Product[];
  bundlePrice: number;
  totalPrice: number;
  discountPercentage: number;
};

export type MysteryBox = {
  id: string;
  name: string;
  stock: number;
  price: number;
  valueLabel: string;
  description: string;
  rewards: string[];
  rewardChance: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  user: { name: string; email: string };
  products: { productId: string; quantity: number; price: number }[];
  totalPrice: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type AdminIntent = {
  id: string;
  title: string;
  icon: string;
  description: string;
  linkedCategories: string[];
  suggestedProducts: string[];
  createdAt: string;
};

export type AdminReward = {
  id: string;
  name: string;
  probability: number;
};

export type AdminMysteryBox = {
  id: string;
  name: string;
  price: number;
  rewards: AdminReward[];
  stock: number;
  createdAt: string;
};
