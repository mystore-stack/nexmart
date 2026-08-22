"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromotionalCardsSection({ cards = [] }: { cards?: any[] }) {
  return (
    <section className="my-8 md:my-12 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative z-0 max-w-5xl mx-auto">
        
        {cards && cards.length > 0 ? cards.map((card, idx) => (
          <Link key={idx} href={card.href || "#"} className="group block h-full">
            <div className={`relative overflow-hidden rounded-3xl h-full min-h-[200px] md:min-h-[220px] flex flex-col justify-center p-5 md:p-6 lg:p-8 border bg-gradient-to-br transition-transform duration-300 hover:-translate-y-1 ${card.style || 'border-purple-100 from-purple-50 to-purple-100'}`}>
              <div className="relative z-10 w-3/4 sm:w-2/3">
                <h2 className="text-lg md:text-xl lg:text-2xl font-black mb-1.5 md:mb-2 leading-tight uppercase text-slate-900">{card.title}</h2>
                <p className="text-[13px] md:text-sm font-bold text-slate-800 mb-1.5 md:mb-2">
                  {card.subtitle}
                </p>
                <p className="text-[11px] md:text-xs text-slate-600 mb-4 md:mb-5 max-w-[160px] md:max-w-[180px] leading-relaxed">
                  {card.description}
                </p>
                <div className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-transform group-hover:scale-105 shadow-sm">
                  {card.ctaText || "Découvrir"} <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
              </div>
              
              {card.image && (
                <div className="absolute right-[-5%] bottom-[-10%] w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mix-blend-multiply transition-transform duration-500 group-hover:scale-110 opacity-90">
                  <Image src={card.image} alt={card.title} fill className="object-contain" />
                </div>
              )}
            </div>
          </Link>
        )) : (
          <>
            {/* Mystery Box Card (Fallback) */}
            <Link href="/mystery-boxes" className="group block h-full">
              <div className="relative overflow-hidden section-glow-mystery rounded-3xl h-full min-h-[200px] md:min-h-[220px] flex flex-col justify-center p-5 md:p-6 lg:p-8 border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 transition-transform duration-300 hover:-translate-y-1">
                <div className="relative z-10 w-3/4 sm:w-2/3">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-black mb-1.5 md:mb-2 leading-tight text-purple-900 uppercase">MYSTERY BOXES</h2>
                  <p className="text-[13px] md:text-sm font-bold text-purple-800 mb-1.5 md:mb-2">
                    Surprises à l'intérieur 🎁
                  </p>
                  <p className="text-[11px] md:text-xs text-purple-700 mb-4 md:mb-5 max-w-[160px] md:max-w-[180px] leading-relaxed">
                    Des produits premium à prix imbattables !
                  </p>
                  <div className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-purple-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-transform group-hover:scale-105 shadow-sm">
                    Découvrir les boxes <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </div>
                </div>
                
                {/* Background Graphic */}
                <div className="absolute right-[-5%] bottom-[-10%] w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mix-blend-multiply transition-transform duration-500 group-hover:scale-110 opacity-90">
                  <Image src="/images/mystery_box_graphic.jpg" alt="Mystery Box" fill className="object-contain" />
                </div>
              </div>
            </Link>

            {/* Editor's Choice Card (Fallback) */}
            <Link href="/editors-choice" className="group block h-full">
              <div className="relative overflow-hidden section-glow-editors rounded-3xl h-full min-h-[200px] md:min-h-[220px] flex flex-col justify-center p-5 md:p-6 lg:p-8 border border-amber-100 bg-gradient-to-br from-amber-50/80 to-amber-100/80 transition-transform duration-300 hover:-translate-y-1">
                <div className="relative z-10 w-3/4 sm:w-2/3">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-black mb-1.5 md:mb-2 leading-tight text-slate-900 uppercase">ÉDITEUR'S CHOICE</h2>
                  <p className="text-[13px] md:text-sm font-bold text-slate-800 mb-1.5 md:mb-2">
                    Sélectionnés par notre équipe
                  </p>
                  <p className="text-[11px] md:text-xs text-slate-600 mb-4 md:mb-5 max-w-[160px] md:max-w-[180px] leading-relaxed">
                    Découvrez nos coups de cœur du moment.
                  </p>
                  <div className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-transform group-hover:scale-105 shadow-sm">
                    Voir la sélection <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </div>
                </div>
                
                {/* Background Graphic */}
                <div className="absolute right-[-10%] bottom-[-10%] w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 mix-blend-multiply transition-transform duration-500 group-hover:scale-110 opacity-90">
                  <Image src="/images/editors_choice_graphic.jpg" alt="Editor's Choice" fill className="object-cover rounded-tl-full" />
                </div>
              </div>
            </Link>
          </>
        )}

      </div>
    </section>
  );
}
