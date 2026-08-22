"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function BrandCarouselSection({ brands = [] }: { brands?: any[] }) {
  return (
    <section className="my-8 md:my-12 overflow-hidden section-glow-base section-glow-brands">
      <div className="relative">
        {/* Gradient Fades for Carousel Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fcfaf9] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fcfaf9] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex w-max"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          {/* We repeat the image 3 times to ensure a smooth continuous loop */}
          {brands && brands.length > 0 ? brands.map((brand, key) => (
            <div key={key} className="relative h-16 sm:h-20 w-[1000px] shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <Image 
                src={brand.image || "/images/brand_logos.png"} 
                alt={brand.title || "Nos marques"} 
                fill 
                className="object-contain mix-blend-multiply" 
              />
            </div>
          )) : [1, 2, 3].map((key) => (
            <div key={key} className="relative h-16 sm:h-20 w-[1000px] shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <Image 
                src="/images/brand_logos.png" 
                alt="Nos marques préférées" 
                fill 
                className="object-contain mix-blend-multiply" 
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

