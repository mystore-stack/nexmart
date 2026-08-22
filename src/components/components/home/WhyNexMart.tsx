"use client";
// src/components/home/WhyNexMart.tsx - Premium Moroccan
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Truck, Users, Star, Award } from "lucide-react";

const VALUES = [
  {
    icon: Award,
    title: "Artisanat Marocain Authentique",
    description: "Soutenez les artisans locaux et découvrez des produits uniques de chaque région du Maroc, soigneusement sélectionnés.",
    stat: "500+",
    statLabel: "artisans partenaires",
    color: "from-brand-700 to-brand-600",
  },
  {
    icon: Truck,
    title: "Livraison Express Partout",
    description: "Suivi en temps réel et livraison express garantie pour toutes vos commandes, de Casablanca à Marrakech.",
    stat: "24h",
    statLabel: "délai de livraison",
    color: "from-gold-600 to-gold-500",
  },
  {
    icon: ShieldCheck,
    title: "Paiement Sécurisé & Fiable",
    description: "Checkout sécurisé avec les meilleurs protocoles SSL, protection totale de vos données et transactions garanties.",
    stat: "100%",
    statLabel: "transactions sécurisées",
    color: "from-moroccan-cobalt to-blue-700",
  },
  {
    icon: Sparkles,
    title: "Intelligence Artificielle",
    description: "Notre IA analyse vos préférences pour vous proposer des recommandations personnalisées et pertinentes.",
    stat: "2.4M+",
    statLabel: "recommandations/mois",
    color: "from-violet-700 to-violet-600",
  },
  {
    icon: Users,
    title: "Communauté de Confiance",
    description: "Rejoignez des millions d&apos;acheteurs satisfaits qui font confiance à NexMart pour leurs achats premium.",
    stat: "1.2M+",
    statLabel: "clients actifs",
    color: "from-brand-700 to-teal-600",
  },
  {
    icon: Star,
    title: "Qualité Premium Garantie",
    description: "Chaque produit est vérifié et certifié par nos experts qualité pour vous offrir le meilleur de ce qui existe.",
    stat: "4.9★",
    statLabel: "note moyenne",
    color: "from-moroccan-terracotta to-orange-600",
  },
];

export function WhyNexMart() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="section-label mb-3 justify-center">
          <span className="inline-block w-8 h-px bg-gold-500 mr-2 align-middle" />
          Pourquoi NexMart
          <span className="inline-block w-8 h-px bg-gold-500 ml-2 align-middle" />
        </span>
        <h2 className="font-display text-4xl font-semibold md:text-5xl text-foreground mb-4">
          L&apos;expérience shopping
          <span className="block gradient-gold font-bold">marocaine réinventée</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          NexMart combine tradition marocaine, technologie moderne et service premium pour vous offrir une expérience d&apos;achat inégalée.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/50 dark:hover:border-gold-600/30"
            style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
          >
            {/* Moroccan pattern corner decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <path d="M40 0 L80 40 L40 80 L0 40 Z" stroke="rgba(212,175,55,0.2)" strokeWidth="1" fill="none" />
                <path d="M40 12 L68 40 L40 68 L12 40 Z" stroke="rgba(212,175,55,0.15)" strokeWidth="0.75" fill="none" />
              </svg>
            </div>

            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.color} shadow-md`}>
              <div className="relative">
                <div className="absolute inset-0 moroccan-pattern-bg opacity-25 rounded-xl" />
                <v.icon className="h-5 w-5 text-white relative" />
              </div>
            </div>

            <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{v.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{v.description}</p>

            <div className="flex items-center gap-3 pt-4 border-t border-gold-200/40 dark:border-gold-800/20">
              <span className="font-display text-2xl font-bold gradient-gold">{v.stat}</span>
              <span className="text-xs text-muted-foreground">{v.statLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
