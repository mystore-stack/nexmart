"use client";
// src/components/home/ServiceBannersSection.tsx — Section 8: Service Banners
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Truck, Wallet, ArrowRight } from "lucide-react";

export function ServiceBannersSection() {
  return (
    <section className="my-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1: Fast Delivery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-100 p-8 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex-1 space-y-3 z-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-800">
              <Truck className="h-4 w-4 text-emerald-600" />
              Livraison Rapide
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
              Partout au Maroc en <span className="text-emerald-700">24H - 48H</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Expédition express garantie directement à votre porte avec suivi en temps réel.
            </p>
            <Link
              href="/shipping"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 shadow-md transition-all group-hover:gap-3"
            >
              En savoir plus
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative h-36 w-full sm:w-48 flex-shrink-0">
            <Image
              src="/images/service_fast_delivery.jpg"
              alt="Livraison Rapide Maroc"
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Banner 2: Cash On Delivery */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-50 via-blue-50/60 to-white border border-sky-100 p-8 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex-1 space-y-3 z-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-sky-600/10 px-3 py-1 text-xs font-bold text-sky-800">
              <Wallet className="h-4 w-4 text-sky-600" />
              Paiement à la livraison
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
              Payez lorsque vous <span className="text-sky-700">recevez votre commande</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              100% sécurisé et sans risque. Inspectez votre colis avant de payer au livreur.
            </p>
            <Link
              href="/faq#paiement"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-5 py-2.5 shadow-md transition-all group-hover:gap-3"
            >
              En savoir plus
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative h-36 w-full sm:w-48 flex-shrink-0">
            <Image
              src="/images/service_cod.jpg"
              alt="Paiement à la livraison Cash On Delivery"
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
