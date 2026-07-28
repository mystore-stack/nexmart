"use client";

import { motion } from "framer-motion";
import { Shield, Truck, RotateCcw, CheckCircle } from "lucide-react";

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const TRUST_BADGES: TrustBadge[] = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Payment",
    description: "SSL encrypted checkout",
    color: "from-blue-50 to-cyan-50",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Fast Morocco Delivery",
    description: "1-3 business days",
    color: "from-green-50 to-emerald-50",
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: "Easy Returns",
    description: "30-day return policy",
    color: "from-purple-50 to-pink-50",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Verified Sellers",
    description: "100% authentic items",
    color: "from-amber-50 to-orange-50",
  },
];

export function TrustSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="px-4 py-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-xl font-black text-neutral-900 mb-4"
      >
        Why Trust NexStore
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-3"
      >
        {TRUST_BADGES.map((badge, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${badge.color} border-2 border-neutral-100 p-4 hover:shadow-lg transition-shadow`}
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/30 -mr-8 -mt-8" />

            {/* Content */}
            <div className="relative z-10 space-y-2">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-neutral-700"
              >
                {badge.icon}
              </motion.div>
              <h3 className="font-bold text-sm text-neutral-900">
                {badge.title}
              </h3>
              <p className="text-xs text-neutral-600">{badge.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200"
      >
        <p className="text-xs text-neutral-700 text-center">
          <strong>🇲🇦 NexStore Premium Marketplace</strong> — Your trusted global shopping destination with Moroccan touch. Real deals, real savings, real trust.
        </p>
      </motion.div>
    </motion.section>
  );
}
