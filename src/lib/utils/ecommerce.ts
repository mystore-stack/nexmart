// src/lib/utils/ecommerce.ts
// Utility functions for ecommerce operations

// Format price
export const formatPrice = (price: number, currency: string = 'MAD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Format product slug
export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
};

// Calculate average rating
export const calculateAverageRating = (reviews: Array<{ rating: number }>): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

// Generate product ID
export const generateProductId = (): string => {
  return `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate email
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone
export const validatePhone = (phone: string): boolean => {
  const regex = /^[\d\s\-\(\)\+]+$/;
  return regex.length >= 10 && regex.test(phone);
};

// Format date
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Calculate shipping time
export const calculateShippingDays = (baseDate: Date = new Date()): number => {
  const deliveryDate = new Date(baseDate);
  deliveryDate.setDate(deliveryDate.getDate() + 5); // 5-7 business days
  return Math.ceil((deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

// Generate order number
export const generateOrderNumber = (): string => {
  return `#${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.random().toString().substr(2, 8)}`;
};

// Calculate cart totals
export interface CartItem {
  id: string;
  price: number;
  quantity: number;
  tax?: number;
}

export const calculateCartTotals = (items: CartItem[], taxRate: number = 0.1) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    shipping,
    total,
  };
};

// Inventory helpers
export const getStockStatus = (stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (stock === 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
};

// Pagination
export const getPaginatedItems = <T,>(
  items: T[],
  page: number,
  itemsPerPage: number
): T[] => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

// Search filter
export const filterProducts = (
  products: any[],
  query: string,
  searchFields: string[] = ['name', 'description']
): any[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter((product) =>
    searchFields.some((field) =>
      String(product[field] || '').toLowerCase().includes(lowercaseQuery)
    )
  );
};

// Sort products
export const sortProducts = (
  products: any[],
  sortBy: string
): any[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'featured':
    default:
      return sorted;
  }
};

// Get related products
export const getRelatedProducts = (
  products: any[],
  currentProduct: any,
  limit: number = 4
): any[] => {
  return products
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        p.category === currentProduct.category
    )
    .slice(0, limit);
};
