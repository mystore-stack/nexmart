"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/utils/format";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";

interface SuperDeal {
  id: string;
  title: string;
  description?: string;
  image?: string;
  productId: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  stockLimit?: number | null;
  featured: boolean;
  flashSale: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  } | null;
}

export function SuperDealsCheckout() {
  const [deals, setDeals] = useState<SuperDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDealId, setAddingDealId] = useState<string | null>(null);
  const { items, addItem } = useCartStore();

  // Get product IDs currently in cart to exclude them
  const cartProductIds = items
    .filter(item => item.type === "product" && (item.metadata as any)?.productId)
    .map(item => (item.metadata as any)?.productId)
    .join(",");

  useEffect(() => {
    fetchSuperDeals();
  }, [cartProductIds]);

  const fetchSuperDeals = async () => {
    try {
      setLoading(true);
      const url = `/api/checkout/super-deals${cartProductIds ? `?cartProductIds=${cartProductIds}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setDeals(data.deals);
      }
    } catch (error) {
      console.error("Failed to fetch super deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (deal: SuperDeal) => {
    if (!deal.product) {
      toast.error("Product information not available");
      return;
    }

    // Check stock
    if (deal.stockLimit !== undefined && deal.stockLimit !== null && deal.stockLimit <= 0) {
      toast.error("This deal is out of stock");
      return;
    }

    if (deal.product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setAddingDealId(deal.id);

    try {
      // Optimistic update - add to local store immediately
      addItem({
        type: "flash-deal",
        superDealId: deal.id,
        productId: deal.productId,
        quantity: 1,
        unitPrice: deal.dealPrice,
        superDeal: deal,
      } as any);

      toast.success(`${deal.title} added to your order!`);

      // Refresh deals to remove the added one
      await fetchSuperDeals();
    } catch (error) {
      console.error("Failed to add deal to cart:", error);
      toast.error("Failed to add deal to cart");
    } finally {
      setAddingDealId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h3 className="font-bold text-lg">Super Deals For You</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-zinc-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-brand-500" />
        <h3 className="font-bold text-lg">Super Deals For You</h3>
        <span className="badge badge-brand text-xs">Limited Time</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {deals.map((deal) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                deal.featured 
                  ? "border-gradient-to-r from-violet-600 to-indigo-600 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20" 
                  : "border-zinc-200 hover:border-foreground/30 bg-background"
              }`}
            >
              {/* Flash sale badge */}
              {deal.flashSale && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="badge badge-danger text-xs animate-pulse">
                    Flash Sale
                  </span>
                </div>
              )}

              {/* Featured badge */}
              {deal.featured && !deal.flashSale && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="badge badge-brand text-xs">
                    Featured
                  </span>
                </div>
              )}

              <div className="flex gap-4 p-4">
                {/* Product image */}
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={deal.image || deal.product?.images?.[0] || "/placeholder.png"}
                    alt={deal.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Deal info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{deal.title}</h4>
                    {deal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{deal.description}</p>
                    )}
                  </div>

                  {/* Prices */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-brand-600">
                        {formatPrice(deal.dealPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(deal.originalPrice)}
                      </span>
                      <span className="badge badge-success text-xs">
                        -{deal.discountPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Stock info */}
                  {deal.stockLimit !== undefined && deal.stockLimit !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      {deal.stockLimit <= 5 ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-600 dark:text-orange-400">
                            Only {deal.stockLimit} left!
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          {deal.stockLimit} available
                        </span>
                      )}
                    </div>
                  )}

                  {/* Add button */}
                  <button
                    onClick={() => handleAddToCart(deal)}
                    disabled={addingDealId === deal.id || (deal.stockLimit !== undefined && deal.stockLimit !== null && deal.stockLimit <= 0)}
                    className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                  >
                    {addingDealId === deal.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add to Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Multiple deals hint */}
      {deals.length > 2 && (
        <p className="text-xs text-center text-muted-foreground">
          Add multiple deals to maximize your savings!
        </p>
      )}
    </div>
  );
}
