"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";

interface SuperDealActionsProps {
  superDeal: any;
  dealPrice: number;
  isExpired: boolean;
  isSoldOut: boolean;
}

export default function SuperDealActions({
  superDeal,
  dealPrice,
  isExpired,
  isSoldOut,
}: SuperDealActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (isExpired || isSoldOut) return;

    setIsAdding(true);
    try {
      addItem({
        type: "flash-deal",
        superDealId: superDeal.id,
        productId: superDeal.productId,
        quantity: 1,
        unitPrice: dealPrice,
        superDeal: {
          id: superDeal.id,
          title: superDeal.title || "Super Deal",
          dealPrice: dealPrice,
          discountType: superDeal.discountType,
          discountValue: superDeal.discountValue,
        },
        product: superDeal.product,
      } as any);
    } catch (error) {
      console.error("[SUPER_DEAL] Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isExpired || isSoldOut) return;

    setIsAdding(true);
    try {
      addItem({
        type: "flash-deal",
        superDealId: superDeal.id,
        productId: superDeal.productId,
        quantity: 1,
        unitPrice: dealPrice,
        superDeal: {
          id: superDeal.id,
          title: superDeal.title || "Super Deal",
          dealPrice: dealPrice,
          discountType: superDeal.discountType,
          discountValue: superDeal.discountValue,
        },
        product: superDeal.product,
      } as any);

      // Redirect to checkout
      window.location.href = "/checkout";
    } catch (error) {
      console.error("[SUPER_DEAL] Buy now error:", error);
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
        title: superDeal.title || "Super Deal",
        text: `Check out this amazing deal: ${superDeal.product?.name}`,
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
        disabled={isExpired || isSoldOut || isAdding}
        onClick={handleBuyNow}
        className={`w-full px-8 py-4 font-semibold rounded-xl transition-all text-lg ${
          isExpired || isSoldOut || isAdding
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:scale-105"
        }`}
      >
        {isAdding ? "Adding..." : isExpired ? "Deal Expired" : isSoldOut ? "Sold Out" : `Buy Now - ${dealPrice.toFixed(2)} MAD`}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={isExpired || isSoldOut || isAdding}
          onClick={handleAddToCart}
          className={`px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
            isExpired || isSoldOut || isAdding
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-surface border border-border hover:border-red-500 hover:text-red-600"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
        <button
          onClick={handleWishlist}
          className="px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 bg-surface border border-border hover:border-pink-500 hover:text-pink-600"
        >
          <Heart className="w-4 h-4" />
          Wishlist
        </button>
      </div>
      <button
        onClick={handleShare}
        className="w-full px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 bg-surface border border-border hover:border-blue-500 hover:text-blue-600"
      >
        <Share2 className="w-4 h-4" />
        Share Deal
      </button>
    </div>
  );
}
