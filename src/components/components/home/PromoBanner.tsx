"use client";
// src/components/home/PromoBanner.tsx - Moroccan Luxury
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Gift, Crown } from "lucide-react";

const BANNERS = [
  {
    icon: Zap,
    eyebrow: "Offre spéciale",
    title: "Livraison gratuite",
    subtitle: "Dès 500 MAD d'achat · Partout au Maroc",
    cta: "Profiter",
    href: "/products",
    gradient: "from-brand-800 via-brand-700 to-brand-600",
    accentColor: "rgba(15,118,110,0.4)",
  },
  {
    icon: Crown,
    eyebrow: "Programme VIP",
    title: "Carte Gold Member",
    subtitle: "Accès exclusif aux ventes privées et avant-premières",
    cta: "Rejoindre",
    href: "/register",
    gradient: "from-gold-700 via-gold-600 to-gold-500",
    accentColor: "rgba(212,175,55,0.4)",
  },
  {
    icon: Gift,
    eyebrow: "Nouveautés",
    title: "Collections printemps",
    subtitle: "Les dernières tendances artisanales du Maroc",
    cta: "Découvrir",
    href: "/new-arrivals",
    gradient: "from-moroccan-terracotta via-orange-600 to-amber-600",
    accentColor: "rgba(194,91,51,0.4)",
  },
];

export function PromoBanner() {
  return (
    <div className="space-y-7">
      <div className="text-center">
        <span className="section-label mb-2 justify-center">
          <span className="inline-block w-8 h-px bg-gold-500 mr-2 align-middle" />
          Avantages exclusifs
          <span className="inline-block w-8 h-px bg-gold-500 ml-2 align-middle" />
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {BANNERS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.45, ease: "easeOut" }}
          >
            <Link href={b.href} className="group block">
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} p-7 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-2xl`}
                style={{ boxShadow: `0 8px 32px ${b.accentColor}` }}>

                {/* Moroccan pattern overlay */}
                <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />

                {/* Glow circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
                  style={{ background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)` }} />

                {/* Bottom accent */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <b.icon className="h-5 w-5 text-white" />
                  </div>

                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/60">{b.eyebrow}</p>
                  <h3 className="font-display text-2xl font-semibold text-white mb-2 leading-tight">{b.title}</h3>
                  <p className="text-sm text-white/65 leading-snug mb-5">{b.subtitle}</p>

                  <div className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                    {b.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
