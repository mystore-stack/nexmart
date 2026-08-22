"use client";
// src/components/home/MobileAppBannerSection.tsx — Section 17: Mobile App Banner
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Smartphone, Zap, Bell, ShieldCheck, QrCode, ArrowRight } from "lucide-react";

interface MobileAppBannerSectionProps {
  banner?: any;
}

const DEFAULT_BANNER = {
  title: "Toute la marketplace premium directement sur votre smartphone.",
  subtitle: "Téléchargez l'application NexMart Maroc pour profiter d'offres exclusives réservées aux membres mobile, du suivi de commande en direct et de la commande en 1-clic.",
  appStoreUrl: "#app-store",
  googlePlayUrl: "#google-play",
  qrCodeImage: null,
  features: [
    { icon: "Zap", text: "Offres Flash Exclusives App" },
    { icon: "Bell", text: "Notifications de prix en direct" },
    { icon: "ShieldCheck", text: "Paiement Cash On Delivery 1-clic" },
    { icon: "QrCode", text: "Scan QR Code express" },
  ],
};

const iconMap: Record<string, any> = {
  Zap,
  Bell,
  ShieldCheck,
  QrCode,
};

export function MobileAppBannerSection({ banner = null }: MobileAppBannerSectionProps) {
  const bannerData = banner || DEFAULT_BANNER;
  const features = bannerData.features || DEFAULT_BANNER.features;
  return (
    <section className="my-14">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-moroccan-navy via-slate-900 to-teal-950 text-white p-8 md:p-12 shadow-luxury-lg border border-gold-500/20">
        {/* Moroccan Zellige overlay */}
        <div className="absolute inset-0 moroccan-pattern-bg opacity-10 pointer-events-none" />

        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Badges (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300">
              <Smartphone className="h-3.5 w-3.5" /> Application Mobile NexMart
            </span>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight">
              {bannerData.title}
            </h2>

            {bannerData.subtitle && (
              <p className="text-sm md:text-base text-white/70 max-w-xl leading-relaxed">
                {bannerData.subtitle}
              </p>
            )}

            {/* Feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {features.map((feature: any, idx: number) => {
                const Icon = iconMap[feature.icon] || Zap;
                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-white/90 font-medium">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-gold-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Store Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href={bannerData.appStoreUrl || "#app-store"}
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur hover:bg-white/20 transition-all shadow-md"
              >
                <span className="text-2xl"></span>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-white/60">Télécharger sur</span>
                  <span className="block font-display text-sm font-bold text-white">App Store</span>
                </div>
              </a>

              <a
                href={bannerData.googlePlayUrl || "#google-play"}
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur hover:bg-white/20 transition-all shadow-md"
              >
                <span className="text-xl font-bold">▶</span>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-white/60">Disponible sur</span>
                  <span className="block font-display text-sm font-bold text-white">Google Play</span>
                </div>
              </a>

              {/* QR Code Mini Card */}
              {bannerData.qrCodeImage && (
                <div className="hidden sm:flex items-center gap-3 bg-white/10 border border-white/15 p-2.5 rounded-2xl backdrop-blur">
                  <div className="h-10 w-10 bg-white rounded-xl p-1 flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-moroccan-navy" />
                  </div>
                  <div className="text-[11px] text-white/80 font-medium">
                    Scannez pour <br /> installer l&apos;App
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Phone Mockup (5 cols) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-64 md:w-72 h-[480px] rounded-[40px] border-4 border-slate-700 bg-slate-900 shadow-2xl p-3 flex flex-col justify-between overflow-hidden"
              style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5)" }}
            >
              {/* iPhone Notch */}
              <div className="mx-auto h-4 w-28 bg-slate-800 rounded-b-xl z-20" />

              {/* Screen Content UI */}
              <div className="relative flex-1 bg-surface rounded-[30px] p-3 text-slate-900 overflow-hidden flex flex-col justify-between my-1">
                {/* Header inside phone */}
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md bg-brand-700 text-[10px] text-white flex items-center justify-center font-bold">N</div>
                    <span className="font-display font-bold text-xs">NexMart App</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">FR / MAD</span>
                </div>

                {/* Banner inside phone */}
                <div className="my-2 rounded-xl bg-gradient-to-r from-brand-700 to-teal-800 p-3 text-white">
                  <span className="text-[8px] uppercase tracking-wider text-gold-300 font-bold">Vente Privée</span>
                  <p className="font-display text-sm font-bold leading-tight">Jusqu&apos;à -50% sur le High-Tech</p>
                </div>

                {/* Products inside phone */}
                <div className="grid grid-cols-2 gap-1.5 my-1">
                  <div className="bg-white p-2 rounded-xl border text-[10px]">
                    <div className="h-14 relative bg-surface rounded-lg mb-1">
                      <Image src="/images/promo_flash_sale.jpg" alt="AirPods" fill sizes="56px" className="object-contain" />
                    </div>
                    <p className="font-bold truncate">AirPods Pro 2</p>
                    <p className="font-black text-brand-700">1.799 DH</p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border text-[10px]">
                    <div className="h-14 relative bg-surface rounded-lg mb-1">
                      <Image src="/images/promo_bundle.jpg" alt="Watch" fill sizes="56px" className="object-contain" />
                    </div>
                    <p className="font-bold truncate">Montre Series 8</p>
                    <p className="font-black text-brand-700">1.199 DH</p>
                  </div>
                </div>

                {/* COD Badge inside phone */}
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-[9px] text-emerald-800 font-bold text-center">
                  ✓ Paiement Cash On Delivery Actif
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="mx-auto h-1 w-24 bg-white/40 rounded-full z-20 mb-1" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
