"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Shield, HeadphonesIcon, RotateCcw, CreditCard, Award } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  gradient: string;
  count: number;
  suffix: string;
}

export function PremiumWhyNexMart() {
  const [counts, setCounts] = useState({ delivery: 0, support: 0, returns: 0, secure: 0, payment: 0, quality: 0 });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targetCounts = {
      delivery: 99,
      support: 24,
      returns: 30,
      secure: 100,
      payment: 50,
      quality: 100,
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        delivery: Math.round(targetCounts.delivery * progress),
        support: Math.round(targetCounts.support * progress),
        returns: Math.round(targetCounts.returns * progress),
        secure: Math.round(targetCounts.secure * progress),
        payment: Math.round(targetCounts.payment * progress),
        quality: Math.round(targetCounts.quality * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features: Feature[] = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Livraison Express",
      description: "Livraison rapide partout au Maroc en 24-48h",
      color: "from-[#0F6B57] to-[#0F6B57]/80",
      gradient: "from-[#0F6B57]/10 to-[#0F6B57]/5",
      count: counts.delivery,
      suffix: "%",
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: "Support 24/7",
      description: "Service client disponible à tout moment",
      color: "from-[#C8A04D] to-[#C8A04D]/80",
      gradient: "from-[#C8A04D]/10 to-[#C8A04D]/5",
      count: counts.support,
      suffix: "/7",
    },
    {
      icon: <RotateCcw className="w-8 h-8" />,
      title: "Retours Faciles",
      description: "30 jours pour changer d'avis",
      color: "from-[#0F6B57] to-[#0F6B57]/80",
      gradient: "from-[#0F6B57]/10 to-[#0F6B57]/5",
      count: counts.returns,
      suffix: "j",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Paiement Sécurisé",
      description: "Transactions 100% sécurisées",
      color: "from-[#C8A04D] to-[#C8A04D]/80",
      gradient: "from-[#C8A04D]/10 to-[#C8A04D]/5",
      count: counts.secure,
      suffix: "%",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Paiement Flexible",
      description: "Payez en plusieurs fois sans frais",
      color: "from-[#0F6B57] to-[#0F6B57]/80",
      gradient: "from-[#0F6B57]/10 to-[#0F6B57]/5",
      count: counts.payment,
      suffix: "+",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Qualité Premium",
      description: "Produits authentiques et garantis",
      color: "from-[#C8A04D] to-[#C8A04D]/80",
      gradient: "from-[#C8A04D]/10 to-[#C8A04D]/5",
      count: counts.quality,
      suffix: "%",
    },
  ];

  return (
    <section className="relative bg-[#FAF9F7] py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(15 107 87 / 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#0F6B57]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#C8A04D]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-4 font-display">
            Pourquoi Choisir
            <span className="block text-[#0F6B57]">
              NexMart?
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous nous engageons à vous offrir la meilleure expérience shopping possible
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 border border-[#ECECEC] hover:shadow-2xl transition-all group`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#111111] mb-2 font-display">{feature.title}</h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-6">{feature.description}</p>

              {/* Counter */}
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-[#111111]"
                >
                  {feature.count}
                </motion.span>
                <span className="text-lg text-gray-500">{feature.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <div className="bg-white rounded-3xl p-8 border border-[#ECECEC] shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
              {[
                { text: "Visa", color: "text-[#0F6B57]" },
                { text: "Mastercard", color: "text-[#C8A04D]" },
                { text: "PayPal", color: "text-[#0F6B57]" },
                { text: "Stripe", color: "text-[#C8A04D]" },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="text-center"
                >
                  <p className={`text-2xl font-bold ${badge.color}`}>{badge.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
