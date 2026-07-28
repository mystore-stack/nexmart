"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, CheckCircle2 } from "lucide-react";

const defaultBadges = [
  {
    title: "Express Delivery",
    description: "24-48 hours across Morocco",
    color: "emerald" as const,
    icon: "truck",
  },
  {
    title: "Secure Payment",
    description: "SSL • CMI • Stripe encrypted",
    color: "blue" as const,
    icon: "shield",
  },
  {
    title: "Easy Returns",
    description: "30-day money-back guarantee",
    color: "amber" as const,
    icon: "return",
  },
  {
    title: "Verified Sellers",
    description: "100% authentic products",
    color: "green" as const,
    icon: "check",
  },
];

interface TrustSectionProps {
  badges?: typeof defaultBadges;
  title?: string;
  subtitle?: string;
}

const colorClasses = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-green-50 text-green-700 border-green-200",
};

const IconComponent = ({ name }: { name: string }) => {
  switch (name) {
    case "truck":
      return <Truck className="w-8 h-8" />;
    case "shield":
      return <Shield className="w-8 h-8" />;
    case "return":
      return <RotateCcw className="w-8 h-8" />;
    case "check":
      return <CheckCircle2 className="w-8 h-8" />;
    default:
      return null;
  }
};

export function TrustSection({
  badges = defaultBadges,
  title = "Why Shop With NexStore",
  subtitle = "We're committed to your safety and satisfaction",
}: TrustSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="w-full"
    >
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{title}</h2>
        <p className="text-base text-slate-600">{subtitle}</p>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {badges.map((badge, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${colorClasses[badge.color]}`}>
              <div className="mb-4 text-2xl">
                <IconComponent name={badge.icon} />
              </div>
              <h3 className="font-bold text-lg mb-2">{badge.title}</h3>
              <p className="text-sm opacity-80">{badge.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
