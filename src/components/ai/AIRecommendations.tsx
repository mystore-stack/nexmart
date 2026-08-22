"use client";
/**
 * AIRecommendations — Smart product recommendations widget
 * Uses collaborative filtering + content-based AI
 */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props {
  productId?: string;
  context?: "related" | "cart" | "homepage";
  title?: string;
  limit?: number;
}

export function AIRecommendations({
  productId,
  context = "related",
  title = "Recommandé pour vous",
  limit = 6,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      context,
      limit: limit.toString(),
      ...(productId ? { productId } : {}),
    });

    fetch(`/api/ai/recommend?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, context, limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-16 space-y-7">
      <div className="flex items-center gap-2 mb-7">
        <Sparkles className="h-5 w-5 text-gold-500" />
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">AI Picks</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/50">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 rounded w-3/4" />
                <div className="skeleton h-4 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
