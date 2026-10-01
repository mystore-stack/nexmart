"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBannersGrid({ cards = [] }: { cards?: any[] }) {
  // Hide section if no CMS cards provided
  if (!cards || cards.length === 0) {
    return null;
  }

  const displayCards = cards;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {displayCards.map((card, idx) => {
        // Light card styling (first card)
        if (card.type === "light" || idx === 0) {
          return (
            <Link key={card.id || idx} href={card.href || "#"} className="group block h-full">
              <div className="relative overflow-hidden bg-white border border-slate-200 h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                {card.subtitle && (
                  <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center p-2 mb-6">
                    <span className="text-black text-[10px] font-bold uppercase leading-tight whitespace-pre-line">
                      {card.subtitle}
                    </span>
                  </div>
                )}
                <h2 className="text-3xl font-black mb-4 uppercase text-black">
                  {card.title}
                </h2>
                {card.description && (
                  <p className="text-xs text-slate-500 mb-6 max-w-[200px]">
                    {card.description}
                  </p>
                )}
                <div className="mt-auto bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-transform group-hover:scale-105">
                  {card.cta || "Shop Now"}
                </div>
              </div>
            </Link>
          );
        }

        // Dark/Image card styling
        return (
          <Link key={card.id || idx} href={card.href || "#"} className="group block h-full">
            <div className="relative overflow-hidden bg-slate-900 h-full min-h-[300px] flex flex-col p-6 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200/20">
              {card.image && (
                <Image 
                  src={card.image} 
                  alt={card.title} 
                  fill 
                  className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="relative z-10 flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-1">{card.title}</h2>
                <p className="text-sm font-medium text-white/90 mb-auto">
                  {card.subtitle}
                </p>
                
                <div className="mt-auto inline-flex items-center text-xs font-bold text-white hover:underline underline-offset-4">
                  {card.cta || "Shop Now"}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
