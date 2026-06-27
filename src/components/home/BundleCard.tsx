"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";

interface BundleCardProps {
  bundle: {
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
  };
}

export function BundleCard({ bundle }: BundleCardProps) {
  const { products, bundlePrice, discountPercent, backgroundColor, gradient, buttonText, buttonUrl } = bundle;
  
  const originalTotal = products.reduce((sum, p) => sum + p.price, 0);
  const backgroundStyle = gradient 
    ? { background: gradient }
    : { backgroundColor: backgroundColor || '#ffffff' };

  const shopUrl = buttonUrl || `/bundle/${bundle.id}`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
      style={backgroundStyle}
    >
      <div className="p-6 md:p-8">
        {/* Bundle Name */}
        <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
        {bundle.description && (
          <p className="text-muted-foreground mb-6">{bundle.description}</p>
        )}

        {/* Products Display */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-6">
          {products.map((product, index) => (
            <React.Fragment key={product.id}>
              {/* Product Image */}
              <Link href={`/products/${product.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-muted shadow-md cursor-pointer"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                </motion.div>
              </Link>

              {/* Plus Icon (not after last product) */}
              {index < products.length - 1 && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pricing */}
        <div className="space-y-2 mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold text-primary">
              {bundlePrice.toFixed(2)} MAD
            </span>
            <span className="text-lg text-muted-foreground line-through">
              {originalTotal.toFixed(2)} MAD
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
              Save {discountPercent}%
            </span>
            <span className="text-sm text-muted-foreground">
              You save {(originalTotal - bundlePrice).toFixed(2)} MAD
            </span>
          </div>
        </div>

        {/* Buy Bundle Button */}
        <Link href={shopUrl}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {buttonText || "Buy Bundle"}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
