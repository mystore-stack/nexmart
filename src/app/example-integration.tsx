// src/app/example-integration.tsx
/**
 * Comprehensive Integration Example
 * Shows how to use all premium components together
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PremiumButton,
  GlassCard,
  GradientText,
  Badge,
  PremiumProductCard,
  PremiumHero,
  AIChat,
  DeliveryTracker,
  AdminDashboard,
  VendorDashboard,
  PremiumAuthCard,
  PremiumCheckout,
  MobileNav,
  BottomNav,
} from '@/components/premium';
import {
  containerVariants,
  itemVariants,
  slideInUpVariants,
} from '@/utils/animations';
import { useCart, useWishlist, usePagination } from '@/hooks/useEcommerce';
import { formatPrice, calculateDiscount } from '@/lib/utils/ecommerce';
import { PRODUCT_CATEGORIES } from '@/constants/ecommerce';

// ============================================================================
// EXAMPLE 1: Homepage with Hero and Product Grid
// ============================================================================
export const HomepageExample = () => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const mockProducts = [
    {
      id: '1',
      image: 'https://via.placeholder.com/400',
      name: 'Premium Wireless Headphones',
      price: 129.99,
      originalPrice: 199.99,
      rating: 4.5,
      reviews: 128,
      badge: { text: 'Hot Deal', variant: 'premium' as const },
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/400',
      name: 'Luxury Watch',
      price: 299.99,
      originalPrice: 399.99,
      rating: 4.8,
      reviews: 89,
      badge: { text: 'New', variant: 'info' as const },
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/400',
      name: 'Smartphone Case',
      price: 29.99,
      rating: 4.2,
      reviews: 245,
      badge: { text: 'Save 25%', variant: 'success' as const },
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <PremiumHero
        title="The Future of Shopping"
        subtitle="New Season"
        description="Discover millions of products at unbeatable prices"
        variant="primary"
        primaryCTA={{ text: 'Shop Now', href: '/products' }}
        secondaryCTA={{ text: "Today's Deals", href: '/deals' }}
      />

      {/* Products Section */}
      <section className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-4xl font-bold text-white mb-3">
              Featured <GradientText gradient="gold">Collections</GradientText>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Handpicked premium products selected just for you
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockProducts.map((product, idx) => (
              <motion.div key={product.id} variants={itemVariants}>
                <PremiumProductCard
                  {...product}
                  isFavorite={isInWishlist(product.id)}
                  onAddToCart={() => addToCart(product)}
                  onFavorite={() => addToWishlist(product.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* AI Chat */}
      <AIChat defaultOpen={false} />
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Product Page with Details
// ============================================================================
export const ProductPageExample = () => {
  const product = {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.5,
    reviews: 128,
    description: 'High-quality wireless headphones with noise cancellation',
    stock: 45,
    category: 'Electronics',
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Product Image */}
        <motion.div variants={itemVariants}>
          <GlassCard className="aspect-square bg-slate-700/50" />
        </motion.div>

        {/* Product Details */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div>
            <Badge label="In Stock" variant="success" />
            <h1 className="text-4xl font-bold text-white mt-4">{product.name}</h1>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GradientText gradient="gold" className="text-3xl font-bold">
                {formatPrice(product.price)}
              </GradientText>
              <span className="text-slate-500 line-through text-lg">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
            <Badge
              label={`Save ${calculateDiscount(product.originalPrice, product.price)}%`}
              variant="error"
            />
          </div>

          <p className="text-slate-300">{product.description}</p>

          <div className="flex gap-3">
            <PremiumButton size="lg" className="flex-1">
              Add to Cart
            </PremiumButton>
            <PremiumButton size="lg" variant="outline">
              Add to Wishlist
            </PremiumButton>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Cart Page
// ============================================================================
export const CartPageExample = () => {
  const { items, total, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <GlassCard key={item.id} variant="premium" className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-white">{formatPrice(item.price)}</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="w-12 px-2 py-1 rounded bg-slate-800 text-white text-center"
                      />
                    </div>
                  </div>
                  <PremiumButton
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </PremiumButton>
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="p-12 text-center">
              <p className="text-slate-400">Your cart is empty</p>
            </GlassCard>
          )}
        </div>

        {/* Summary */}
        <GlassCard variant="premium" className="p-6 h-fit">
          <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
          <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shipping</span>
              <span>{formatPrice(10)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Tax</span>
              <span>{formatPrice(total * 0.1)}</span>
            </div>
          </div>
          <div className="flex justify-between mb-6">
            <span className="font-bold text-white">Total</span>
            <span className="text-2xl font-bold text-amber-400">
              {formatPrice(total + 10 + total * 0.1)}
            </span>
          </div>
          <PremiumButton size="lg" className="w-full">
            Proceed to Checkout
          </PremiumButton>
        </GlassCard>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Admin Dashboard
// ============================================================================
export const AdminPageExample = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <AdminDashboard />
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Vendor Dashboard
// ============================================================================
export const VendorPageExample = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <VendorDashboard />
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Order Tracking
// ============================================================================
export const OrderTrackingExample = () => {
  const steps = [
    {
      id: '1',
      status: 'Order Confirmed',
      description: 'Your order has been received',
      completed: true,
      icon: null,
    },
    {
      id: '2',
      status: 'Processing',
      description: 'We are preparing your order',
      completed: true,
      icon: null,
    },
    {
      id: '3',
      status: 'Shipped',
      description: 'Your package is on the way',
      completed: false,
      icon: null,
    },
    {
      id: '4',
      status: 'Delivered',
      description: 'Package delivered',
      completed: false,
      icon: null,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <DeliveryTracker
        orderId="ORDER-2024-123456"
        estimatedDelivery={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
        steps={steps as any}
        currentStep={2}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 7: Authentication Pages
// ============================================================================
export const LoginPageExample = () => {
  return (
    <PremiumAuthCard
      type="login"
      onSubmit={(data) => console.log('Login:', data)}
    />
  );
};

export const RegisterPageExample = () => {
  return (
    <PremiumAuthCard
      type="register"
      onSubmit={(data) => console.log('Register:', data)}
    />
  );
};

// ============================================================================
// EXAMPLE 8: Checkout Flow
// ============================================================================
export const CheckoutPageExample = () => {
  const mockCartItems = [
    {
      id: '1',
      name: 'Premium Headphones',
      price: 129.99,
      quantity: 1,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '2',
      name: 'Phone Case',
      price: 29.99,
      quantity: 2,
      image: 'https://via.placeholder.com/100',
    },
  ];

  return (
    <PremiumCheckout
      items={mockCartItems}
      onComplete={() => console.log('Order completed')}
    />
  );
};
