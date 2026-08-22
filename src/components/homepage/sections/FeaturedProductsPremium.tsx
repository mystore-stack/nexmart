"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  featuredProducts,
  LuxuryProductCard,
  LuxurySectionHeader,
  type LuxuryProduct,
} from "@/components/homepage/luxury-homepage-shared";

type FeaturedProductsPremiumProps = {
  products?: LuxuryProduct[];
  loading?: boolean;
};

const FeaturedProductsPremium: React.FC<FeaturedProductsPremiumProps> = ({
  products = [],
  loading = false,
}) => {
  const displayProducts = products.length > 0 ? products.slice(0, 8) : featuredProducts;

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Sélection"
          title="Les pièces que tout le monde remarque."
          description="Produits phares présentés en cartes image-first — notes curatoriales, avis clients et disponibilité en un coup d'œil."
          actionHref="/collections/featured"
          actionLabel="Voir toute la sélection"
        />

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[32px] bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <LuxuryProductCard
                  product={product}
                  emphasis={index === 0 ? "emerald" : index === 2 ? "sand" : "light"}
                  variant={index % 2 === 0 ? "classic" : "gallery"}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

FeaturedProductsPremium.displayName = "FeaturedProductsPremium";

export default React.memo(FeaturedProductsPremium);
