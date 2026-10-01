"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Crisp Vector Brand SVGs ensuring maximum contrast, saturation & zero blur
function AppleLogo() {
  return (
    <svg viewBox="0 0 170 170" className="h-6 sm:h-7 md:h-8 w-auto text-slate-900 fill-current">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.09-3.26-2.65-7.14-7.29-11.66-13.9-6.3-9.28-11.24-19.46-14.81-30.56-3.58-11.1-5.37-21.75-5.37-31.97 0-14.28 3.73-25.96 11.18-35.03 7.45-9.08 16.73-13.72 27.84-13.92 4.67 0 9.87 1.25 15.6 3.75 5.72 2.5 9.77 3.76 12.14 3.76 1.96 0 6.13-1.35 12.52-4.07 6.39-2.71 11.67-3.96 15.83-3.75 12.28 1.09 21.99 5.87 29.13 14.35-10.98 6.63-16.37 15.87-16.16 27.72.21 9.35 3.87 17.18 10.98 23.48 7.11 6.3 15.53 9.78 25.27 10.43-2.5 7.4-5.65 14.79-9.46 22.17zM119.22 31.42c0-7.07 2.56-13.81 7.67-20.22 5.11-6.42 11.53-10.44 19.26-12.08.33 1.09.49 2.18.49 3.27 0 7.18-2.68 14.14-8.04 20.88-5.36 6.74-11.88 10.66-19.57 11.75-.33-1.2-.49-2.4-.49-3.6z"/>
    </svg>
  );
}

function SamsungLogo() {
  return (
    <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tighter text-[#034EA2]">
      SAMSUNG
    </span>
  );
}

function XiaomiLogo() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FF6900] rounded-md flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-xs">
        mi
      </div>
      <span className="font-bold text-sm sm:text-base tracking-tight text-slate-800">xiaomi</span>
    </div>
  );
}

function SonyLogo() {
  return (
    <span className="font-serif font-black text-base sm:text-lg md:text-xl tracking-widest text-slate-900">
      SONY
    </span>
  );
}

function JblLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="bg-[#FF3300] text-white px-1.5 py-0.5 rounded font-black text-sm sm:text-base tracking-tighter shadow-xs">
        JBL
      </div>
      <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase hidden sm:inline">by HARMAN</span>
    </div>
  );
}

function LgLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#A50034] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs border border-[#A50034]/20 shadow-xs">
        LG
      </div>
      <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-800">LG</span>
    </div>
  );
}

function HpLogo() {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0096D6] text-white flex items-center justify-center font-black italic text-xs sm:text-sm shadow-xs">
      hp
    </div>
  );
}

function DellLogo() {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#0076CE] flex items-center justify-center font-black text-[10px] sm:text-xs text-[#0076CE] shadow-xs">
      DELL
    </div>
  );
}

function NikeLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 sm:h-7 md:h-8 w-auto text-slate-900 fill-current">
      <path d="M21.71 5.23c-.31.39-4.88 5.76-11.4 10.3-3.69 2.57-7.23 3.65-9.33 3.65-1.07 0-1.63-.33-1.63-.94 0-.76.77-1.89 2.1-3.21 2.33-2.31 5.9-4.63 9.47-6.28 4.29-1.98 8.07-2.73 10.79-3.52z"/>
    </svg>
  );
}

function AdidasLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-0.5 h-4 sm:h-5">
        <div className="w-1 h-2 bg-slate-900 skew-x-[-25deg]" />
        <div className="w-1 h-3.5 bg-slate-900 skew-x-[-25deg]" />
        <div className="w-1 h-5 bg-slate-900 skew-x-[-25deg]" />
      </div>
      <span className="font-bold text-[10px] sm:text-xs tracking-wider text-slate-900 uppercase">adidas</span>
    </div>
  );
}

function PumaLogo() {
  return (
    <span className="font-black text-base sm:text-lg tracking-wider text-slate-900 uppercase">
      PUMA
    </span>
  );
}

