"use client";

import { motion } from "framer-motion";
import { Star, ShoppingBag, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import type { Deal, Product } from "@/types";

interface FlashDealCardProps {
  deal: Deal;
  onAddToCart?: (product: Product) => void;
}

function CountdownTimer({ endTime }: { endTime: string | Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const end = typeof endTime === "string" ? new Date(endTime) : endTime;
      const diff = end.getTime() - new Date().getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      } else {
        setTimeLeft("EXPIRED");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="font-mono font-bold text-sm">
      {timeLeft}
    </div>
  );
}

export function FlashDealCard({ deal, onAddToCart }: FlashDealCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const stockPercent = (deal.stockRemaining / deal.stockLimit) * 100;
  const isUrgent = stockPercent < 20;
  const isSoldOut = deal.stockRemaining === 0;

  const handleAddToCart = () => {
    addItem(deal.product, 1);
    onAddToCart?.(deal.product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
        isUrgent ? "ring-2 ring-red-500" : ""
      }`}
    >
      {/* Main card background */}
      <div className="bg-white">
        {/* Product image container */}
        <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden group">
          <img
            src={deal.product.images[0] || "/placeholder.jpg"}
            alt={deal.product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white text-sm font-black rounded-lg flex items-center gap-1 shadow-md"
          >
            <Zap className="w-4 h-4" />
            -{deal.discountPercentage}%
          </motion.div>

          {/* Urgent badge */}
          {isUrgent && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-3 right-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1"
            >
              ⚡ Hurry
            </motion.div>
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Sold Out</span>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="p-4 space-y-3">
          {/* Product name */}
          <h3 className="font-bold text-sm text-neutral-900 line-clamp-2">
            {deal.product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-600">
              (
              {Math.floor(Math.random() * 500) + 50}
              )
            </span>
          </div>

          {/* Prices */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-red-600">
                {deal.salePrice.toLocaleString("fr-MA")} MAD
              </span>
              {deal.regularPrice && (
                <span className="text-sm text-neutral-500 line-through">
                  {deal.regularPrice.toLocaleString("fr-MA")}
                </span>
              )}
            </div>
          </div>

          {/* Stock bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">
                {deal.stockRemaining} sold
              </span>
              <span className="text-neutral-500">
                {Math.round(stockPercent)}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${stockPercent}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`h-full ${
                  stockPercent > 50
                    ? "bg-green-500"
                    : stockPercent > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Countdown */}
          <div className="px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-semibold">Ends in:</span>
              <CountdownTimer endTime={deal.endTime} />
            </div>
          </div>

          {/* Add to cart button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSoldOut}
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isSoldOut
                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-md"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
