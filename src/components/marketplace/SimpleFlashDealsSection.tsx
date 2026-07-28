"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { SimpleFlashDealCard } from "./SimpleFlashDealCard";

interface SimpleFlashDeal {
  id: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  discount?: number;
}

interface SimpleFlashDealsSectionProps {
  deals: SimpleFlashDeal[];
  title?: string;
  subtitle?: string;
}

export function SimpleFlashDealsSection({
  deals,
  title = "Flash Deals",
  subtitle = "Limited time offers with massive discounts",
}: SimpleFlashDealsSectionProps) {
  return (
    <section className="py-12 sm:py-16">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Limited Time
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            {title}
          </h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>
        <Link
          href="/deals"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-900"
        >
          See All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {deals.slice(0, 10).map((deal, index) => (
          <SimpleFlashDealCard
            key={deal.id}
            {...deal}
            index={index}
          />
        ))}
      </div>

      {/* Mobile view all button */}
      <div className="mt-6 sm:hidden">
        <Link
          href="/deals"
          className="block w-full py-3 text-center rounded-lg bg-slate-900 text-white font-bold hover:bg-orange-600 transition-colors"
        >
          See All Flash Deals
        </Link>
      </div>
    </section>
  );
}
