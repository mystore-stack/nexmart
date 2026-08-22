"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type PromoCard = {
  id: string;
  cardKey: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  ctaText: string;
  badgeText?: string;
  discountPills?: string[];
  order: number;
  active: boolean;
};

const defaultCards: PromoCard[] = [
  {
    id: "vente-flash",
    cardKey: "FLASH_SALE",
    title: "Vente Flash",
    subtitle: "Offres limitées",
    image: "/images/promo_flash_sale.jpg",
    link: "/products?tag=sponsored",
    ctaText: "Voir les offres",
    badgeText: "⏰ Timer",
    order: 0,
    active: true,
  },
  {
    id: "mystery-boxes",
    cardKey: "MYSTERY_BOX",
    title: "Mystery Boxes",
    subtitle: "À partir de 199 DH",
    image: "/images/promo_mystery_box.jpg",
    link: "/products?tag=mystery-box",
    ctaText: "Découvrir",
    badgeText: "✨ Surprise",
    order: 1,
    active: true,
  },
  {
    id: "buy-more-save-more",
    cardKey: "BUY_MORE",
    title: "Buy More Save More",
    subtitle: "Économisez en quantité",
    image: "/images/promo_buy_more.jpg",
    link: "/deals?type=volume-discount",
    ctaText: "Voir les offres",
    badgeText: "🏷️ Promo",
    discountPills: ["2+ -10%", "3+ -20%", "5+ -30%"],
    order: 2,
    active: true,
  },
  {
    id: "build-your-bundle",
    cardKey: "BUNDLE",
    title: "Build Your Bundle",
    subtitle: "Créez votre pack",
    image: "/images/promo_bundle.jpg",
    link: "/bundle-builder",
    ctaText: "Créer maintenant",
    badgeText: "📦 Pack",
    order: 3,
    active: true,
  },
];

const getCardColor = (cardKey: string) => {
  switch (cardKey) {
    case "FLASH_SALE":
      return "from-red-500 to-orange-500";
    case "MYSTERY_BOX":
      return "from-purple-600 to-pink-500";
    case "BUY_MORE":
      return "from-green-500 to-emerald-500";
    case "BUNDLE":
      return "from-blue-500 to-cyan-500";
    default:
      return "from-gray-500 to-gray-600";
  }
};

export function PromoCards() {
  const [cards, setCards] = useState<PromoCard[]>(defaultCards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/homepage/promo-cards")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCards(data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching promo cards:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="my-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="my-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const bgColor = getCardColor(card.cardKey);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badge on image */}
                {card.badgeText && (
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${bgColor} px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg`}>
                      {card.badgeText}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {card.subtitle}
                  </p>
                )}

                {/* Tiers for Buy More Save More */}
                {card.discountPills && card.discountPills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {card.discountPills.map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-2.5 py-1 text-[10px] font-bold text-green-700 border border-green-200"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Button */}
                <Link
                  href={card.link}
                  className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${bgColor} text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md`}
                >
                  {card.ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
