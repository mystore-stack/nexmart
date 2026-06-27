"use client";

import React from "react";
import { motion } from "framer-motion";
import { BundleCard } from "./BundleCard";

interface BundleDealsProps {
  bundles: Array<{
    id: string;
    name: string;
    description?: string;
    bundlePrice: number;
    discountPercent: number;
    backgroundColor?: string;
    gradient?: string;
    buttonText?: string;
    buttonUrl?: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      image: string;
      price: number;
    }>;
  }>;
}

export function BundleDeals({ bundles }: BundleDealsProps) {
  if (bundles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-b from-muted/30 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Bundle Deals</h2>
          <p className="text-muted-foreground text-lg">Get more for less with our exclusive bundles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {bundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BundleCard bundle={bundle} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
