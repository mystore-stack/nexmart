"use client";

import React, { useEffect, useState } from "react";
import {
  flashDealProducts,
  formatMad,
  LuxuryProductCard,
  LuxurySectionHeader,
} from "@/components/homepage/luxury-homepage-shared";

const FlashDealsPremium: React.FC = () => {
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 14, seconds: 33 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) return prev;
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[linear-gradient(180deg,#f7f4ee_0%,#ffffff_100%)] py-20">
      <div className="container-main">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
          <div className="space-y-6 rounded-[34px] border border-stone-200 bg-stone-950 p-8 text-white shadow-luxury-lg">
            <div className="inline-flex items-center rounded-full border border-[#c89b3c]/30 bg-[#c89b3c]/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f0d69d]">
              Private sale
            </div>

            <LuxurySectionHeader
              eyebrow="Offres flash"
              title="Le compte à rebours du luxe."
              description="Des offres limitées dans le temps, présentées comme un événement privé — hiérarchie forte, lecture rapide, produits mis en scène."
            />

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Hours", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Seconds", value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/8 px-4 py-5 text-center backdrop-blur">
                  <div className="text-3xl font-semibold tracking-[-0.05em] text-white">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d69d]">This window includes</p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Luxury rugs, ceremony fashion and elevated hosting pieces with savings up to{" "}
                <span className="font-semibold text-white">{formatMad(1200)}</span>.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {flashDealProducts.map((product, index) => (
              <LuxuryProductCard
                key={product.id}
                product={product}
                emphasis={index === 1 ? "sand" : "light"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

FlashDealsPremium.displayName = "FlashDealsPremium";

export default React.memo(FlashDealsPremium);
