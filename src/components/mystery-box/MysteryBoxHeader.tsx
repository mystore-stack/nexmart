"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

interface MysteryBoxHeaderProps {
  onSearchClick?: () => void;
}

export function MysteryBoxHeader({ onSearchClick }: MysteryBoxHeaderProps) {
  const cartCount = useCartStore((s) =>
    s.items.reduce((total, item) => total + item.quantity, 0)
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-100"
    >
      <div className="flex items-center justify-between px-4 py-3.5">
        {/* Back Button */}
        <Link href="/m">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </motion.button>
        </Link>

        {/* Title */}
        <div className="flex-1 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className="text-base font-bold text-neutral-900">Mystery Box</h1>
            <p className="text-xs text-neutral-500">Premium Surprises</p>
          </motion.div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchClick}
            className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-neutral-700" />
          </motion.button>

          <Link href="/m/cart">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-neutral-50 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-neutral-700" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
