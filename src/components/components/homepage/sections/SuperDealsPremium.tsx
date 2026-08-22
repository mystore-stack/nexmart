"use client";

import React from "react";
import {
  LuxuryProductCard,
  LuxurySectionHeader,
  superDeals,
} from "@/components/homepage/luxury-homepage-shared";

const SuperDealsPremium: React.FC = () => {
  return (
    <section className="bg-[linear-gradient(180deg,#fff8f1_0%,#ffffff_100%)] py-20">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Super deals"
          title="L'urgence, avec élégance."
          description="Des opportunités limitées présentées avec retenue — pression commerciale sans bruit, action sans compromis sur le luxe."
          actionHref="/super-deals"
          actionLabel="Toutes les super deals"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {superDeals.map((product, index) => (
            <LuxuryProductCard
              key={product.id}
              product={product}
              emphasis={index === 1 ? "sand" : "light"}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

SuperDealsPremium.displayName = "SuperDealsPremium";

export default React.memo(SuperDealsPremium);
