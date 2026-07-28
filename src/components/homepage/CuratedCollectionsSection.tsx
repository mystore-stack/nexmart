"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  icon: string;
}

const collections: Collection[] = [
  {
    id: "moroccan-originals",
    title: "Moroccan Originals",
    description: "Authentic artisan crafts and traditional collections",
    image:
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&h=600&q=80",
    href: "/collections/moroccan-originals",
    icon: "🇲🇦",
  },
  {
    id: "trending-now",
    title: "Trending Now",
    description: "This week's most popular items and bestsellers",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&h=600&q=80",
    href: "/collections/trending-now",
    icon: "🔥",
  },
  {
    id: "premium-tech",
    title: "Premium Tech",
    description: "Latest gadgets and cutting-edge technology",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&h=600&q=80",
    href: "/collections/premium-tech",
    icon: "💻",
  },
  {
    id: "style-fashion",
    title: "Style & Fashion",
    description: "Curated fashion pieces for the modern wardrobe",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=600&q=80",
    href: "/collections/style-fashion",
    icon: "👗",
  },
];

export function CuratedCollectionsSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4">
            Curated Collections
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Discover handpicked collections tailored to your style and interests
          </p>
        </motion.div>

        {/* Collections Grid (2 columns) */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={collection.href}>
                <motion.div
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative h-64 sm:h-80 rounded-3xl overflow-hidden cursor-pointer"
                >
                  {/* Background Image */}
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                    {/* Icon Badge */}
                    <motion.div
                      animate={{ y: 0 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-4xl"
                    >
                      {collection.icon}
                    </motion.div>

                    {/* Bottom Content */}
                    <div className="space-y-4">
                      <div>
                        <motion.h3
                          animate={{ y: 0 }}
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.3 }}
                          className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg"
                        >
                          {collection.title}
                        </motion.h3>

                        <motion.p
                          animate={{ y: 0, opacity: 0.9 }}
                          whileHover={{ y: -2, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm sm:text-base text-white/90 drop-shadow-md mt-2"
                        >
                          {collection.description}
                        </motion.p>
                      </div>

                      {/* CTA */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 text-white font-semibold"
                      >
                        Shop now
                        <motion.span
                          animate={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          className="inline-block"
                        >
                          →
                        </motion.span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Border */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-3xl border-2 border-white/40 pointer-events-none"
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors"
          >
            View All Collections
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
