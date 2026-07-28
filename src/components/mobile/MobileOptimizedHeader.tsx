"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ShoppingCart, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";

interface MobileOptimizedHeaderProps {
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export function MobileOptimizedHeader({
  onSearchClick,
  onMenuClick,
}: MobileOptimizedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200"
      >
        <div className="flex items-center justify-between h-14 px-3 gap-2">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 font-bold text-base text-slate-900">
            NexStore
          </Link>

          {/* Search button */}
          <motion.button
            onClick={onSearchClick}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs"
          >
            <Search className="h-4 w-4" />
            <span>Rechercher</span>
          </motion.button>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Heart className="h-5 w-5 text-slate-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/m/cart"
              className="relative flex items-center justify-center h-10 w-10 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Menu */}
            <motion.button
              onClick={handleMenuToggle}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-slate-600" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-200 bg-white overflow-hidden"
            >
              <nav className="px-3 py-3 space-y-2">
                {[
                  { href: "/m", label: "Accueil" },
                  { href: "/m/deals", label: "Promotions" },
                  { href: "/m/categories", label: "Categories" },
                  { href: "/account", label: "Mon Compte" },
                  { href: "/orders", label: "Mes Commandes" },
                  { href: "/help", label: "Aide" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Header spacer */}
      <div className="h-14" />
    </>
  );
}
