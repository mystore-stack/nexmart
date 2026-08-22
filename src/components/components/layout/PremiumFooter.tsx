'use client';

import Link from "next/link";
import {
  Shield,
  Truck,
  RotateCcw,
  Award,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  ArrowRight,
  CreditCard,
  Globe,
  DollarSign,
  Sparkles,
} from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { buildLuxuryImage } from "@/components/homepage/luxury-homepage-shared";

const trustCards = [
  {
    icon: Shield,
    title: "Paiements Securises",
    description: "Transactions protegees et verification avancee",
  },
  {
    icon: Truck,
    title: "Livraison Rapide",
    description: "Expeditions suivies dans les grandes villes du Maroc",
  },
  {
    icon: RotateCcw,
    title: "Retours Faciles",
    description: "Retours simplifies avec accompagnement client",
  },
  {
    icon: Award,
    title: "Qualite Premium",
    description: "Selection controlee et presentation haut de gamme",
  },
];

const shopLinks = [
  { name: "Nouveautes", href: "/collections/new" },
  { name: "Meilleures ventes", href: "/products?sort=bestselling" },
  { name: "Offres flash", href: "/deals" },
  { name: "Packs promo", href: "/bundles" },
  { name: "Categories", href: "/categories" },
  { name: "Marques", href: "/brands" },
  { name: "Cartes cadeaux", href: "/contact" },
];

const customerServiceLinks = [
  { name: "Contact", href: "/contact" },
  { name: "Centre d'aide", href: "/help" },
  { name: "Suivre commande", href: "/track-order" },
  { name: "Retours", href: "/help" },
  { name: "Livraison", href: "/help" },
  { name: "FAQ", href: "/faq" },
];

const companyLinks = [
  { name: "A propos", href: "/about" },
  { name: "Carrieres", href: "/careers" },
  { name: "Blog", href: "/help" },
  { name: "Presse", href: "/contact" },
  { name: "Programme affilie", href: "/affiliates" },
  { name: "Devenir vendeur", href: "/contact" },
];

const legalLinks = [
  { name: "Politique de confidentialite", href: "/cookies" },
  { name: "Conditions generales", href: "/help" },
  { name: "Cookies", href: "/cookies" },
  { name: "Politique de remboursement", href: "/help" },
  { name: "Securite", href: "/help" },
];

const paymentMethods = [
  { name: "Visa" },
  { name: "Mastercard" },
  { name: "PayPal" },
  { name: "Apple Pay" },
  { name: "Google Pay" },
  { name: "American Express" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "X", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

export function PremiumFooter() {
  const footerBoardImage = buildLuxuryImage(
    "NexMart ecommerce brand presentation board, premium desktop and mobile UI mockups, clean minimal footer editorial layout, soft neutral palette, subtle glassmorphism, Apple level design quality, ultra realistic, 4K, studio lighting",
    "landscape_16_9"
  );

  return (
    <footer className="border-t border-stone-200 bg-[linear-gradient(180deg,#0f1115_0%,#12161c_48%,#0f1115_100%)]">
      <div className="container-main py-16 md:py-20">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[34px] border border-white/10 bg-white/6 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/30 bg-[#c89b3c]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f0d69d]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NexMart closing board</span>
            </div>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-white">
              Une fin de page pensee comme une derniere couche de confiance premium.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Footer editorial, signaux de confiance, newsletter et liens utiles sont regroupes dans une presentation plus luxe, plus claire et plus coherente avec le reste de l&apos;experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Trust signals", "Editorial footer", "Newsletter", "Premium support"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="aspect-[16/10]">
              <ImageWithFallback
                src={footerBoardImage}
                fallbackSrc="/assets/hero-fallback.svg"
                alt="NexMart premium footer board"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-14">
          {trustCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[#C89B3C]/10 p-3">
                    <Icon className="w-6 h-6 text-[#C89B3C]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">{card.title}</h3>
                    <p className="text-sm font-medium text-white/60">{card.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-extrabold text-white mb-4">NexMart</h2>
            <p className="mb-6 text-base font-medium leading-relaxed text-white/60">
              La marketplace premium du Maroc, pensee comme une experience ecommerce plus editoriale, plus rassurante et plus desiree.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="rounded-xl border border-white/10 bg-white/6 p-3 transition-colors hover:border-[#C89B3C]"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-6">Boutique</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-6">Service Client</h3>
            <ul className="space-y-3">
              {customerServiceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-6">Entreprise</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-base font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-16 rounded-[34px] border border-white/10 bg-white/6 p-8 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-[#C89B3C] p-3">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Newsletter Exclusive</h3>
              </div>
              <p className="text-base font-medium text-white/60">
                Recevez les nouveaux drops, les edits premium et les offres exclusives avant tout le monde.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Entrez votre email"
                className="flex-1 rounded-2xl border border-white/10 bg-[#0F0F10] px-6 py-4 text-white placeholder:text-white/35 focus:outline-none focus:border-[#C89B3C]"
              />
              <button className="flex items-center gap-2 rounded-2xl bg-[#C89B3C] px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-[#B08A34]">
                S&apos;inscrire
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="mb-6 text-lg font-bold text-white">Moyens de Paiement</h3>
          <div className="flex flex-wrap gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-6 py-4"
              >
                <CreditCard className="h-5 w-5 text-[#C89B3C]" />
                <span className="text-white font-medium">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 py-2">
                <Globe className="w-4 h-4 text-white/45" />
                <span className="text-white font-medium">Français</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 py-2">
                <DollarSign className="w-4 h-4 text-white/45" />
                <span className="text-white font-medium">MAD</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 py-2">
                <span className="text-white font-medium">Maroc</span>
              </div>
            </div>

            <div className="text-base font-medium text-white/45">
              © 2026 NexMart. Tous droits reserves. Experience premium concue pour le commerce moderne.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
