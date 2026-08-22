"use client";

import { mapMysteryBoxToCartItem } from "@/lib/cart/cart.mapper";
import { addCartItem } from "@/lib/cart/cart.service";
import { useState } from "react";

interface BuyNowButtonProps {
  mysteryBox: any;
  isSoldOut: boolean;
}

export function BuyNowButton({ mysteryBox, isSoldOut }: BuyNowButtonProps) {
  const [adding, setAdding] = useState(false);

  const handleBuyNow = async () => {
    if (isSoldOut || adding) return;
    
    setAdding(true);
    try {
      // Map mystery box to unified cart item
      const cartItem = mapMysteryBoxToCartItem(mysteryBox, 1);
      
      // Add using unified cart service
      addCartItem(cartItem);
    } catch (error) {
      console.error('Failed to add mystery box to cart:', error);
      // Error is already handled by the cart service with toast
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="sticky bottom-4">
      <button
        onClick={handleBuyNow}
        disabled={isSoldOut || adding}
        className={`w-full px-8 py-4 font-semibold rounded-xl transition-all text-lg ${
          isSoldOut || adding
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg hover:scale-105"
        }`}
      >
        {adding ? "Adding..." : isSoldOut ? "Sold Out" : `Buy Now - ${(mysteryBox.price ?? 0).toFixed(2)} MAD`}
      </button>
      {!isSoldOut && !adding && (
        <p className="text-center text-sm text-muted-foreground mt-3">
          Secure payment • Fast delivery • Satisfaction guaranteed
        </p>
      )}
    </div>
  );
}
