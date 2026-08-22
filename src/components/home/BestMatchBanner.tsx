"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BestMatchBanner({ config }: { config?: any }) {
  // Use CMS config or mock data
  const title = config?.title || "Your best match";
  
  const floatingImages = config?.floatingImages || [
    "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?q=80&w=200&auto=format&fit=crop", // headphones
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=200&auto=format&fit=crop", // earbuds
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=200&auto=format&fit=crop"  // watch
  ];

  const cards = config?.cards?.length ? config.cards : [
    {
      id: "1",
      title: "Smart Watch",
      subtitle: "Health monitoring",
      price: "$75",
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=200&auto=format&fit=crop",
      href: "/products?category=smart-watch"
    },
    {
      id: "2",
      title: "In-earphones",
      subtitle: "Audio equipment",
      price: "$245",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=200&auto=format&fit=crop",
      href: "/products?category=audio"
    },
    {
      id: "3",
      title: "Chromebook",
      subtitle: "Productivity",
      price: "$55",
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=200&auto=format&fit=crop",
      href: "/products?category=laptops"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-12 relative overflow-hidden bg-[#eaf4e6] rounded-2xl shadow-xl flex flex-col md:flex-row border border-green-100">
      
      {/* Background Graphic elements (Wavy pattern simulation) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <svg viewBox="0 0 800 400" className="absolute w-full h-[150%] top-[-25%] left-0 opacity-40 mix-blend-multiply" preserveAspectRatio="none">
           <path d="M-100 200 C 100 0, 300 400, 500 200 S 800 100, 900 200" fill="none" stroke="#7ac484" strokeWidth="40" strokeLinecap="round" />
           <path d="M-50 150 C 150 350, 250 -50, 450 150 S 750 350, 950 150" fill="none" stroke="#a4dca4" strokeWidth="25" strokeLinecap="round" />
           <path d="M0 300 C 200 100, 400 300, 600 100 S 800 300, 1000 200" fill="none" stroke="#68b573" strokeWidth="15" strokeLinecap="round" />
        </svg>
      </div>

      {/* Left side: Floating images */}
      <div className="w-full md:w-5/12 min-h-[250px] md:min-h-full relative flex items-center justify-center p-8 z-10">
        <div className="relative w-full h-64 md:h-full">
          {floatingImages[0] && (
            <div className="absolute top-[10%] left-[20%] w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg animate-bounce" style={{animationDuration: '6s'}}>
              <Image src={floatingImages[0]} alt="Featured product 1" fill className="object-cover" />
            </div>
          )}
          {floatingImages[1] && (
            <div className="absolute bottom-[20%] left-[10%] w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden shadow-lg animate-bounce" style={{animationDuration: '5s', animationDelay: '1s'}}>
              <Image src={floatingImages[1]} alt="Featured product 2" fill className="object-cover" />
            </div>
          )}
          {floatingImages[2] && (
            <div className="absolute bottom-[10%] right-[10%] w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg animate-bounce" style={{animationDuration: '7s', animationDelay: '0.5s'}}>
              <Image src={floatingImages[2]} alt="Featured product 3" fill className="object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Right side: Cards */}
      <div className="w-full md:w-7/12 p-8 md:p-10 z-10 bg-white/60 backdrop-blur-sm md:bg-transparent">
        
        {/* Logo/Icon space */}
        <div className="mb-4 text-[#4ba258]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 tracking-tight">
          {title}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {cards.slice(0, 3).map((card: any, idx: number) => (
            <Link key={idx} href={card.href || "#"} className="flex-1 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col h-full group">
              <h3 className="font-bold text-slate-900 text-[15px]">{card.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{card.subtitle}</p>
              
              <div className="relative w-full h-24 mb-4 mx-auto">
                <Image src={card.image} alt={card.title} fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="font-bold text-slate-900 text-lg">{card.price}</span>
                <div className="w-6 h-6 rounded-full bg-[#4ba258] text-white flex items-center justify-center group-hover:bg-[#3d8848] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
