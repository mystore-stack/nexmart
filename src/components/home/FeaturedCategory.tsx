"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";

interface FeaturedCategoryProps {
  featuredCategory: {
    id: string;
    category: {
      id: string;
      name: string;
      slug: string;
      image?: string;
    };
    backgroundColor?: string;
    gradient?: string;
    buttonText?: string;
    buttonUrl?: string;
    description?: string;
    featuredProducts?: Array<{
      id: string;
      name: string;
      image: string;
      price: number;
      comparePrice?: number;
      rating: number;
      soldCount: number;
    }>;
  };
}

export function FeaturedCategory({ featuredCategory }: FeaturedCategoryProps) {
  const { category, backgroundColor, gradient, buttonText, buttonUrl, description, featuredProducts } = featuredCategory;
  
  const backgroundStyle = gradient 
    ? { background: gradient }
    : { backgroundColor: backgroundColor || '#ffffff' };

  const shopUrl = buttonUrl || `/categories/${category.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl"
      style={backgroundStyle}
    >
      <div className="p-8 md:p-12">
        <div className="flex flex-col h-full">
          {/* Category Image */}
          {category.image && (
            <div className="relative h-64 md:h-80 mb-6 rounded-2xl overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}

          {/* Category Info */}
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{category.name}</h2>
            {description && (
              <p className="text-lg text-muted-foreground mb-4">{description}</p>
            )}
            <Link href={shopUrl}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {buttonText || "Shop Now"}
              </motion.button>
            </Link>
          </div>

          {/* Featured Products */}
          {featuredProducts && featuredProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
              <div className="grid grid-cols-3 gap-4">
                {featuredProducts.slice(0, 3).map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-background/80 backdrop-blur-sm rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 16vw"
                        />
                      </div>
                      <p className="text-sm font-medium line-clamp-1 mb-1">{product.name}</p>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold text-sm">
                          {product.price.toFixed(2)} MAD
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {product.comparePrice.toFixed(2)} MAD
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{product.soldCount} sold</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
