"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  aiRecommendationProducts,
  LuxuryProductCard,
  LuxurySectionHeader,
  type LuxuryProduct,
} from "@/components/homepage/luxury-homepage-shared";
import { mapDbProductToLuxury } from "@/lib/map-home-products";

type AIRecommendationsPremiumProps = {
  fallbackProducts?: LuxuryProduct[];
};

const AIRecommendationsPremium: React.FC<AIRecommendationsPremiumProps> = ({
  fallbackProducts = aiRecommendationProducts,
}) => {
  const [products, setProducts] = useState<LuxuryProduct[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/recommend?context=homepage&limit=8")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.products?.length > 0) {
          setProducts(
            data.products.map((p: Parameters<typeof mapDbProductToLuxury>[0], i: number) =>
              mapDbProductToLuxury(p, i)
            )
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayProducts = products.length > 0 ? products : aiRecommendationProducts;

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#f4faf8_0%,#ffffff_100%)] py-20 lg:py-24">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Pour vous"
          title="Sélectionnées pour votre univers."
          description="Recommandations intelligentes basées sur vos préférences — des pièces qui prolongent votre style, sans bruit ni surcharge."
          align="center"
        />

        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[480px] w-[300px] shrink-0 animate-pulse rounded-[32px] bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="w-[300px] shrink-0 snap-start sm:w-[320px]"
              >
                <LuxuryProductCard product={product} emphasis="emerald" variant="compact" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

AIRecommendationsPremium.displayName = "AIRecommendationsPremium";

export default React.memo(AIRecommendationsPremium);