function LenovoLogo() {
  return (
    <div className="bg-[#E2231A] text-white px-2 py-0.5 rounded font-bold text-xs sm:text-sm tracking-wider uppercase shadow-xs">
      Lenovo
    </div>
  );
}

function CanonLogo() {
  return (
    <span className="font-serif font-black text-base sm:text-lg tracking-tight text-[#CC0000]">
      Canon
    </span>
  );
}

function BoschLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#EA1D25] flex items-center justify-center font-bold text-[8px] sm:text-[9px] text-[#EA1D25]">
        B
      </div>
      <span className="font-extrabold text-sm sm:text-base tracking-widest text-[#EA1D25]">BOSCH</span>
    </div>
  );
}

function PhilipsLogo() {
  return (
    <span className="font-black text-sm sm:text-base tracking-widest text-[#0B5C9E]">
      PHILIPS
    </span>
  );
}

function TefalLogo() {
  return (
    <span className="font-extrabold text-base sm:text-lg italic text-[#E2001A]">
      Tefal
    </span>
  );
}

// 16 Premium Core Default Brands
const DEFAULT_BRANDS = [
  { id: "apple", name: "Apple", logoComponent: AppleLogo },
  { id: "samsung", name: "Samsung", logoComponent: SamsungLogo },
  { id: "xiaomi", name: "Xiaomi", logoComponent: XiaomiLogo },
  { id: "sony", name: "Sony", logoComponent: SonyLogo },
  { id: "jbl", name: "JBL", logoComponent: JblLogo },
  { id: "lg", name: "LG", logoComponent: LgLogo },
  { id: "hp", name: "HP", logoComponent: HpLogo },
  { id: "dell", name: "Dell", logoComponent: DellLogo },
  { id: "nike", name: "Nike", logoComponent: NikeLogo },
  { id: "adidas", name: "Adidas", logoComponent: AdidasLogo },
  { id: "puma", name: "Puma", logoComponent: PumaLogo },
  { id: "lenovo", name: "Lenovo", logoComponent: LenovoLogo },
  { id: "canon", name: "Canon", logoComponent: CanonLogo },
  { id: "bosch", name: "Bosch", logoComponent: BoschLogo },
  { id: "philips", name: "Philips", logoComponent: PhilipsLogo },
  { id: "tefal", name: "Tefal", logoComponent: TefalLogo },
];

export interface BrandCarouselSectionProps {
  brands?: Array<{
    id?: string;
    name?: string;
    title?: string;
    logo?: string;
    image?: string;
    url?: string;
    link?: string;
  }>;
  title?: string;
  subtitle?: string;
  badge?: string;
  config?: any;
}

