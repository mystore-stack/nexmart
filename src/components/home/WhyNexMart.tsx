"use client";
// src/components/home/WhyNexStore.tsx - Premium Moroccan
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Truck, Users, Star, Award } from "lucide-react";

const VALUES = [
  {
    icon: Award,
    title: "Artisanat Marocain Authentique",
    description: "Soutenez les artisans locaux et dÃ©couvrez des produits uniques de chaque rÃ©gion du Maroc, soigneusement sÃ©lectionnÃ©s.",
    stat: "500+",
    statLabel: "artisans partenaires",
    color: "from-brand-700 to-brand-600",
  },
  {
    icon: Truck,
    title: "Livraison Express Partout",
    description: "Suivi en temps rÃ©el et livraison express garantie pour toutes vos commandes, de Casablanca Ã  Marrakech.",
    stat: "24h",
    statLabel: "dÃ©lai de livraison",
    color: "from-gold-600 to-gold-500",
  },
  {
    icon: ShieldCheck,
    title: "Paiement SÃ©curisÃ© & Fiable",
    description: "Checkout sÃ©curisÃ© avec les meilleurs protocoles SSL, protection totale de vos donnÃ©es et transactions garanties.",
    stat: "100%",
    statLabel: "transactions sÃ©curisÃ©es",
    color: "from-moroccan-cobalt to-blue-700",
  },
  {
    icon: Sparkles,
    title: "Intelligence Artificielle",
    description: "Notre IA analyse vos prÃ©fÃ©rences pour vous proposer des recommandations personnalisÃ©es et pertinentes.",
    stat: "2.4M+",
    statLabel: "recommandations/mois",
    color: "from-violet-700 to-violet-600",
  },
  {
    icon: Users,
    title: "CommunautÃ© de Confiance",
    description: "Rejoignez des millions d&apos;acheteurs satisfaits qui font confiance Ã  NexStore pour leurs achats premium.",
    stat: "1.2M+",
    statLabel: "clients actifs",
    color: "from-brand-700 to-teal-600",
  },
  {
    icon: Star,
    title: "QualitÃ© Premium Garantie",
    description: "Chaque produit est vÃ©rifiÃ© et certifiÃ© par nos experts qualitÃ© pour vous offrir le meilleur de ce qui existe.",
    stat: "4.9â˜…",
    statLabel: "note moyenne",
    color: "from-moroccan-terracotta to-orange-600",
  },
];

export function WhyNexStore() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="section-label mb-3 justify-center">
          <span className="inline-block w-8 h-px bg-gold-500 mr-2 align-middle" />
          Pourquoi NexStore
          <span className="inline-block w-8 h-px bg-gold-500 ml-2 align-middle" />
        </span>
        <h2 className="font-display text-4xl font-semibold md:text-5xl text-foreground mb-4">
          L&apos;expÃ©rience shopping
          <span className="block gradient-gold font-bold">marocaine rÃ©inventÃ©e</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          NexStore combine tradition marocaine, technologie moderne et service premium pour vous offrir une expÃ©rience d&apos;achat inÃ©galÃ©e.
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

