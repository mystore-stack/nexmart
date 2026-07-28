"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Gift } from "lucide-react";

interface BundleItem {
  name: string;
  image: string;
  price: number;
}

interface Bundle {
  id: string;
  title: string;
  items: BundleItem[];
  bundlePrice: number;
  originalPrice: number;
  savingsPercent: number;
  image: string;
}

const DEFAULT_BUNDLES: Bundle[] = [
  {
    id: "bundle-1",
    title: "Office Essentials",
    items: [
      {
        name: "Wireless Mouse",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=200",
        price: 299,
      },
      {
        name: "USB-C Cable",
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200",
        price: 99,
      },
      {
        name: "Laptop Stand",
        image: "https://images.unsplash.com/photo-1587829191301-c537c0b38b4f?w=200",
        price: 599,
      },
    ],
    bundlePrice: 799,
    originalPrice: 997,
    savingsPercent: 20,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?w=400",
  },
  {
    id: "bundle-2",
    title: "Smart Home Kit",
    items: [
      {
        name: "Smart Bulb",
        image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=200",
        price: 399,
      },
      {
        name: "Motion Sensor",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
        price: 299,
      },
      {
        name: "Hub Device",
        image: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=200",
        price: 899,
      },
    ],
    bundlePrice: 1299,
    originalPrice: 1597,
    savingsPercent: 19,
    image: "https://images.unsplash.com/photo-1558089456-84a3c82f4b2d?w=400",
  },
];

interface BundleDealsSectionProps {
  bundles?: Bundle[];
  onBundleClick?: (bundleId: string) => void;
}

export function BundleDealsSection({
  bundles = DEFAULT_BUNDLES,
  onBundleClick,
}: BundleDealsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
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
        🎁 Bundle Deals
      </motion.h2>

      <div className="space-y-4">
        {bundles.map((bundle) => (
          <motion.div
            key={bundle.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => onBundleClick?.(bundle.id)}
            className="relative rounded-2xl overflow-hidden bg-white border-2 border-neutral-100 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex gap-4 p-4">
              {/* Bundle image */}
              <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden">
                <img
                  src={bundle.image}
                  alt={bundle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-neutral-900 mb-1">
                  {bundle.title}
                </h3>

                {/* Items preview */}
                <p className="text-xs text-neutral-600 mb-2">
                  {bundle.items.length} items included
                </p>

                {/* Item grid preview */}
                <div className="flex gap-1 mb-2">
                  {bundle.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded overflow-hidden bg-neutral-100 border border-neutral-200"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-lg text-red-600">
                        {bundle.bundlePrice.toLocaleString("fr-MA")}
                      </span>
                      <span className="text-xs text-neutral-500 line-through">
                        {bundle.originalPrice.toLocaleString("fr-MA")}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold">
                      Save {bundle.savingsPercent}%
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-red-50 rounded-lg"
                  >
                    <ShoppingBag className="w-5 h-5 text-red-600" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
