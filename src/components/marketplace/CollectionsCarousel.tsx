"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description?: string;
  image: string;
  href: string;
  badge?: string;
}

interface CollectionsCarouselProps {
  collections: Collection[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function CollectionsCarousel({
  collections,
  title = "Featured Collections",
  autoPlay = true,
  autoPlayInterval = 6000,
}: CollectionsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Auto-play carousel on desktop
  useEffect(() => {
    if (!isAutoPlaying || !scrollContainerRef.current) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;

      // If we're at the end, scroll back to start
      if (currentScroll + clientWidth >= scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        setCurrentIndex(0);
      } else {
        // Scroll to next item
        const cardWidth = container.querySelector("[data-card]")?.clientWidth || 300;
        container.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
        setCurrentIndex((prev) => prev + 1);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsAutoPlaying(false);
    const cardWidth = container.querySelector("[data-card]")?.clientWidth || 300;
    const scrollAmount = direction === "left" ? -cardWidth - 16 : cardWidth + 16;

    container.scrollBy({ left: scrollAmount, behavior: "smooth" });

    // Resume auto-play after manual scroll
    setTimeout(() => setIsAutoPlaying(autoPlay), 5000);
  };

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto no-scrollbar"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(autoPlay)}
      >
        <div className="flex gap-4 pb-4">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              data-card
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-full sm:w-96"
            >
              <Link href={collection.href}>
                <div className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Background Image */}
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 384px"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent group-hover:from-slate-900/80 transition-all duration-300" />

                  {/* Badge (optional) */}
                  {collection.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#d6b25e] text-xs font-bold text-slate-900">
                      {collection.badge}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-[#d6b25e] transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-white/80 mt-2 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    {/* CTA Button */}
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition-colors">
                      <span className="text-sm font-semibold text-white">Explore</span>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
