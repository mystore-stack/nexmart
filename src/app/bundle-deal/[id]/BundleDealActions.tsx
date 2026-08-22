"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";

interface BundleDealActionsProps {
  bundleDeal: any;
  bundlePrice: number;
  isOutOfStock: boolean;
}

export default function BundleDealActions({
  bundleDeal,
  bundlePrice,
  isOutOfStock,
}: BundleDealActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addBundleDeal = useCartStore((state) => state.addBundleDeal);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      addBundleDeal(bundleDeal, 1);
    } catch (error) {
      console.error("[BUNDLE_DEAL] Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      addBundleDeal(bundleDeal, 1);

      // Redirect to checkout
      window.location.href = "/checkout";
    } catch (error) {
      console.error("[BUNDLE_DEAL] Buy now error:", error);
      toast.error("Failed to proceed to checkout");
      setIsAdding(false);
    }
  };

  const handleWishlist = () => {
    toast.success("Added to wishlist");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bundleDeal.name,
        text: `Check out this amazing bundle deal: ${bundleDeal.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="space-y-3">
      <button
        disabled={isOutOfStock || isAdding}
        onClick={handleBuyNow}
        className={`w-full px-8 py-4 font-semibold rounded-xl transition-all text-lg ${
          isOutOfStock || isAdding
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105"
        }`}
      >
        {isAdding ? "Adding..." : isOutOfStock ? "Out of Stock" : `Buy Bundle - ${bundlePrice.toFixed(2)} MAD`}
      </button>
      <button
        disabled={isOutOfStock || isAdding}
        onClick={handleAddToCart}
        className={`w-full px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
          isOutOfStock || isAdding
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-surface border border-border hover:border-purple-500 hover:text-purple-600"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        Add Bundle to Cart
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleWishlist}
          className="px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 bg-surface border border-border hover:border-pink-500 hover:text-pink-600"
        >
          <Heart className="w-4 h-4" />
          Wishlist
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 bg-surface border border-border hover:border-blue-500 hover:text-blue-600"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
