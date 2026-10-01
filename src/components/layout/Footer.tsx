"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  BadgeCheck,
  Headphones,
  ChevronRight,
  ChevronUp,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  LayoutGrid,
  User,
  Store,
  Heart,
} from "lucide-react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { NexmartEmblem } from "@/components/ui/NexmartLogo";

// TikTok Icon SVG
function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.8a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 12a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.56V6.8a4.85 4.85 0 0 1-0.92-.11z" />
    </svg>
  );
}

// Payment Badges matching the image exactly: VISA, Mastercard, Apple Pay, CMI/Maroc, G Pay
function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* VISA */}
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-[#003882] text-[11px] font-extrabold tracking-wider text-white">
        VISA
      </span>
      {/* Mastercard */}
      <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#1A1F29] text-[10px] font-bold text-white">
        <span className="w-3 h-3 rounded-full bg-[#EB001B] inline-block -mr-1" />
        <span className="w-3 h-3 rounded-full bg-[#F79E1B] inline-block opacity-90" />
      </span>
      {/* Apple Pay */}
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-black text-[11px] font-medium text-white border border-slate-800">
         Pay
      </span>
      {/* CMI / Maroc */}
      <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#00A878] text-[10px] font-extrabold text-white">
        mā
      </span>
      {/* G Pay */}
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-[#1A1F29] text-[11px] font-medium text-white border border-slate-800">
        <span className="text-[#4285F4]">G</span>&nbsp;Pay
      </span>
    </div>
  );
}

