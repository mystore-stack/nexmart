"use client";
// src/components/layout/Footer.tsx - Moroccan Luxury Footer
import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Mail, Twitter, Youtube, MapPin, Phone } from "lucide-react";

const LINKS = {
  Boutique: [
    { label: "Tous les produits", href: "/products" },
    { label: "Sélection IA", href: "/products?sort=recommended" },
    { label: "Catégories", href: "/categories" },
    { label: "Marques", href: "/brands" },
    { label: "Promotions", href: "/deals" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Centre d'aide", href: "/help" },
    { label: "Suivi de commande", href: "/orders/track" },
    { label: "Retours", href: "/returns" },
    { label: "Livraison", href: "/shipping" },
  ],
  Entreprise: [
    { label: "À propos", href: "/about" },
    { label: "Carrières", href: "/careers" },
    { label: "Presse", href: "/press" },
    { label: "Durabilité", href: "/sustainability" },
    { label: "Affiliés", href: "/affiliates" },
  ],
};

const SOCIALS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

function MoroccanDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-400/30" />
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="opacity-60">
        <path d="M16 2 L30 16 L16 30 L2 16 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
        <path d="M16 8 L24 16 L16 24 L8 16 Z" stroke="#D4AF37" strokeWidth="0.75" fill="none" />
        <circle cx="16" cy="16" r="3" fill="#D4AF37" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold-400/30" />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Dark moroccan base */}
      <div className="relative bg-moroccan-navy text-white">
        {/* Moroccan pattern background */}
        <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />

        {/* Radial glows */}
        <div className="absolute top-0 left-0 w-96 h-96 opacity-20"
          style={{ background: "radial-gradient(circle, rgba(15,118,110,0.6) 0%, transparent 70%)", transform: "translate(-30%,-30%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 opacity-15"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)", transform: "translate(30%,30%)" }} />

        {/* Gold top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

        {/* Newsletter Section */}
        <div className="relative border-b border-white/8">
          <div className="container-main py-14">
            <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
                  Newsletter exclusive
                </span>
                <h3 className="font-display text-3xl font-light text-white md:text-4xl leading-tight mb-3">
                  Les meilleures offres,
                  <span className="block text-gold-400 font-semibold">avant tout le monde.</span>
                </h3>
                <p className="text-sm leading-6 text-white/55 max-w-sm">
                  Offres personnalisées, alertes de prix, tendances et promotions exclusives de NexMart Maroc.
                </p>
              </div>

              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="h-14 w-full rounded-2xl border border-white/14 bg-white/8 pl-11 pr-4 text-sm text-white outline-none backdrop-blur placeholder:text-white/35 focus:border-gold-400/40 focus:bg-white/12 transition-all"
                  />
                </div>
                <button className="btn btn-gold h-14 px-7 font-display text-sm tracking-wide">
                  S&apos;abonner
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="relative container-main py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">

            {/* Brand column */}
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="mb-6 flex items-center gap-3.5 group">
                {/* Moroccan logo */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 shadow-brand-lg flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                    <path d="M20 4 L36 20 L20 36 L4 20 Z" stroke="rgba(212,175,55,0.8)" strokeWidth="1.5" fill="none" />
                    <path d="M20 10 L30 20 L20 30 L10 20 Z" stroke="rgba(212,175,55,0.5)" strokeWidth="1" fill="none" />
                    <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.9)" />
                  </svg>
                </div>
                <div>
                  <span className="block font-display text-2xl font-semibold text-white">NexMart</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold-400/70">Maroc · Premium</span>
                </div>
              </Link>

              <p className="max-w-xs text-sm leading-7 text-white/50 mb-7">
                La marketplace premium du Maroc — shopping intelligent, artisanat authentique et expérience d&apos;achat d&apos;exception.
              </p>

              {/* Contact info */}
              <div className="space-y-2.5 mb-7">
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <MapPin className="h-4 w-4 text-gold-400/60 flex-shrink-0" />
                  Casablanca, Maroc
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <Phone className="h-4 w-4 text-gold-400/60 flex-shrink-0" />
                  +212 5XX-XXXXXX
                </div>
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <Mail className="h-4 w-4 text-gold-400/60 flex-shrink-0" />
                  contact@nexmart.ma
                </div>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-2.5">
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/8 transition-all hover:bg-brand-700 hover:border-brand-600 hover:shadow-brand"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="mb-5 text-sm font-bold uppercase tracking-widest text-gold-400/80">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 transition-all hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Moroccan ornamental divider */}
          <MoroccanDivider />

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
            <p className="text-xs text-white/35">
              © {new Date().getFullYear()} NexMart Maroc. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              {["Confidentialité", "Conditions", "Cookies"].map((t) => (
                <Link key={t} href={`/${t.toLowerCase()}`} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
