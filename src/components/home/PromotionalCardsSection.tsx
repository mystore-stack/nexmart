"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function PromotionalCardsSection({ cards = [] }: any) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use cards from CMS, no hardcoded fallback
  const promoItems = cards.length > 0 ? cards : [];

  // Return nothing if no cards from CMS
  if (promoItems.length === 0) {
    return null;
  }

  return (
    <section className="my-5 w-full">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-1 [scrollbar-width:none] md:grid md:grid-cols-4 lg:gap-5 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promoItems.map((item: any, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="w-[82vw] flex-shrink-0 snap-start sm:w-[48vw] md:w-auto"
            >
              <Link href={item.href} className="block group cursor-pointer h-full">
                <div
                  className="relative aspect-[1.63/1] w-full overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_46px_rgba(15,23,42,0.12)]"
                  style={{
                    boxShadow: `0 14px 30px -8px ${item.glowColor || "rgba(0,0,0,0.1)"}`,
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 300px, 400px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
