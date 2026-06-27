"use client";

import React from "react";
import { motion } from "framer-motion";
import { CategoryCard } from "./CategoryCard";
import { FeaturedCategory } from "./FeaturedCategory";

interface ShopByCategoryProps {
  featuredCategory?: {
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
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string;
  }>;
}

export function ShopByCategory({ featuredCategory, categories }: ShopByCategoryProps) {
  const regularCategories = categories.filter(
    (cat) => !featuredCategory || cat.id !== featuredCategory.category.id
  );

  return (
    <section className="py-12 md:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Explore our wide range of products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Featured Category */}
          {featuredCategory && (
            <div className="lg:col-span-1">
              <FeaturedCategory featuredCategory={featuredCategory} />
            </div>
          )}

          {/* Right: Category Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {regularCategories.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
