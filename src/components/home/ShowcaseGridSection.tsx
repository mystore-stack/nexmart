"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

interface ShowcaseGridProps {
  sponsored?: any[];
  bestsellers?: any[];
  newArrivals?: any[];
  mysteryBoxes?: any[];
  showcaseCards?: any[];
  config?: any;
}

export function ShowcaseGridSection({ config = {} }: ShowcaseGridProps) {
  // Card 1 Config
  const card1Title = config?.sponsoredTitle || "Xiaomi 14 Ultra";
  const card1Badge = config?.sponsoredBadge || "SÉLECTION PREMIUM";
  const card1Link = config?.sponsoredLink || "/products";
  const card1Image = config?.sponsoredImage || "/images/sg_xiaomi14.jpg";

  // Card 2 Config
  const card2Title = config?.bestsellersTitle || "Les favoris de la semaine";
  const card2Badge = config?.bestsellersBadge || "MEILLEURES VENTES";
  const card2Link = config?.bestsellersLink || "/bestsellers";
  const card2Image = config?.bestsellersImage || "/images/sg_favoris.jpg";

  // Card 3 Config
  const card3Title = config?.newArrivalsTitle || "Découvrez ce qui vient d'arriver";
  const card3Badge = config?.newArrivalsBadge || "NOUVEAUTÉS";
  const card3Link = config?.newArrivalsLink || "/new-arrivals";
  const card3Image = config?.newArrivalsImage || "/images/sg_nouveautes.jpg";

  // Card 4 Config
  const card4Title = config?.seasonalTitle || "Printemps 2025";
  const card4Badge = config?.seasonalBadge || "COLLECTION SAISONNIÈRE";
  const card4Link = config?.seasonalLink || "/spring-collection";
  const card4Image = config?.seasonalImage || "/images/sg_saisonnier.jpg";

  return (
    <section className="my-6 sm:my-8 lg:my-12">
      {/* Header with Gold Star */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className="flex items-center justify-center text-amber-400">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        </div>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
          Showcase
        </h2>
      </div>

      {/* Grid Layout (Exact 2x2 grid shape on mobile & desktop) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
        
        {/* CARD 1: SÉLECTION PREMIUM (Xiaomi 14 Ultra - Dark Green with Slanted Cut) */}
        <div className="group relative rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] overflow-hidden min-h-[260px] xs:min-h-[290px] sm:min-h-[360px] lg:min-h-[400px] bg-gradient-to-br from-[#07221d] via-[#0b2f27] to-[#041712] border border-emerald-500/20 shadow-xl transition-all duration-300 hover:shadow-2xl [clip-path:polygon(0_0,90%_0,100%_100%,0_100%)]">
          {/* Card Content Left */}
          <div className="relative z-10 p-4 xs:p-5 sm:p-7 lg:p-9 h-full flex flex-col justify-between max-w-[65%] sm:max-w-[58%]">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 bg-black/40 backdrop-blur-md border border-emerald-400/30 rounded-full mb-3 sm:mb-5">
                <span className="text-amber-400 text-[10px] sm:text-xs">★</span>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  {card1Badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-sm xs:text-base sm:text-2xl lg:text-3xl xl:text-[38px] font-bold text-white tracking-tight leading-[1.12] mb-3">
                {card1Title}
              </h3>
            </div>

            {/* Action Link */}
            <div>
              <Link
                href={card1Link}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] xs:text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all group-hover:translate-x-1"
              >
                <span>Découvrir</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Integrated Cadre Image Right */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] h-full pointer-events-none overflow-hidden">
            <Image
              src={card1Image}
              alt={card1Title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 55vw, 50vw"
              priority
            />
            {/* Subtle Gradient Blend */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0b2f27] via-[#0b2f27]/60 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* CARD 2: MEILLEURES VENTES (Les favoris de la semaine - Light Grey) */}
        <div className="group relative rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] overflow-hidden min-h-[260px] xs:min-h-[290px] sm:min-h-[360px] lg:min-h-[400px] bg-[#f4f4f2] border border-slate-200/80 shadow-md transition-all duration-300 hover:shadow-xl">
          {/* Card Content Left */}
          <div className="relative z-10 p-4 xs:p-5 sm:p-7 lg:p-9 h-full flex flex-col justify-between max-w-[65%] sm:max-w-[58%]">
            <div>
              {/* Badge */}
              <span className="block text-[8px] xs:text-[9px] sm:text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-slate-800 mb-3 sm:mb-5">
                {card2Badge}
              </span>

              {/* Title */}
              <h3 className="font-serif text-sm xs:text-base sm:text-2xl lg:text-3xl xl:text-[36px] font-bold text-slate-900 leading-[1.15] mb-3">
                {card2Title}
              </h3>
            </div>

            {/* Action Link */}
            <div>
              <Link
                href={card2Link}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] xs:text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 transition-all group-hover:translate-x-1"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Integrated Cadre Image Right */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] h-full pointer-events-none overflow-hidden">
            <Image
              src={card2Image}
              alt={card2Title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 55vw, 50vw"
            />
            {/* Soft Blend to Left Background */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#f4f4f2] via-[#f4f4f2]/70 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* CARD 3: NOUVEAUTÉS (Découvrez ce qui vient d'arriver - Light Beige) */}
        <div className="group relative rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] overflow-hidden min-h-[260px] xs:min-h-[290px] sm:min-h-[360px] lg:min-h-[400px] bg-[#f5f4f0] border border-slate-200/80 shadow-md transition-all duration-300 hover:shadow-xl">
          {/* Card Content Left */}
          <div className="relative z-10 p-4 xs:p-5 sm:p-7 lg:p-9 h-full flex flex-col justify-between max-w-[65%] sm:max-w-[58%]">
            <div>
              {/* Badge */}
              <div className="inline-block px-2.5 py-1 sm:px-3 sm:py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full mb-3 sm:mb-5">
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-slate-800">
                  {card3Badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-sm xs:text-base sm:text-2xl lg:text-3xl xl:text-[36px] font-bold text-slate-900 leading-[1.18] mb-3">
                {card3Title}
              </h3>
            </div>

            {/* Action Link */}
            <div>
              <Link
                href={card3Link}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] xs:text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 transition-all group-hover:translate-x-1"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Integrated Cadre Image Right */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] h-full pointer-events-none overflow-hidden">
            <Image
              src={card3Image}
              alt={card3Title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 55vw, 50vw"
            />
            {/* Soft Blend to Left Background */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#f5f4f0] via-[#f5f4f0]/70 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* CARD 4: COLLECTION SAISONNIÈRE (Printemps 2025 - Dark Green) */}
        <div className="group relative rounded-[24px] sm:rounded-[30px] lg:rounded-[36px] overflow-hidden min-h-[260px] xs:min-h-[290px] sm:min-h-[360px] lg:min-h-[400px] bg-gradient-to-br from-[#07221d] via-[#0b2f27] to-[#041712] border border-emerald-500/20 shadow-xl transition-all duration-300 hover:shadow-2xl">
          {/* Card Content Left */}
          <div className="relative z-10 p-4 xs:p-5 sm:p-7 lg:p-9 h-full flex flex-col justify-between max-w-[65%] sm:max-w-[58%]">
            <div>
              {/* Badge */}
              <div className="inline-block px-2.5 py-1 sm:px-3 sm:py-1 bg-black/40 backdrop-blur-md border border-emerald-400/30 rounded-full mb-3 sm:mb-5">
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  {card4Badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-sm xs:text-base sm:text-2xl lg:text-3xl xl:text-[38px] font-bold text-white tracking-tight leading-[1.12] mb-3">
                {card4Title}
              </h3>
            </div>

            {/* Action Link */}
            <div>
              <Link
                href={card4Link}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] xs:text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all group-hover:translate-x-1"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Integrated Cadre Image Right */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] h-full pointer-events-none overflow-hidden">
            <Image
              src={card4Image}
              alt={card4Title}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 55vw, 50vw"
            />
            {/* Subtle Gradient Blend */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0b2f27] via-[#0b2f27]/60 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  );
}
