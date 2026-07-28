"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { FlashDealCard } from "@/components/deals/FlashDealCard";
import type { Deal } from "@/types";

interface FlashDealsSectionProps {
  deals: Deal[];
  title?: string;
  subtitle?: string;
  showTimer?: boolean;
  cardsPerRow?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  onViewAll?: () => void;
}

function GlobalCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
      <Zap className="w-3.5 h-3.5 text-red-600 animate-pulse" />
      <span className="text-xs font-mono font-bold text-red-700">{timeLeft}</span>
    </div>
  );
}

export function FlashDealsSection({
  deals,
  title = "Flash Deals",
  subtitle = "Limited time offers",
  showTimer = true,
  cardsPerRow = { mobile: 2, tablet: 3, desktop: 4 },
  onViewAll,
}: FlashDealsSectionProps) {
  if (!deals || deals.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const displayDeals = deals.slice(0, 8);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="w-full"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Zap className="w-5 h-5 text-red-600" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h2>
          </div>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        {showTimer && <GlobalCountdownTimer />}
      </div>

      {/* Desktop & Tablet Grid */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayDeals.map((deal) => (
          <FlashDealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pb-2">
          {displayDeals.map((deal) => (
            <div key={deal.id} className="flex-shrink-0 w-[calc(50vw-12px)] sm:w-auto">
              <FlashDealCard deal={deal} />
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <Link
          href="/deals"
          onClick={onViewAll}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
        >
          View all flash deals
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.section>
  );
}