export function BrandCarouselSection({
  brands = [],
  title,
  subtitle,
  badge,
}: BrandCarouselSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Combine configured items or use default 16 core brands
  const displayBrands = React.useMemo(() => {
    if (brands && brands.length > 0) {
      return brands.map((b, idx) => ({
        id: b.id || `custom-${idx}`,
        name: b.name || b.title || `Marque ${idx + 1}`,
        logoUrl: b.logo || b.image,
        url: b.url || b.link || "#",
        logoComponent: DEFAULT_BRANDS[idx % DEFAULT_BRANDS.length]?.logoComponent,
      }));
    }
    return DEFAULT_BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      logoUrl: undefined,
      url: "#",
      logoComponent: b.logoComponent,
    }));
  }, [brands]);

  // Duplicate list to create a pixel-perfect, seamless 100% infinite marquee loop
  const marqueeItems = React.useMemo(
    () => [...displayBrands, ...displayBrands, ...displayBrands],
    [displayBrands]
  );

  return (
    <section className="my-6 sm:my-8 lg:my-10 max-w-7xl mx-auto px-3 sm:px-6 select-none overflow-hidden">
      {/* CSS KEYFRAMES FOR SMOOTH 60FPS MARQUEE & PAUSE ON HOVER */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee-left {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-33.3333%, 0, 0);
            }
          }
          .animate-marquee-loop {
            animation: marquee-left 35s linear infinite;
            will-change: transform;
          }
          .marquee-paused {
            animation-play-state: paused !important;
          }
        `
      }} />

      {/* COMPACT SECTION HEADER */}
      <div className="text-center mb-4 sm:mb-6 space-y-1">
        <div className="inline-flex items-center justify-center gap-2">
          <span className="w-6 h-[2px] bg-gradient-to-r from-transparent to-emerald-500 rounded-full" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-emerald-600 font-mono">
            {badge || "— NOS MARQUES VEDETTES —"}
          </span>
          <span className="w-6 h-[2px] bg-gradient-to-l from-transparent to-emerald-500 rounded-full" />
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title || (
            <>
              Les plus grandes marques, réunies{" "}
              <span className="text-emerald-600 relative inline-block">
                pour vous
                <span className="absolute left-0 bottom-0.5 w-full h-[2px] bg-emerald-500/40 rounded-full" />
              </span>
            </>
          )}
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide">
          {subtitle || "Qualité • Confiance • Meilleurs prix"}
        </p>
      </div>

      {/* SINGLE HORIZONTAL MARQUEE TRACK CONTAINER */}
      <div
        className="relative rounded-2xl sm:rounded-3xl md:rounded-[32px] p-2.5 sm:p-3.5 md:p-4 bg-gradient-to-r from-emerald-500/5 via-white/90 to-emerald-500/5 backdrop-blur-xl border border-white shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05),0_5px_15px_-3px_rgba(16,185,129,0.08),inset_0_2px_4px_rgba(255,255,255,1)] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft Ambient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none rounded-2xl sm:rounded-3xl md:rounded-[32px]" />

        {/* 3D TRANSLUCENT GREEN GLASS CORNER CAPS */}
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-7 md:w-9 bg-gradient-to-r from-emerald-500/70 via-emerald-400/30 to-transparent rounded-l-2xl sm:rounded-l-3xl md:rounded-l-[32px] pointer-events-none z-20 backdrop-blur-xs border-l-2 border-emerald-400/60 shadow-[inset_2px_0_8px_rgba(255,255,255,0.7),0_0_15px_rgba(16,185,129,0.3)]" />
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-7 md:w-9 bg-gradient-to-l from-emerald-500/70 via-emerald-400/30 to-transparent rounded-r-2xl sm:rounded-r-3xl md:rounded-r-[32px] pointer-events-none z-20 backdrop-blur-xs border-r-2 border-emerald-400/60 shadow-[inset_-2px_0_8px_rgba(255,255,255,0.7),0_0_15px_rgba(16,185,129,0.3)]" />

        {/* SIDE GRADIENT FADES FOR SEAMLESS IMMERSION */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* ONE CONTINUOUS HORIZONTAL ROW (RIGHT TO LEFT ANIMATION) */}
        <div
          className={`flex items-center gap-3 sm:gap-4 md:gap-6 w-max animate-marquee-loop ${
            isHovered ? "marquee-paused" : ""
          }`}
        >
          {marqueeItems.map((brand, idx) => (
            <motion.div
              key={`${brand.id}-${idx}`}
              whileHover={{ y: -3, scale: 1.05 }}
              className="shrink-0 flex items-center justify-center h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-7 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white via-white to-slate-50/90 border border-slate-100/90 shadow-[0_6px_16px_-3px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:border-emerald-300/80 hover:shadow-[0_12px_24px_-4px_rgba(16,185,129,0.22),0_4px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer relative overflow-hidden group/item"
            >
              {/* Glossy Top Edge Reflection */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

              {/* Subtle Hover Light Sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-700 pointer-events-none" />

              {/* LOGO DISPLAY */}
              {brand.logoUrl ? (
                <div className="relative h-6 sm:h-7 md:h-8 w-24 sm:w-28 md:w-32 flex items-center justify-center">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    sizes="128px"
                    className="object-contain transition-transform duration-300 group-hover/item:scale-105 filter drop-shadow-xs"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center transition-transform duration-300 group-hover/item:scale-105">
                  {brand.logoComponent ? (
                    <brand.logoComponent />
                  ) : (
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{brand.name}</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}





