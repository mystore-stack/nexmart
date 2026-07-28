"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function MoroccanIdentitySection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-bl from-amber-100 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&h=700&q=90"
              alt="Moroccan craftsmanship"
              fill
              className="object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl"
            >
              <p className="text-xs sm:text-sm font-bold text-slate-900">Handcrafted</p>
              <p className="text-lg sm:text-xl font-black text-amber-600">Since 1987</p>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-50/50 px-4 py-2 backdrop-blur-sm"
            >
              <span className="text-2xl">🇲🇦</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Moroccan Heritage
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Crafted in Morocco.
                <br />
                <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Delivered to You.
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed">
                Every product in our Moroccan collection tells a story of tradition, craftsmanship,
                and authentic heritage. From artisanal leather goods to premium beauty products, we
                bring the finest Moroccan excellence directly to your door.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { icon: "🎨", label: "Artisan Made" },
                { icon: "🌿", label: "100% Authentic" },
                { icon: "♻️", label: "Sustainable" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/categories/moroccan-products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 group"
              >
                Explore Collection
                <motion.span
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  className="inline-block"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>

            {/* Trust text */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-sm text-slate-600 border-t border-slate-200 pt-6"
            >
              ✓ Direct from Moroccan artisans &nbsp;•&nbsp; ✓ Fair trade certified &nbsp;•&nbsp; ✓
              Lifetime authenticity guarantee
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
