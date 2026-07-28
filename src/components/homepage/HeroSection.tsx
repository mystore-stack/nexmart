"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Clock, Shield, BadgeCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/30" />
        {/* Decorative Moroccan pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* LEFT SIDE - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-50/50 px-4 py-2 backdrop-blur-sm"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                🏛️ Moroccan Luxury Marketplace
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-950">
                Premium Products.
                <br />
                <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Authentic Morocco.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed">
                Discover premium products with fast delivery, secure payments, and curated Moroccan collections.
                Shopping reimagined for you.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-base font-bold text-white hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200"
              >
                Shop Marketplace
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/deals"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-900 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-200"
              >
                Flash Deals
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                  40%
                </span>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Free Shipping</p>
                  <p className="text-slate-600">From 500 MAD</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">24h Dispatch</p>
                  <p className="text-slate-600">Casablanca</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">Secure Payment</p>
                  <p className="text-slate-600">CMI + Stripe</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">100% Authentic</p>
                  <p className="text-slate-600">Verified sellers</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-96 sm:h-[500px] lg:h-[600px] hidden sm:block"
          >
            {/* Background Moroccan architecture (blurred) */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-amber-900/10 backdrop-blur-lg" />
              <Image
                src="https://images.unsplash.com/photo-1555097462-c1dace47cb6f?auto=format&fit=crop&w=600&h=700&q=80"
                alt="Moroccan architecture background"
                fill
                className="object-cover opacity-40"
              />
            </div>

            {/* Floating product cards */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Center spotlight */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                  {/* Moroccan lantern */}
                  <motion.div
                    className="absolute top-0 left-4 w-32 h-40 rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100"
                    animate={{ rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1578527269495-46d9982a09f9?auto=format&fit=crop&w=200&h=250&q=80"
                      alt="Moroccan lantern"
                      fill
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Leather bag */}
                  <motion.div
                    className="absolute bottom-8 right-0 w-36 h-32 rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100"
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&h=150&q=80"
                      alt="Moroccan leather bag"
                      fill
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Perfume/luxury item */}
                  <motion.div
                    className="absolute top-12 right-6 w-28 h-36 rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100"
                    animate={{ rotate: [0, -3, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=150&h=200&q=80"
                      alt="Premium perfume"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Top-right: Floating discount card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-8 right-8 sm:top-12 sm:right-12 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden backdrop-blur-sm"
              >
                <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                      Limited Time
                    </p>
                    <p className="text-4xl font-black text-amber-600 leading-none mt-1">
                      40%
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      Premium Moroccan edits
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-3 w-full px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                    >
                      Shop Now
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Bottom-left: Small trust badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BadgeCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900">10K+ Happy</p>
                    <p className="text-xs text-slate-600">customers</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative border-t border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50/50"
      >
        <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: "10K+", label: "Products" },
              { value: "9", label: "Categories" },
              { value: "24h", label: "Dispatch" },
              { value: "100%", label: "Authentic" },
            ].map(({ value, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
