"use client";
// src/components/home/FeaturesSection.tsx — Section 15: Features Bar Section
import React from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

interface FeaturesSectionProps {
  features?: any[];
}

const DEFAULT_FEATURES = [
  {
    icon: Truck,
    title: "Livraison rapide",
    subtitle: "Partout au Maroc en 24h - 48h",
    color: "text-emerald-700 bg-emerald-100/80",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    subtitle: "100% sécurisé à la livraison",
    color: "text-teal-700 bg-teal-100/80",
  },
  {
    icon: RefreshCw,
    title: "Satisfait ou remboursé",
    subtitle: "Retours gratuits sous 7 jours",
    color: "text-amber-700 bg-amber-100/80",
  },
  {
    icon: Headphones,
    title: "Support 7/7",
    subtitle: "Assistance client dédiée",
    color: "text-blue-700 bg-blue-100/80",
  },
];

const iconMap: Record<string, any> = {
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
};

export function FeaturesSection({ features = [] }: FeaturesSectionProps) {
  const featuresList = features.length > 0 ? features : DEFAULT_FEATURES;
  return (
    <section className="my-10">
      <div className="rounded-3xl border border-border/80 bg-moroccan-navy text-white p-6 shadow-luxury relative overflow-hidden">
        {/* Moroccan pattern bg */}
        <div className="absolute inset-0 moroccan-pattern-bg opacity-15 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feat, i) => {
            const Icon = iconMap[feat.iconName] || feat.icon || Truck;
            return (
              <motion.div
                key={feat.id || feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold-400/30 transition-all"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feat.color || "text-emerald-700 bg-emerald-100/80"} shadow-sm flex-shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold text-white leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-snug mt-0.5">
                    {feat.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
