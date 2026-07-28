"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, ArrowRight } from "lucide-react";
import { SimpleBundleDealCard } from "./SimpleBundleDealCard";

interface SimpleBundleDeal {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  itemCount: number;
  savings: number;
}

interface SimpleBundleDealsSectionProps {
  bundles: SimpleBundleDeal[];
  title?: string;
  subtitle?: string;
}

export function SimpleBundleDealsSection({
  bundles,
  title = "Bundle Deals",
  subtitle = "Curated bundles with premium savings",
}: SimpleBundleDealsSectionProps) {
  return (
    <section className="py-12 sm:py-16">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Exclusive Bundles
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            {title}
          </h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>
        <Link
          href="/bundles"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-900"
        >
          See All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {bundles.slice(0, 8).map((bundle, index) => (
          <SimpleBundleDealCard
            key={bundle.id}
            {...bundle}
            index={index}
          />
        ))}
      </div>

      {/* Mobile view all button */}
      <div className="mt-6 sm:hidden">
        <Link
          href="/bundles"
          className="block w-full py-3 text-center rounded-lg bg-slate-900 text-white font-bold hover:bg-orange-600 transition-colors"
        >
          See All Bundles
        </Link>
      </div>
    </section>
  );
}
