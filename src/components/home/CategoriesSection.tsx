"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoriesSection({ categories = [], categoryBubbles = [], config = {} }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get category images from CMS config
  const categoryImages = config?.categoryImages || {};

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[CategoriesSection Debug]', {
      categoriesCount: categories.length,
      categoryImages,
      firstCategory: categories[0],
      firstCategoryImage: categories[0]?.image,
      firstCategoryKeys: categories[0] ? Object.keys(categories[0]) : [],
    });
  }

  // Helper to get image - prioritize Category.image from database, then CMS config
  const getCategoryImage = (categoryId: string, categoryImage?: string | null): string => {
    // First priority: Category.image from database (SOURCE OF TRUTH)
    if (categoryImage && typeof categoryImage === 'string' && categoryImage.trim() !== "") {
      return categoryImage;
    }
    
    // Second priority: CMS config categoryImages
    const imgConfig = categoryImages[categoryId];
    
    // If it's an object with imageUrl, use that
    if (imgConfig && typeof imgConfig === 'object' && imgConfig.imageUrl) {
      return imgConfig.imageUrl;
    }
    
    // If it's a string URL, use that
    if (imgConfig && typeof imgConfig === 'string') {
      return imgConfig;
    }
    
    // Fallback
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300&auto=format&fit=crop";
  };

  // Only use database categories - no hardcoded fallback
  const itemsToRender = (categories && categories.length > 0)
    ? categories.map((cat: any) => {
        const finalImage = getCategoryImage(cat.id, cat.image);
        if (typeof window !== 'undefined') {
          console.log(`[Category ${cat.name}]`, {
            dbImage: cat.image,
            finalImage,
          });
        }
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: finalImage,
          href: `/category/${cat.slug}`,
        };
      })
    : [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="my-6 w-full md:my-10">
      <div className="w-full px-2 sm:px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-serif font-bold tracking-tight text-slate-900 md:text-[28px]">
              Catégories
            </h2>
            <span className="inline-flex items-center rounded-full bg-[#e6f4f1] px-3.5 py-1 text-xs font-semibold text-[#156a60] border border-[#cbe6e0] shadow-2xs">
              Explorez par univers
            </span>
          </div>

          {/* Desktop Scroll Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              type="button"
              aria-label="Catégories précédentes"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => scroll("right")}
              type="button"
              aria-label="Catégories suivantes"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
        >
          <div className="flex w-full items-start justify-between gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {itemsToRender.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className="flex shrink-0 snap-start flex-col items-center text-center"
              >
                <Link
                  href={item.href}
                  className="group flex flex-col items-center justify-center text-center outline-none rounded-full p-1"
                >
                  {/* Concentric Circle Container matching reference photo */}
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#ede9e2] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-[#f7f4ee] to-[#f2eee5] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.03)] ring-4 ring-white/90 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#dfd7ca] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-[136px] lg:w-[136px]">
                    {item.image && typeof item.image === 'string' && item.image.trim() !== "" ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={140}
                        height={140}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-108"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <span className="text-2xl font-serif font-bold text-slate-300">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Label */}
                  <span className="mt-3.5 max-w-[110px] text-center text-xs font-serif font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-teal-800 sm:max-w-[130px] sm:text-[13px] md:text-sm">
                    {item.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
