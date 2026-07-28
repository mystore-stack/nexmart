"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatItem {
  value: string;
  label: string;
  icon: string;
}

const stats: StatItem[] = [
  {
    value: "10K+",
    label: "Products",
    icon: "🛍️",
  },
  {
    value: "24h",
    label: "Dispatch",
    icon: "🚚",
  },
  {
    value: "100%",
    label: "Secure",
    icon: "🔒",
  },
  {
    value: "99.8%",
    label: "Authentic",
    icon: "✓",
  },
];

export function TrustStatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative border-t border-b border-slate-200 bg-gradient-to-r from-slate-50 to-amber-50/50"
    >
      <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl">{stat.icon}</span>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
