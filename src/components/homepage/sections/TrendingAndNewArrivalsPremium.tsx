"use client";

import React from "react";
import {
  LuxuryProductCard,
  LuxurySectionHeader,
  newArrivalProducts,
  trendingProducts,
} from "@/components/homepage/luxury-homepage-shared";

export function TrendingAndNewArrivalsPremium() {
  return (
    <>
      <section className="bg-white py-20">
        <div className="container-main">
          <LuxurySectionHeader
            eyebrow="Tendances"
            title="Ce que le Maroc adore en ce moment."
            description="Momentum, preuve sociale et sélections remarquées — des pièces qui font parler les architectes d'intérieur et les influenceurs."
            actionHref="/collections/trending"
            actionLabel="Shop trending"
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trendingProducts.map((product, index) => (
              <LuxuryProductCard
                key={product.id}
                product={product}
                emphasis={index === 0 ? "emerald" : "light"}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f4ee_100%)] py-20">
        <div className="container-main">
          <LuxurySectionHeader
            eyebrow="Nouveautés"
            title="Fraîcheur couture, ton plus doux."
            description="Les nouveautés arrivent avec des accents dorés plus chaleureux — découverte, légèreté et envie immédiate."
            actionHref="/collections/new"
            actionLabel="Toutes les nouveautés"
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {newArrivalProducts.map((product, index) => (
              <LuxuryProductCard
                key={product.id}
                product={product}
                emphasis={index === 1 ? "sand" : "light"}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default TrendingAndNewArrivalsPremium;