export function Footer() {
  const { settings, footer } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Structured Columns matching the image
  const categoriesLinks = [
    { title: "Électroménager", url: "/categories/electromenager" },
    { title: "Beauté & Soins", url: "/categories/beaute-soins" },
    { title: "Maison & Cuisine", url: "/categories/maison-cuisine" },
    { title: "High-Tech", url: "/categories/high-tech" },
    { title: "Mode & Accessoires", url: "/categories/mode-accessoires" },
    { title: "Sports & Loisirs", url: "/categories/sports-loisirs" },
  ];

  const serviceLinks = [
    { title: "Aide & FAQ", url: "/faq" },
    { title: "Livraison & Suivi", url: "/livraison" },
    { title: "Retours & Remboursements", url: "/retours" },
    { title: "Contactez-nous", url: "/contact" },
    { title: "Conditions générales", url: "/cgv" },
    { title: "Politique de confidentialité", url: "/confidentialite" },
  ];

  const accountLinks = [
    { title: "Se connecter", url: "/login" },
    { title: "Créer un compte", url: "/register" },
    { title: "Mes commandes", url: "/account/orders" },
    { title: "Mes favoris", url: "/wishlist" },
    { title: "Mes adresses", url: "/account/addresses" },
    { title: "Paramètres", url: "/account/settings" },
  ];

  const aboutLinks = [
    { title: "Nos marques", url: "/marques" },
    { title: "Carrières", url: "/careers" },
    { title: "Blog & Actualités", url: "/blog" },
    { title: "Programme fidélité", url: "/fidelite" },
    { title: "Partenaires", url: "/partenaires" },
  ];

  const socialLinks = [
    { name: "Facebook", href: settings.socialLinks?.facebook || "#", icon: Facebook },
    { name: "Instagram", href: settings.socialLinks?.instagram || "#", icon: Instagram },
    { name: "YouTube", href: settings.socialLinks?.youtube || "#", icon: Youtube },
    { name: "Twitter", href: settings.socialLinks?.twitter || "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "TikTok", href: "#", customIcon: TikTokIcon },
  ];

  return (
    <footer className="relative bg-[#021A17] text-slate-200 font-sans border-t border-[#06332E]">
      <div className="relative container-main px-4 sm:px-6 lg:px-10 pt-12 pb-8">
        
        {/* ================================================================= */}
        {/* ROW 1: BRAND BLOCK (LEFT) & NEWSLETTER BLOCK (RIGHT)               */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-12">
          
          {/* LEFT: NexMart Brand Section */}
          <div className="lg:col-span-5 space-y-4">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <NexmartEmblem size={46} color="#00B48A" />
              <div>
                <span className="block text-2xl font-bold tracking-tight text-white font-sans leading-none">
                  NexMart
                </span>
                <span className="block text-[10px] font-bold text-[#00B48A] tracking-[0.25em] uppercase mt-1">
                  MAROC • PREMIUM
                </span>
              </div>
            </Link>

            {/* Slogan & Description */}
            <div className="space-y-1 pt-1">
              <h4 className="text-base font-bold text-white">
                Votre marketplace premium au Maroc
              </h4>
              <p className="text-xs text-slate-300/80 leading-relaxed max-w-sm">
                Shopping intelligent, produits authentiques, paiement sécurisé et livraison express.
              </p>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const CustomIcon = social.customIcon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-8 h-8 rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-300 flex items-center justify-center transition-all duration-200 hover:border-[#00B48A] hover:text-[#00B48A] hover:scale-105"
                  >
                    {CustomIcon ? <CustomIcon className="w-3.5 h-3.5" /> : Icon && <Icon className="w-3.5 h-3.5" />}
                  </a>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Newsletter Section */}
          <div className="lg:col-span-7 space-y-4">
            {/* Icon & Title */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#06332E] border border-[#0A4D45] flex items-center justify-center text-[#00B48A] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Newsletter</h3>
                <p className="text-xs text-slate-300/80 mt-0.5">
                  Soyez le premier informé de nos offres exclusives, nouveautés et bons plans.
                </p>
              </div>
            </div>

            {/* Email Input Form */}
            <form onSubmit={handleSubscribe} className="space-y-2.5 pt-1">
              <div className="flex flex-col sm:flex-row items-center rounded-full bg-[#03221E] border border-[#0D4740] p-1 focus-within:border-[#00B48A] transition-colors">
                <div className="flex items-center gap-2.5 px-4 w-full sm:w-auto flex-1 py-2 sm:py-0">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto h-10 px-6 rounded-full bg-[#00B48A] hover:bg-[#009E79] text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>S&apos;abonner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {subscribed && (
                <p className="text-xs text-[#00B48A] font-semibold pl-2">
                  ✓ Merci pour votre inscription !
                </p>
              )}

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-6 pt-1 text-[11px] text-slate-300/90 pl-1">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00B48A]" />
                  <span>Offres exclusives</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00B48A]" />
                  <span>Nouveautés</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00B48A]" />
                  <span>Sans spam</span>
                </div>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* ================================================================= */}
      {/* ROW 2: TRUST / SERVICE FEATURES BAR (FULL-WIDTH DARK TEAL BAR)    */}
      {/* ================================================================= */}
      <div className="bg-[#032521] border-y border-[#063C36] py-6">
        <div className="container-main px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: Paiement sécurisé */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#063E38] border border-[#0A544C] flex items-center justify-center text-[#00B48A] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Paiement sécurisé</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">100% sécurisé</p>
              </div>
            </div>

            {/* Feature 2: Livraison express */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#063E38] border border-[#0A544C] flex items-center justify-center text-[#00B48A] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Livraison express</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Partout au Maroc</p>
              </div>
            </div>

            {/* Feature 3: Produits authentiques */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#063E38] border border-[#0A544C] flex items-center justify-center text-[#00B48A] shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Produits authentiques</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Garantie qualité</p>
              </div>
            </div>

            {/* Feature 4: Service client */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#063E38] border border-[#0A544C] flex items-center justify-center text-[#00B48A] shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Service client</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">7j/7 - 24h/24</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ROW 3: NAVIGATION COLUMNS WITH ICONS & CHEVRONS                   */}
      {/* ================================================================= */}
      <div className="container-main px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Nos catégories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <LayoutGrid className="w-4 h-4 text-[#00B48A]" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Nos catégories</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300/80">
              {categoriesLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.url}
                    className="flex items-center justify-between hover:text-[#00B48A] transition-colors group"
                  >
                    <span>{link.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00B48A] transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Service client */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Headphones className="w-4 h-4 text-[#00B48A]" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Service client</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300/80">
              {serviceLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.url}
                    className="flex items-center justify-between hover:text-[#00B48A] transition-colors group"
                  >
                    <span>{link.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00B48A] transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Mon compte */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <User className="w-4 h-4 text-[#00B48A]" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Mon compte</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300/80">
              {accountLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.url}
                    className="flex items-center justify-between hover:text-[#00B48A] transition-colors group"
                  >
                    <span>{link.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00B48A] transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: À propos de NexMart */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Store className="w-4 h-4 text-[#00B48A]" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">À propos de NexMart</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300/80">
              {aboutLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.url}
                    className="block hover:text-[#00B48A] transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ================================================================= */}
      {/* ROW 4: BOTTOM BAR (COPYRIGHT, INSPIRATION, PAYMENTS, SCROLL TOP)   */}
      {/* ================================================================= */}
      <div className="border-t border-[#06332E] py-5 relative">
        <div className="container-main px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          {/* Copyright & Inspiration */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} NexMart. Tous droits réservés.</p>
            <p className="flex items-center gap-1.5 text-slate-300">
              <Heart className="w-3.5 h-3.5 text-[#00B48A]" />
              <span>Le Maroc, notre inspiration</span>
            </p>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            <PaymentBadges />
          </div>

        </div>

        {/* Scroll To Top Floating Green Button (Bottom-Right matching the image) */}
        <button
          onClick={scrollToTop}
          aria-label="Retour en haut"
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#00B48A] hover:bg-[#009E79] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-50"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

    </footer>
  );
}

export default Footer;
