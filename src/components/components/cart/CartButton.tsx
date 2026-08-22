/**
 * CartButton Component
 * Reusable "Add to Cart" button that uses the unified cart service
 */

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { CartItem } from "@/lib/cart/cart.types";
import { addCartItem } from "@/lib/cart/cart.service";

interface CartButtonProps {
  item: CartItem;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  showPrice?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function CartButton({
  item,
  disabled = false,
  className = "",
  children,
  variant = "primary",
  size = "md",
  showPrice = true,
  onSuccess,
  onError,
}: CartButtonProps) {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || adding) return;

    setAdding(true);

    try {
      // Add item using unified cart service
      addCartItem(item);

      // Show success toast
      toast.success(`${item.title} added to cart`, {
        icon: "🛒",
        duration: 2000,
      });

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      console.error("[CART BUTTON] Error adding item to cart:", error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);

      // Call error callback if provided
      if (error instanceof Error) {
        onError?.(error);
      }
    } finally {
      setAdding(false);
    }
  };

  // Base styles
  const baseStyles = "font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed";

  // Variant styles
  const variantStyles = {
    primary: "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg hover:scale-105",
    secondary: "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg",
    outline: "border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  // Disabled styles
  const disabledStyles = disabled || adding
    ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:scale-100 hover:shadow-none"
    : variantStyles[variant];

  const buttonStyles = `${baseStyles} ${disabledStyles} ${sizeStyles[size]} ${className}`;

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || adding}
      className={buttonStyles}
    >
      {adding ? (
        "Adding..."
      ) : children ? (
        children
      ) : (
        <>
          {showPrice && `Add - ${item.price.toFixed(2)} MAD`}
          {!showPrice && "Add to Cart"}
        </>
      )}
    </button>
  );
}
