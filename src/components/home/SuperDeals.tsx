"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { SuperDealCard } from "./SuperDealCard";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useState } from "react";
import { CountdownTimer } from "./CountdownTimer";

interface SuperDealsProps {
  deals: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      image: string;
      price: number;
      comparePrice?: number;
      rating: number;
      soldCount: number;
    };
    dealPrice: number;
    discountType: string;
    discountValue: number;
    endDate?: string;
    countdown?: boolean;
    featured?: boolean;
    flashSale?: boolean;
    backgroundColor?: string;
    gradient?: string;
    buttonText?: string;
    buttonUrl?: string;
    title?: string;
    description?: string;
  }>;
}

export function SuperDeals({ deals }: SuperDealsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const startIndex = currentIndex * itemsPerPage;
  const visibleDeals = deals.slice(startIndex, startIndex + itemsPerPage);

  // Track impressions for visible deals
  useEffect(() => {
    visibleDeals.forEach(deal => {
      fetch(`/api/super-deals/${deal.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "IMPRESSION" }),
      }).catch(console.error);
    });
  }, [visibleDeals]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  if (deals.length === 0) {
    return null;
  }

  const hasFlashSale = deals.some(d => d.flashSale);
  const earliestEndDate = deals
    .filter(d => d.endDate)
    .map(d => new Date(d.endDate))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <section 
      className="py-12 md:py-20 px-4 md:px-8"
      style={{
        background: deals[0]?.gradient || "bg-gradient-to-b from-background to-muted/30",
        backgroundColor: deals[0]?.backgroundColor,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                {deals[0]?.title || "Super Deals"}
              </h2>
              {hasFlashSale && (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                  <Flame className="w-4 h-4" />
                  Flash Sale
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              {deals[0]?.description || "Limited time offers you don't want to miss"}
            </p>
          </div>

          {/* Countdown Timer */}
          {earliestEndDate && (
            <CountdownTimer endDate={earliestEndDate.toISOString()} />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              disabled={totalPages <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              disabled={totalPages <= 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deals Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SuperDealCard deal={deal} />
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
