// src/constants/ecommerce.ts
// Constants for ecommerce system

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Books',
  'Toys',
  'Automotive',
];

export const PRODUCT_SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'trending', label: 'Trending' },
];

export const PRODUCT_RATINGS = [
  { stars: 5, label: '5 Stars' },
  { stars: 4, label: '4 Stars & Up' },
  { stars: 3, label: '3 Stars & Up' },
  { stars: 2, label: '2 Stars & Up' },
  { stars: 1, label: '1 Star & Up' },
];

export const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 10,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 25,
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 50,
  },
];

export const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'CreditCard' },
  { id: 'paypal', name: 'PayPal', icon: 'PayPal' },
  { id: 'apple', name: 'Apple Pay', icon: 'Apple' },
  { id: 'google', name: 'Google Pay', icon: 'Google' },
  { id: 'bank', name: 'Bank Transfer', icon: 'Bank' },
];

export const ORDER_STATUS = [
  { id: 'pending', label: 'Pending', color: 'warning' },
  { id: 'confirmed', label: 'Confirmed', color: 'info' },
  { id: 'processing', label: 'Processing', color: 'info' },
  { id: 'shipped', label: 'Shipped', color: 'info' },
  { id: 'delivered', label: 'Delivered', color: 'success' },
  { id: 'cancelled', label: 'Cancelled', color: 'error' },
  { id: 'returned', label: 'Returned', color: 'warning' },
];

export const RETURN_REASON = [
  'Defective product',
  'Not as described',
  'Wrong item shipped',
  'Changed mind',
  'No longer needed',
  'Size/fit issue',
  'Better price found',
];

export const INVENTORY_STATUS = [
  { status: 'in-stock', label: 'In Stock', color: 'success' },
  { status: 'low-stock', label: 'Low Stock', color: 'warning' },
  { status: 'out-of-stock', label: 'Out of Stock', color: 'error' },
];

export const TAX_RATES = {
  default: 0.1, // 10%
  luxury: 0.15, // 15% for luxury items
  reduced: 0.05, // 5% for essentials
};

export const PAGES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/[id]',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/[id]',
  WISHLIST: '/wishlist',
  ACCOUNT: '/account',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  VENDOR: '/vendor',
};

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  PRODUCT: '/api/products/[id]',
  CART: '/api/cart',
  CHECKOUT: '/api/checkout',
  ORDERS: '/api/orders',
  ORDER: '/api/orders/[id]',
  USERS: '/api/users',
  AUTH: '/api/auth',
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE_REGEX: /^[\d\s\-\(\)\+]{10,}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const PROMOTIONAL_CODES = [
  { code: 'WELCOME10', discount: 0.1, description: '10% off for new users' },
  { code: 'SUMMER20', discount: 0.2, description: '20% off summer sale' },
  { code: 'FREESHIP', discount: 0, freeShipping: true, description: 'Free shipping' },
];

export const ANALYTICS_EVENTS = {
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_ADDED_TO_WISHLIST: 'product_added_to_wishlist',
  CART_VIEWED: 'cart_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  ORDER_COMPLETED: 'order_completed',
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
};

export const FEATURE_FLAGS = {
  AI_CHAT: true,
  VENDOR_PORTAL: true,
  AFFILIATE_PROGRAM: true,
  LIVE_CHAT: true,
  VIDEO_REVIEWS: false,
  VIRTUAL_TRY_ON: false,
};
