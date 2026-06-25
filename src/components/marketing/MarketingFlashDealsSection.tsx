"use client";

import { useEffect, useState } from "react";
import type { FlashDealDTO } from "@/lib/marketing/types";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";

function Countdown({ endDate }: { endDate: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Ended");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
      Ends in {remaining}
    </span>
  );
}

export function MarketingFlashDealsSection({ deals }: { deals: FlashDealDTO[] }) {
  const deal = deals[0];

  useEffect(() => {
    if (deal) {
      fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashDealId: deal.id, eventType: "view" }),
      }).catch(() => {});
    }
  }, [deal?.id]);

  if (!deals.length || !deal) return null;

  const products = deal.products?.map((p) => ({
    ...p.product,
    price: p.discountPrice ?? p.product.price,
    comparePrice: p.product.price,
  })) ?? [];

  if (!products.length) return null;

  return (
    <section className="relative overflow-hidden bg-moroccan-navy py-14 md:py-20">
      <div className="container-main">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">{deal.name}</h2>
            {deal.discountPercent && (
              <p className="text-white/70 text-sm">Up to {deal.discountPercent}% off</p>
            )}
          </div>
          <Countdown endDate={deal.endDate} />
        </div>
        <FlashSaleSection products={products as never} />
      </div>
    </section>
  );
}
