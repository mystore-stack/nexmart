"use client";
// src/app/checkout/success/page.tsx — Moroccan Luxury
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, Star, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  useEffect(() => {
    if (orderNumber) window.location.replace(`/orders/${encodeURIComponent(orderNumber)}?success=true`);
  }, [orderNumber]);

  if (orderNumber) {
    return <div className="container-main py-20 mx-auto h-8 w-48 skeleton rounded" />;
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 moroccan-pattern-bg opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 opacity-20"
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.5) 0%, transparent 70%)", transform: "translateX(-50%) translateY(-30%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative max-w-lg w-full text-center"
      >
        {/* Decorative Moroccan shape */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg viewBox="0 0 96 96" fill="none" className="absolute inset-0 h-full w-full animate-pulse-gold" style={{ animationDuration: "3s" }}>
              <path d="M48 4 L92 48 L48 92 L4 48 Z" stroke="rgba(15,118,110,0.25)" strokeWidth="1.5" fill="none" />
              <path d="M48 16 L80 48 L48 80 L16 48 Z" stroke="rgba(212,175,55,0.3)" strokeWidth="1" fill="none" />
            </svg>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-200 dark:border-brand-700">
              <CheckCircle className="h-9 w-9 text-brand-700 dark:text-brand-400" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl font-semibold mb-3 text-foreground">Commande confirmée !</h1>

        {/* Gold divider */}
        <div className="mx-auto mb-5 h-px w-24 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <p className="text-muted-foreground leading-relaxed mb-3 text-base">
          Merci pour votre achat sur <strong className="text-brand-700 dark:text-brand-400">NexMart Maroc</strong>.
          Votre commande est en cours de traitement.
        </p>

        {/* Star rating prompt */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-gold-200/40 bg-gold-50/60 dark:bg-gold-900/10 px-4 py-2">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />)}
          <span className="text-xs font-medium text-gold-700 dark:text-gold-400">NexMart · 4.9/5</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/orders" className="btn btn-primary h-12 px-7 group font-display">
            <Package className="h-4 w-4" />
            Mes commandes
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/products" className="btn-outline h-12 px-7 flex items-center justify-center">
            Continuer mes achats
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-main py-20 mx-auto max-w-lg h-64 skeleton rounded-2xl" />}>
      <SuccessContent />
    </Suspense>
  );
}
