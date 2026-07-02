"use client";

import React from "react";
import { Package, Search, Heart, ShoppingCart, FileText, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "products" | "search" | "wishlist" | "cart" | "orders" | "default" | "error";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const defaultIcon = {
    products: <Package className="w-16 h-16" />,
    search: <Search className="w-16 h-16" />,
    wishlist: <Heart className="w-16 h-16" />,
    cart: <ShoppingCart className="w-16 h-16" />,
    orders: <FileText className="w-16 h-16" />,
    error: <AlertCircle className="w-16 h-16" />,
    default: <Package className="w-16 h-16" />,
  }[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-muted-foreground mb-6">
        {icon || defaultIcon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors min-w-[200px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export const EmptyProducts = ({ onClearFilters }: { onClearFilters?: () => void } ) => (
  <EmptyState
    variant="products"
    title="No products found"
    description="Try adjusting your filters or search for something else."
    action={onClearFilters ? { label: "Clear filters", onClick: onClearFilters } : undefined}
  />
);

export const EmptySearch = ({ onReset }: { onReset?: () => void }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description="We couldn't find any products matching your search."
    action={onReset ? { label: "Clear search", onClick: onReset } : undefined}
  />
);

export const EmptyWishlist = ({ onBrowse }: { onBrowse?: () => void }) => (
  <EmptyState
    variant="wishlist"
    title="Your wishlist is empty"
    description="Save items you love by clicking the heart icon on any product."
    action={onBrowse ? { label: "Browse products", onClick: onBrowse } : undefined}
  />
);

export const EmptyCart = ({ onContinue }: { onContinue?: () => void }) => (
  <EmptyState
    variant="cart"
    title="Your cart is empty"
    description="Add some products to your cart to see them here."
    action={onContinue ? { label: "Continue shopping", onClick: onContinue } : undefined}
  />
);

export const EmptyOrders = ({ onShop }: { onShop?: () => void }) => (
  <EmptyState
    variant="orders"
    title="No orders yet"
    description="You haven't placed any orders yet. Start shopping to see your orders here."
    action={onShop ? { label: "Start shopping", onClick: onShop } : undefined}
  />
);

export const ErrorState = ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description={message || "An error occurred while loading. Please try again."}
    action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
  />
);
